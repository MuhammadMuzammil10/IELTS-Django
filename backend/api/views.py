from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction, models
import openai, json, os, re, requests, time
# from elevenlabs import ElevenLabs
from django.conf import settings
from openai import OpenAI
from tests.models import ReadingTest, Question, TestResult, ListeningTest, ListeningSection, ListeningQuestion, ListeningUserResult, WritingTest, WritingTestSubmission
from .serializers import (
    ReadingTestSerializer, ReadingTestListSerializer, TestSubmissionSerializer,
    TestResultSerializer, TestResultDetailSerializer,
    ListeningTestSerializer, ListeningTestListSerializer, ListeningTestSubmissionSerializer,
    ListeningTestResultSerializer, ListeningTestResultDetailSerializer, GenerateListeningTestSerializer,
    WritingTestSerializer, WritingTestListSerializer, WritingTestSubmissionSerializer,
    WritingTestResultSerializer, WritingTestResultDetailSerializer, GenerateWritingTestSerializer
)
from users.serializers import UserRegistrationSerializer, UserProfileSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReadingTestListView(generics.ListAPIView):
    serializer_class = ReadingTestListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingTest.objects.filter(is_active=True).order_by('-created_at')


class ReadingTestDetailView(generics.RetrieveAPIView):
    serializer_class = ReadingTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ReadingTest.objects.filter(is_active=True)


class TestSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        try:
            test = ReadingTest.objects.get(id=test_id, is_active=True)
        except ReadingTest.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TestSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken')

        # Calculate correct answers
        correct_count = 0
        total_questions = test.questions.count()

        for question in test.questions.all():
            user_answer = answers.get(str(question.id), '').strip().lower()
            correct_answer = question.correct_answer.strip().lower()
            
            if user_answer == correct_answer:
                correct_count += 1

        # Calculate score
        score = (correct_count / total_questions) * 9.0 if total_questions > 0 else 0.0

        # Create test result
        with transaction.atomic():
            test_result = TestResult.objects.create(
                user=request.user,
                test=test,
                score=score,
                total_questions=total_questions,
                correct_answers=correct_count,
                answers=answers,
                completed_at=timezone.now(),
                time_taken=time_taken
            )

        return Response({
            'message': 'Test submitted successfully',
            'result_id': test_result.id,
            'score': score,
            'total_questions': total_questions,
            'correct_answers': correct_count
        }, status=status.HTTP_201_CREATED)


class TestResultListView(generics.ListAPIView):
    serializer_class = TestResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestResult.objects.filter(user=self.request.user).order_by('-completed_at')


class TestResultDetailView(generics.RetrieveAPIView):
    serializer_class = TestResultDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestResult.objects.filter(user=self.request.user)


