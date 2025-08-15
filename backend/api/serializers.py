from rest_framework import serializers
from tests.models import ReadingTest, Question, TestResult, ListeningTest, ListeningSection, ListeningQuestion, ListeningUserResult
from users.serializers import UserProfileSerializer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'choices', 'order', 'points']


class ReadingTestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by = UserProfileSerializer(read_only=True)

    class Meta:
        model = ReadingTest
        fields = ['id', 'title', 'passage', 'difficulty_level', 'is_active', 'created_at', 'created_by', 'questions']


class ReadingTestListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = ReadingTest
        fields = ['id', 'title', 'difficulty_level', 'is_active', 'created_at', 'question_count']

    def get_question_count(self, obj):
        return obj.questions.count()


class TestSubmissionSerializer(serializers.Serializer):
    answers = serializers.JSONField()
    time_taken = serializers.DurationField(required=False)


class TestResultSerializer(serializers.ModelSerializer):
    test = ReadingTestListSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = ['id', 'test', 'user', 'score', 'total_questions', 'correct_answers', 'started_at', 'completed_at', 'time_taken']


class TestResultDetailSerializer(serializers.ModelSerializer):
    test = ReadingTestSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)
    answers_detail = serializers.SerializerMethodField()

    class Meta:
        model = TestResult
        fields = ['id', 'test', 'user', 'score', 'total_questions', 'correct_answers', 'answers', 'answers_detail', 'started_at', 'completed_at', 'time_taken']

    def get_answers_detail(self, obj):
        """Return detailed answer comparison"""
        details = []
        for question in obj.test.questions.all():
            user_answer = obj.answers.get(str(question.id), '')
            is_correct = str(user_answer).strip().lower() == str(question.correct_answer).strip().lower()
            
            details.append({
                'question_id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'user_answer': user_answer,
                'correct_answer': question.correct_answer,
                'is_correct': is_correct,
                'points': question.points
            })
        return details


# Listening Module Serializers
class ListeningQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeningQuestion
        fields = ['id', 'question_text', 'question_type', 'choices', 'order', 'points', 'image_url', 'additional_data']


class ListeningSectionSerializer(serializers.ModelSerializer):
    questions = ListeningQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ListeningSection
        fields = ['id', 'section_number', 'title', 'audio_file', 'audio_url', 'transcript', 'instructions', 'questions']


class ListeningTestSerializer(serializers.ModelSerializer):
    sections = ListeningSectionSerializer(many=True, read_only=True)
    created_by = UserProfileSerializer(read_only=True)

    class Meta:
        model = ListeningTest
        fields = ['id', 'title', 'difficulty_level', 'is_active', 'created_at', 'created_by', 'total_duration', 'sections']


class ListeningTestListSerializer(serializers.ModelSerializer):
    section_count = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = ListeningTest
        fields = ['id', 'title', 'difficulty_level', 'is_active', 'created_at', 'total_duration', 'section_count', 'total_questions']

    def get_section_count(self, obj):
        return obj.sections.count()

    def get_total_questions(self, obj):
        return sum(section.questions.count() for section in obj.sections.all())


class ListeningTestSubmissionSerializer(serializers.Serializer):
    answers = serializers.JSONField()
    time_taken = serializers.DurationField(required=False)
    mode = serializers.ChoiceField(choices=[('practice', 'Practice Mode'), ('exam', 'Exam Mode')], default='exam')


class ListeningTestResultSerializer(serializers.ModelSerializer):
    test = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()
    correct_answers = serializers.SerializerMethodField()

    class Meta:
        model = ListeningUserResult
        fields = ['id', 'test', 'user', 'score', 'total_questions', 'correct_answers', 
                 'started_at', 'completed_at', 'time_taken', 'mode']

    def get_test(self, obj):
        """Safe test serialization with null check"""
        if hasattr(obj, 'test') and obj.test:
            return ListeningTestListSerializer(obj.test).data
        return {
            'id': None,
            'title': 'Test not available',
            'difficulty_level': 'unknown'
        }

    def get_user(self, obj):
        """Safe user serialization"""
        if hasattr(obj, 'user') and obj.user:
            return UserProfileSerializer(obj.user).data
        return {
            'id': None,
            'username': 'Unknown user',
            'email': ''
        }

    def get_score(self, obj):
        """Ensure score is always a float"""
        return float(getattr(obj, 'score', 0.0))

    def get_total_questions(self, obj):
        """Calculate total questions if not set"""
        if hasattr(obj, 'total_questions') and obj.total_questions is not None:
            return int(obj.total_questions)
        if hasattr(obj, 'test') and obj.test:
            return sum(section.questions.count() for section in obj.test.sections.all())
        return 0

    def get_correct_answers(self, obj):
        """Ensure correct_answers is always an integer"""
        return int(getattr(obj, 'correct_answers', 0))
    
    
class ListeningTestResultDetailSerializer(serializers.ModelSerializer):
    test = ListeningTestSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)
    answers_detail = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    correct_answers = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = ListeningUserResult
        fields = ['id', 'test', 'user', 'score', 'total_questions', 'correct_answers', 
                 'answers', 'answers_detail', 'started_at', 'completed_at', 'time_taken', 'mode']

    def get_score(self, obj):
        """Ensure score is always a float"""
        return float(getattr(obj, 'score', 0.0))

    def get_correct_answers(self, obj):
        """Ensure correct_answers is always an integer"""
        return int(getattr(obj, 'correct_answers', 0))

    def get_total_questions(self, obj):
        """Calculate total questions if not set"""
        if hasattr(obj, 'total_questions') and obj.total_questions is not None:
            return int(obj.total_questions)
        if hasattr(obj, 'test') and obj.test:
            return sum(section.questions.count() for section in obj.test.sections.all())
        return 0

    def get_answers_detail(self, obj):
        """Return detailed answer comparison with null safety"""
        details = []
        
        # Check if test exists and has sections
        if not hasattr(obj, 'test') or not obj.test:
            return details
            
        try:
            for section in getattr(obj.test, 'sections', []).all():
                for question in getattr(section, 'questions', []).all():
                    user_answer = str(obj.answers.get(str(question.id), '')).strip().lower()
                    correct_answer = str(getattr(question, 'correct_answer', '')).strip().lower()
                    
                    details.append({
                        'section_number': getattr(section, 'section_number', 0),
                        'question_id': getattr(question, 'id', 0),
                        'question_text': getattr(question, 'question_text', ''),
                        'question_type': getattr(question, 'question_type', 'text'),
                        'user_answer': user_answer if user_answer else 'No answer',
                        'correct_answer': correct_answer if correct_answer else 'Not available',
                        'is_correct': user_answer == correct_answer,
                        'points': float(getattr(question, 'points', 0.0))
                    })
        except Exception as e:
            print(f"Error generating answer details: {str(e)}")
            
        return details

class GenerateListeningTestSerializer(serializers.Serializer):
    difficulty_level = serializers.ChoiceField(choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')], default='medium')
    include_audio = serializers.BooleanField(default=True) 