class GenerateTestView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        if not settings.OPENAI_API_KEY:
            return Response({'error': 'OpenAI API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        openai.api_key = settings.OPENAI_API_KEY
        print("Generating test using OpenAI API...")  # Debug log
        print("openai key: ", settings.OPENAI_API_KEY)

        try:
            # Generate IELTS reading passage and questions
            prompt = """
            Generate an IELTS Academic Reading passage with 40 questions. The passage should be:
            - 800-1000 words long
            - Academic in nature (science, history, technology, etc.)
            - Suitable for IELTS level (B2-C1)

            Create exactly 40 questions with the following distribution:
            - 10 Matching questions (matching headings, features, etc.)
            - 10 True/False/Not Given questions
            - 10 Fill in the blanks questions
            - 10 Short answer questions

            Return the response in this exact JSON format:
            {
                "title": "Passage Title",
                "passage": "Full passage text here...",
                "questions": [
                    {
                        "id": 1,
                        "question": "Question text here?",
                        "type": "matching",
                        "choices": ["Option A", "Option B", "Option C", "Option D"],
                        "answer": "Option A"
                    },
                    {
                        "id": 2,
                        "question": "Question text here?",
                        "type": "true_false",
                        "choices": ["True", "False", "Not Given"],
                        "answer": "True"
                    },
                    {
                        "id": 3,
                        "question": "Fill in the blank: The main purpose of the study was to _____.",
                        "type": "fill_blank",
                        "answer": "analyze patterns"
                    },
                    {
                        "id": 4,
                        "question": "What year was the study conducted?",
                        "type": "short_answer",
                        "answer": "2020"
                    }
                ]
            }
            """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[
                    {"role": "system", "content": "You are an expert IELTS test creator. Generate high-quality academic reading passages and questions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.7
            )
            print("Response: ", response)

            content = response.choices[0].message.content
            data = json.loads(content)
            print("Data: ", data)
            # Create test in database
            with transaction.atomic():
                test = ReadingTest.objects.create(
                    title=data['title'],
                    passage=data['passage'],
                    created_by=request.user,
                    difficulty_level='medium'
                )

                for question_data in data['questions']:
                    Question.objects.create(
                        test=test,
                        question_text=question_data['question'],
                        question_type=question_data['type'],
                        choices=question_data.get('choices'),
                        correct_answer=question_data['answer'],
                        order=question_data['id']
                    )
            
            return Response({
                'message': 'Test generated successfully',
                'test': ReadingTestSerializer(test).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()  # shows full stack trace in console
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics for dashboard"""
    user = request.user
    
    # Reading test stats
    reading_results = TestResult.objects.filter(user=user)
    reading_count = reading_results.count()
    reading_avg_score = reading_results.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0
    
    # Listening test stats
    listening_results = ListeningUserResult.objects.filter(user=user)
    listening_count = listening_results.count()
    listening_avg_score = listening_results.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0
    
    # Writing test stats
    writing_results = WritingTestSubmission.objects.filter(user=user)
    writing_count = writing_results.count()
    writing_avg_score = writing_results.aggregate(avg_score=models.Avg('overall_band_score'))['avg_score'] or 0
    
    return Response({
        'reading_tests_taken': reading_count,
        'reading_avg_score': round(reading_avg_score, 1),
        'listening_tests_taken': listening_count,
        'listening_avg_score': round(listening_avg_score, 1),
        'writing_tests_taken': writing_count,
        'writing_avg_score': round(writing_avg_score, 1),
        'total_tests_taken': reading_count + listening_count + writing_count
    })


# Listening Module Views
class ListeningTestListView(generics.ListAPIView):
    print("Listening Test List View")
    serializer_class = ListeningTestListSerializer
    permission_classes = [permissions.IsAuthenticated]
    

    def get_queryset(self):
        print("Fetching active listening tests")
        listening_tests = ListeningTest.objects.filter(is_active=True).order_by('-created_at')
        print("Listening Tests: ", listening_tests)
        return listening_tests


class ListeningTestDetailView(generics.RetrieveAPIView):
    serializer_class = ListeningTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ListeningTest.objects.filter(is_active=True)


class ListeningTestSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        try:
            test = ListeningTest.objects.get(id=test_id, is_active=True)
        except ListeningTest.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListeningTestSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken')
        mode = serializer.validated_data.get('mode', 'exam')

        # Calculate correct answers
        correct_count = 0
        total_questions = 0

        for section in test.sections.all():
            for question in section.questions.all():
                total_questions += 1
                user_answer = answers.get(str(question.id), '').strip().lower()
                correct_answer = question.correct_answer.strip().lower()
                
                if user_answer == correct_answer:
                    correct_count += 1

        if total_questions > 0:
            score = (correct_count / total_questions) * 9.0  # Scale to IELTS band
        else:
            score = 0.0  # Default score when no questions answered

        # Create test result
        with transaction.atomic():
            test_result = ListeningUserResult.objects.create(
                user=request.user,
                test=test,
                score=score,
                total_questions=total_questions,
                correct_answers=correct_count,
                answers=answers,
                completed_at=timezone.now(),
                time_taken=time_taken,
                mode=mode
            )

        return Response({
            'message': 'Listening test submitted successfully',
            'result_id': test_result.id,
            'score': score,
            'total_questions': total_questions,
            'correct_answers': correct_count
        }, status=status.HTTP_201_CREATED)


class ListeningTestResultListView(generics.ListAPIView):
    serializer_class = ListeningTestResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Or your custom pagination

    def get_queryset(self):
        try:
            return ListeningUserResult.objects.filter(
                user=self.request.user
            ).select_related(
                'test', 'user'
            ).prefetch_related(
                'test__sections',
                'test__sections__questions'
            ).order_by('-completed_at')
        except Exception as e:
            print(f"Error fetching test results: {str(e)}")
            return ListeningUserResult.objects.none()


class ListeningTestResultDetailView(generics.RetrieveAPIView):
    serializer_class = ListeningTestResultDetailSerializer
    permission_classes = [permissions.IsAuthenticated]  

    def get_queryset(self):
        return ListeningUserResult.objects.filter(user=self.request.user)


# class GenerateListeningTestView(APIView):
#     permission_classes = [permissions.IsAdminUser]

#     def post(self, request):
#         try:
#             serializer = GenerateListeningTestSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             difficulty_level = serializer.validated_data['difficulty_level']
#             include_audio = serializer.validated_data['include_audio']

#             client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
#             # Generate listening test with 4 sections
#             prompt = f"""
#             You are an IELTS Listening test generator. Create 4 sections of IELTS listening transcripts, each with exactly 10 questions. 
#             Follow official IELTS question types: Multiple Choice, Matching, Plan/Map/Diagram Labeling, Completion (form/note/table/flowchart), 
#             Sentence Completion, and Short Answer. Provide correct answers. Write transcripts in natural IELTS style and ensure difficulty 
#             increases by section. The difficulty level should be {difficulty_level}.
            
#             Return JSON in this format:
#             {{
#                 "sections": [
#                     {{
#                         "section_number": <number>,
#                         "title": "Section title",
#                         "audio_transcript": "...",
#                         "instructions": "Section instructions",
#                         "questions": [
#                             {{
#                                 "id": <number>,
#                                 "type": "radio|text|multi-choice|dropdown|labeling|completion|sentence_completion|short_answer",
#                                 "question": "...",
#                                 "choices": ["..."],
#                                 "answer": "..."
#                             }}
#                         ]
#                     }}
#                 ]
#             }}
#             """
            
#             response = client.chat.completions.create(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {"role": "system", "content": "You are an IELTS Listening test generator. Create realistic listening transcripts with appropriate questions."},
#                     {"role": "user", "content": prompt}
#                 ],
#                 temperature=0.7
#             )
            
#             content = response.choices[0].message.content
#             data = json.loads(content)
            
#             # Generate audio using TTS if requested
#             if include_audio:
#                 # For now, we'll use placeholder audio URLs
#                 # In production, you would integrate with TTS service like OpenAI TTS or ElevenLabs
#                 audio_urls = [
#                     "https://example.com/audio/section1.mp3",
#                     "https://example.com/audio/section2.mp3", 
#                     "https://example.com/audio/section3.mp3",
#                     "https://example.com/audio/section4.mp3"
#                 ]
#             else:
#                 audio_urls = [None] * 4
            
#             # Create test in database
#             with transaction.atomic():
#                 test = ListeningTest.objects.create(
#                     title=f"IELTS Listening Test - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
#                     difficulty_level=difficulty_level,
#                     created_by=request.user
#                 )
                
#                 for section_data in data['sections']:
#                     section = ListeningSection.objects.create(
#                         test=test,
#                         section_number=section_data['section_number'],
#                         title=section_data['title'],
#                         transcript=section_data['audio_transcript'],
#                         instructions=section_data.get('instructions', ''),
#                         audio_url=audio_urls[section_data['section_number'] - 1] if include_audio else None
#                     )
                    
#                     for q_data in section_data['questions']:
#                         ListeningQuestion.objects.create(
#                             section=section,
#                             question_text=q_data['question'],
#                             question_type=q_data['type'],
#                             choices=q_data.get('choices'),
#                             correct_answer=q_data['answer'],
#                             order=q_data['id']
#                         )
            
#             return Response({
#                 'message': 'Listening test generated successfully',
#                 'test_id': test.id,
#                 'title': test.title,
#                 'sections_count': len(data['sections'])
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             print("Error generating listening test:", e)
#             return Response({
#                 'error': f'Failed to generate listening test: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
            
class GenerateListeningTestView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            serializer = GenerateListeningTestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            difficulty_level = serializer.validated_data['difficulty_level']
            include_audio = serializer.validated_data['include_audio']

            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Generate listening test content (same as before)
            prompt =  f"""
                You are an IELTS Listening test generator. Create 4 sections of IELTS listening transcripts, each with exactly 10 questions. 
                Follow official IELTS structure and question types. Ensure difficulty increases by section. Difficulty: {difficulty_level}.

                STRUCTURE:
                - Section 1: Casual conversation (social context)
                - Section 2: Monologue (social context)
                - Section 3: Academic conversation (2-4 speakers)
                - Section 4: Academic lecture (monologue)

                FORMAT REQUIREMENTS:
                1. audio_transcript MUST be the actual spoken content (dialogue or monologue) that test-takers would hear
                2. Transcripts should be natural, authentic English with hesitations and natural speech patterns
                3. Do NOT include instructions or question text in the audio_transcript
                4. Ensure each section has exactly 10 questions
                5. Questions should be based ONLY on information in the audio_transcript

                Return JSON in this format:
                {{
                    "sections": [
                        {{
                            "section_number": 1,
                            "title": "Section 1 Title",
                            "audio_transcript": "ACTUAL SPOKEN CONTENT...",
                            "instructions": "Instructions for test-takers",
                            "questions": [
                                {{
                                    "id": 1,
                                    "type": "radio|text|multi-choice|dropdown|labeling|completion|sentence_completion|short_answer",
                                    "question": "Question text",
                                    "choices": ["Option 1", "Option 2"],
                                    "answer": "Correct answer"
                                }}
                            ]
                        }}
                    ]
                }}

                EXAMPLE SECTION 1 TRANSCRIPT:
                "Woman: Good morning, City Library. How can I help you?
                Man: Hi, I'd like to renew my membership. My card number is HL-45892.
                Woman: Certainly. Could I have your full name please?
                Man: Yes, it's Thomas Richardson.
                Woman: Thank you Mr. Richardson. I see your membership expires next month. Would you like to renew for one year?
                Man: Actually, could I do six months? I might be traveling soon.
                Woman: Of course. That'll be £15 for six months. How would you like to pay?
                ..."

                EXAMPLE SECTION 4 TRANSCRIPT:
                "Lecturer: Today we'll examine coral reef ecosystems. Coral reefs, often called the 'rainforests of the sea', occupy less than 0.1% of ocean area yet support 25% of marine species. The primary reef-building organisms are scleractinian corals which secrete calcium carbonate skeletons. These structures provide habitat complexity essential for biodiversity..."
                """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an IELTS test content expert. Generate realistic listening test materials."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.5
            )
            # print("Response from OpenAI:", response)  # Debug log
            content = response.choices[0].message.content
            print("Generated content:", content)  # Debug log
            print("Content type:", type(content))
            data = json.loads(content)
            # data = {'sections': [{'section_number': 1, 'title': 'Section 1: Social Events', 'audio_transcript': 'In this section, you will hear a conversation between two friends discussing social events. Listen carefully and answer the following questions.', 'instructions': 'You will hear the conversation only once. Choose the best answer for each question.', 'questions': [{'id': 1, 'type': 'multiple_choice', 'question': 'What is the main purpose of the conversation?', 'choices': ['To plan a birthday party', 'To discuss upcoming events', 'To study for exams'], 'answer': 'To discuss upcoming events'}, {'id': 2, 'type': 'sentence_completion', 'question': 'The friend suggests going to the _______ event next weekend.', 'answer': 'art exhibition'}, {'id': 3, 'type': 'short_answer', 'question': 'What time does the concert start?', 'answer': '7:30 PM'}, {'id': 4, 'type': 'multiple_choice', 'question': 'Where will the dance competition take place?', 'choices': ['At the community center', 'At the park', 'At the school gym'], 'answer': 'At the community center'}, {'id': 5, 'type': 'sentence_completion', 'question': 'The friend suggests going to the _______ for the birthday celebration.', 'answer': 'beach'}, {'id': 6, 'type': 'multiple_choice', 'question': 'What does the friend recommend for the birthday party?', 'choices': ['A barbecue', 'A potluck dinner', 'A fancy restaurant'], 'answer': 'A barbecue'}, {'id': 7, 'type': 'short_answer', 'question': 'What does the friend need to bring for the picnic?', 'answer': 'drinks'}, {'id': 8, 'type': 'multiple_choice', 'question': 'When is the movie night happening?', 'choices': ['Friday', 'Saturday', 'Sunday'], 'answer': 'Saturday'}, {'id': 9, 'type': 'sentence_completion', 'question': 'The friend suggests watching a _______ movie at the film night.', 'answer': 'comedy'}, {'id': 10, 'type': 'short_answer', 'question': 'What time should the friend arrive for the karaoke event?', 'answer': '8:00 PM'}]}, {'section_number': 2, 'title': 'Section 2: Tourist Attractions', 'audio_transcript': 'You will hear a tour guide talking about various tourist attractions in the city. Listen carefully and answer the following questions.', 'instructions': 'You will hear the talk only once. Match each attraction with the correct description.', 'questions': [{'id': 1, 'type': 'matching', 'question': 'Match the tourist attractions with the descriptions.', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'B. Botanical Gardens'}, {'id': 2, 'type': 'matching', 'question': 'Which attraction is described as having a variety of exotic plants and flowers?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'B. Botanical Gardens'}, {'id': 3, 'type': 'matching', 'question': 'Which attraction offers a panoramic view of the city?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'C. Observation Tower'}, {'id': 4, 'type': 'matching', 'question': 'Which attraction is known for its collection of ancient artifacts?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'A. Museum of History'}, {'id': 5, 'type': 'matching', 'question': 'Which attraction is mentioned as a popular spot for photography enthusiasts?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'C. Observation Tower'}, {'id': 6, 'type': 'matching', 'question': 'Which attraction is free for visitors under 16 years old?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'A. Museum of History'}, {'id': 7, 'type': 'matching', 'question': 'Which attraction is mentioned as a great place to relax and enjoy nature?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'B. Botanical Gardens'}, {'id': 8, 'type': 'matching', 'question': 'Which attraction is located near the city center?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'C. Observation Tower'}, {'id': 9, 'type': 'matching', 'question': 'Which attraction is mentioned as having interactive exhibits?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'A. Museum of History'}, {'id': 10, 'type': 'matching', 'question': 'Which attraction is recommended for history buffs?', 'choices': ['A. Museum of History', 'B. Botanical Gardens', 'C. Observation Tower'], 'answer': 'A. Museum of History'}]}, {'section_number': 3, 'title': 'Section 3: City Map Directions', 'audio_transcript': 'You will hear a guide giving directions to various locations on a city map. Listen carefully and label the map accordingly.', 'instructions': 'You will hear the instructions only once. Label the map with the correct location based on the directions given.', 'questions': [{'id': 1, 'type': 'labeling', 'question': 'Label the map with the location of the library.', 'answer': 'B'}, {'id': 2, 'type': 'labeling', 'question': 'Mark the spot on the map where the park is located.', 'answer': 'D'}, {'id': 3, 'type': 'labeling', 'question': 'Identify the place on the map where the train station is situated.', 'answer': 'A'}, {'id': 4, 'type': 'labeling', 'question': 'Find the location on the map for the shopping center.', 'answer': 'C'}, {'id': 5, 'type': 'labeling', 'question': 'Label the map with the position of the hospital.', 'answer': 'E'}, {'id': 6, 'type': 'labeling', 'question': 'Mark the spot on the map where the cinema is located.', 'answer': 'F'}, {'id': 7, 'type': 'labeling', 'question': 'Identify the place on the map where the post office is situated.', 'answer': 'H'}, {'id': 8, 'type': 'labeling', 'question': 'Find the location on the map for the restaurant.', 'answer': 'G'}, {'id': 9, 'type': 'labeling', 'question': 'Label the map with the position of the bank.', 'answer': 'I'}, {'id': 10, 'type': 'labeling', 'question': 'Mark the spot on the map where the university is located.', 'answer': 'J'}]}, {'section_number': 4, 'title': 'Section 4: Health and Well-being', 'audio_transcript': 'Listen to a discussion between a health expert and a client about strategies for maintaining health and well-being. Answer the following questions.', 'instructions': 'You will hear the discussion only once. Complete the sentences with the missing words.', 'questions': [{'id': 1, 'type': 'sentence_completion', 'question': 'To maintain a healthy lifestyle, it is important to have a balanced _______.', 'answer': 'diet'}, {'id': 2, 'type': 'sentence_completion', 'question': 'Regular exercise can help improve physical _______ and mental well-being.', 'answer': 'fitness'}, {'id': 3, 'type': 'sentence_completion', 'question': 'Getting an adequate amount of _______ is essential for overall health.', 'answer': 'sleep'}, {'id': 4, 'type': 'sentence_completion', 'question': 'Limiting the intake of sugary drinks can benefit your _______ health.', 'answer': 'dental'}, {'id': 5, 'type': 'sentence_completion', 'question': 'Engaging in activities that reduce stress can improve your _______.', 'answer': 'well-being'}, {'id': 6, 'type': 'sentence_completion', 'question': 'Taking regular breaks during work can enhance your overall _______.', 'answer': 'productivity'}, {'id': 7, 'type': 'sentence_completion', 'question': "It's important to stay hydrated to maintain good _______ function.", 'answer': 'kidney'}, {'id': 8, 'type': 'sentence_completion', 'question': 'Regular health check-ups are essential for early _______ of any health issues.', 'answer': 'detection'}, {'id': 9, 'type': 'sentence_completion', 'question': 'Practicing mindfulness and meditation can help improve mental _______.', 'answer': 'clarity'}, {'id': 10, 'type': 'sentence_completion', 'question': 'Maintaining social connections is important for your emotional _______.', 'answer': 'well-being'}]}]}
            print("Parsed data:", data)  # Debug log
            
            # Generate real audio files if requested
            audio_urls = []
            audio_files = {}
            if include_audio:
                for section in data['sections']:
                    try:
                        
                        transcript = section.get('audio_transcript', '')
                        print(f"Transcript for section {section['section_number']}: {transcript}")
                        if not transcript:
                            print(f"No transcript available for section {section['section_number']}")
                            continue
                        # Generate speech using OpenAI TTS
                        tts_response = client.audio.speech.create(
                            model="tts-1",
                            voice="alloy",  # Options: alloy, echo, fable, onyx, nova, shimmer
                            input=transcript
                        )
                        print(f"Generated audio for section {section['section_number']}")
                        # Store audio content temporarily
                        audio_files[section['section_number']] = ContentFile(
                            tts_response.content,
                            name=f"section_{section['section_number']}.mp3"
                        )
                        
                        # Create a temporary file in memory
                        audio_content = ContentFile(tts_response.content)
                    except Exception as e:
                        print(f"Error generating audio for section {section['section_number']}: {e}")
                        audio_content = None
            else:
                audio_urls = [None] * 4
            
            # Create test in database (same as before)
            with transaction.atomic():
                test = ListeningTest.objects.create(
                    title=f"IELTS Listening Test - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                    difficulty_level=difficulty_level,
                    created_by=request.user
                )
                
                for section in data['sections']:
                    section_obj = ListeningSection.objects.create(
                        test=test,
                        section_number=section.get('section_number', 0),
                        title=section.get('title', 'Untitled Section'),
                        transcript=section.get('audio_transcript', ''),
                        instructions=section.get('instructions', ''),
                        # audio_url=audio_urls[section['section_number'] - 1] if include_audio else None
                    )
                    
                    # Attach audio file if generated
                    if include_audio and section['section_number'] in audio_files:
                        section_obj.audio_file.save(
                            f"section_{section['section_number']}.mp3",
                            audio_files[section['section_number']]
                        )
                        section_obj.save()  # Ensure file is saved
                    
                    # Create questions
                    for q_data in section.get('questions', []):
                        ListeningQuestion.objects.create(
                            section=section_obj,  # Use the model instance
                            question_text=q_data.get('question', ''),
                            question_type=q_data.get('type', 'text'),
                            choices=q_data.get('choices', []),
                            correct_answer=q_data.get('answer', ''),
                            order=q_data.get('id', 0)
                        )
            
            return Response({
                'success': True,
                'message': 'Listening test generated successfully',
                'test_id': test.id,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("Error generating listening test:", e)
            # traceback.print_exc()  # Add this for detailed error logging
            return Response({
                'error': f'Failed to generate listening test: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Writing Module Views
class WritingTestListView(generics.ListAPIView):
    serializer_class = WritingTestListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WritingTest.objects.filter(is_active=True).order_by('-created_at')


class WritingTestDetailView(generics.RetrieveAPIView):
    serializer_class = WritingTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WritingTest.objects.filter(is_active=True)


class WritingTestSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        try:
            test = WritingTest.objects.get(id=test_id, is_active=True)
        except WritingTest.DoesNotExist:
            return Response({'error': 'Writing test not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = WritingTestSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        task1_answer = serializer.validated_data['task1_answer']
        task2_answer = serializer.validated_data['task2_answer']
        task1_time_taken = serializer.validated_data.get('task1_time_taken')
        task2_time_taken = serializer.validated_data.get('task2_time_taken')

        # Create submission record
        with transaction.atomic():
            submission = WritingTestSubmission.objects.create(
                user=request.user,
                test=test,
                task1_answer=task1_answer,
                task2_answer=task2_answer,
                task1_time_taken=task1_time_taken,
                task2_time_taken=task2_time_taken
            )

        # Evaluate using OpenAI
        try:
            evaluation_result = self.evaluate_writing_with_openai(
                task1_answer, task2_answer, 
                test.task1_image_description, test.task2_essay_prompt
            )
            
            # Update submission with evaluation results
            submission.task1_score = evaluation_result['task1']['score']
            submission.task1_feedback = evaluation_result['task1']['feedback']
            submission.task2_score = evaluation_result['task2']['score']
            submission.task2_feedback = evaluation_result['task2']['feedback']
            submission.overall_band_score = evaluation_result['overall_band_score']
            submission.task1_criteria = evaluation_result.get('task1_criteria', {})
            submission.task2_criteria = evaluation_result.get('task2_criteria', {})
            submission.evaluated_at = timezone.now()
            submission.save()

            return Response({
                'message': 'Writing test submitted and evaluated successfully',
                'submission_id': submission.id,
                'evaluation': evaluation_result
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Failed to evaluate writing: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def evaluate_writing_with_openai(self, task1_answer, task2_answer, task1_description, task2_prompt):
        """Evaluate writing using OpenAI as IELTS examiner"""
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        evaluation_prompt = f"""
        You are a certified IELTS examiner. Please evaluate the following writing tasks according to IELTS criteria:

        TASK 1:
        Original Task Description: {task1_description}
        Student's Answer: {task1_answer}

        TASK 2:
        Original Essay Prompt: {task2_prompt}
        Student's Answer: {task2_answer}

        Please evaluate both tasks based on these IELTS criteria:
        1. Task Achievement / Task Response (0-9)
        2. Coherence and Cohesion (0-9)
        3. Lexical Resource (0-9)
        4. Grammatical Range and Accuracy (0-9)

        Return your evaluation in this exact JSON format:
        {{
            "task1": {{
                "score": 7.5,
                "feedback": "Detailed feedback for Task 1..."
            }},
            "task2": {{
                "score": 8.0,
                "feedback": "Detailed feedback for Task 2..."
            }},
            "overall_band_score": 7.5,
            "task1_criteria": {{
                "task_achievement": 7.5,
                "coherence_cohesion": 7.0,
                "lexical_resource": 8.0,
                "grammatical_range": 7.5
            }},
            "task2_criteria": {{
                "task_response": 8.0,
                "coherence_cohesion": 8.0,
                "lexical_resource": 8.0,
                "grammatical_range": 8.0
            }}
        }}
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a certified IELTS examiner with extensive experience in evaluating writing tasks. Provide detailed, constructive feedback."},
                {"role": "user", "content": evaluation_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        content = response.choices[0].message.content
        return json.loads(content)


class WritingTestResultListView(generics.ListAPIView):
    serializer_class = WritingTestResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WritingTestSubmission.objects.filter(user=self.request.user).order_by('-submitted_at')


class WritingTestResultDetailView(generics.RetrieveAPIView):
    serializer_class = WritingTestResultDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WritingTestSubmission.objects.filter(user=self.request.user)


class GenerateWritingTestView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            serializer = GenerateWritingTestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            difficulty_level = serializer.validated_data['difficulty_level']
            task1_type = serializer.validated_data['task1_type']
            task2_type = serializer.validated_data['task2_type']

            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Generate writing test content
            test_data = self.generate_writing_test_with_openai(client, difficulty_level, task1_type, task2_type)
            
            # Create test in database
            with transaction.atomic():
                test = WritingTest.objects.create(
                    title=f"IELTS Writing Test - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                    difficulty_level=difficulty_level,
                    created_by=request.user,
                    task1_image=test_data['task1']['image'],
                    task1_image_description=test_data['task1']['image_description'],
                    task1_type=test_data['task1']['type'],
                    task2_essay_prompt=test_data['task2']['essay_prompt'],
                    task2_type=test_data['task2']['type']
                )

            return Response({
                'success': True,
                'message': 'Writing test generated successfully',
                'test_id': test.id,
                'test': WritingTestSerializer(test).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("Error generating writing test:", e)
            return Response({
                'error': f'Failed to generate writing test: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_writing_test_with_openai(self, client, difficulty_level, task1_type, task2_type):
        """Generate writing test using OpenAI"""
        import random
        
        # Randomize task types if 'random' is selected
        if task1_type == 'random':
            task1_type = random.choice(['graph', 'chart', 'table', 'diagram', 'map'])
        if task2_type == 'random':
            task2_type = random.choice(['opinion', 'problem_solution', 'discussion', 'advantage_disadvantage'])

        # Generate Task 1 content
        task1_prompt = f"""
        Generate an IELTS Writing Task 1 {task1_type} for {difficulty_level} difficulty level.
        
        Create a detailed description of a {task1_type} that would be suitable for IELTS Writing Task 1.
        The description should include:
        - Clear data points, trends, or processes
        - Specific numbers, percentages, or categories
        - Time periods or comparisons
        - Sufficient detail for a 150-word response
        
        Return in this JSON format:
        {{
            "type": "{task1_type}",
            "image_description": "Detailed description of the {task1_type} with specific data points, trends, and comparisons that a student would need to describe in 150 words."
        }}
        """

        task1_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an IELTS test content expert. Generate realistic writing task descriptions."},
                {"role": "user", "content": task1_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )

        task1_data = json.loads(task1_response.choices[0].message.content)

        # Generate Task 2 content
        task2_prompt = f"""
        Generate an IELTS Writing Task 2 {task2_type} essay prompt for {difficulty_level} difficulty level.
        
        Create an essay question that requires the student to:
        - Write at least 250 words
        - Address the specific task type: {task2_type}
        - Present clear arguments and examples
        - Use appropriate academic language
        
        Return in this JSON format:
        {{
            "type": "{task2_type}",
            "essay_prompt": "The complete essay question/prompt that students need to respond to."
        }}
        """

        task2_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an IELTS test content expert. Generate realistic essay prompts."},
                {"role": "user", "content": task2_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )

        task2_data = json.loads(task2_response.choices[0].message.content)

        # Generate image using DALL-E
        image_prompt = f"Create a professional IELTS-style {task1_type} showing {task1_data['image_description'][:100]}..."
        # # for openai image
        # try:
        #     image_response = client.images.generate(
        #         model="dall-e-3",
        #         prompt=image_prompt,
        #         size="1024x1024",
        #         quality="standard",
        #         n=1
        #     )
        #     image_url = image_response.data[0].url
        # except Exception as e:
        #     print(f"Error generating image: {e}")
        #     # Fallback to a placeholder or base64 encoded simple chart
        #     image_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoYXJ0IFBsYWNlaG9sZGVyPC90ZXh0Pgo8L3N2Zz4K"
        
        import requests, time

        try:
            # Step 1: Submit generation task
            url = "https://api.kie.ai/api/v1/gpt4o-image/generate"
            headers = {
                "Authorization": "Bearer 377f0ece01c2e813c49b8a4f77b61221",
                "Content-Type": "application/json"
            }
            payload = {
                "prompt": image_prompt,
                "size": "1:1",
                "nVariants": 1
            }

            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            print("Generation Response:", data)

            task_id = data["data"]["taskId"]

            # Step 2: Poll until image ready
            status_url = f"https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId={task_id}"
            image_url = None

            for _ in range(20):  # max 10 tries
                status_resp = requests.get(status_url, headers={"Authorization": "Bearer 377f0ece01c2e813c49b8a4f77b61221"})
                status_data = status_resp.json()
                print("Status Response:", status_data)

                task_data = status_data.get("data", {})
                if task_data.get("successFlag") == 1:  # Success
                    result_urls = task_data["response"]["resultUrls"]
                    if result_urls:
                        image_url = result_urls[0]
                    break
                elif task_data.get("successFlag") == 2:  # Failed
                    raise Exception(f"Generation failed: {task_data.get('errorMessage')}")
                else:
                    time.sleep(5)  # wait before retrying

            if not image_url:
                raise Exception("Image not generated in time")

        except Exception as e:
            print(f"Error generating image: {e}")
            image_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoYXJ0IFBsYWNlaG9sZGVyPC90ZXh0Pgo8L3N2Zz4K"


        return {
            'task1': {
                'type': task1_data['type'],
                'image': image_url,
                'image_description': task1_data['image_description']
            },
            'task2': {
                'type': task2_data['type'],
                'essay_prompt': task2_data['essay_prompt']
            }
        }