from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class ReadingTest(models.Model):
    QUESTION_TYPES = [
        ('matching', 'Matching'),
        ('true_false', 'True/False/Not Given'),
        ('fill_blank', 'Fill in the Blanks'),
        ('short_answer', 'Short Answer'),
    ]

    title = models.CharField(max_length=200)
    passage = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'reading_tests'


class Question(models.Model):
    QUESTION_TYPES = [
        ('matching', 'Matching'),
        ('true_false', 'True/False/Not Given'),
        ('fill_blank', 'Fill in the Blanks'),
        ('short_answer', 'Short Answer'),
    ]

    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    choices = models.JSONField(null=True, blank=True)  # For matching and multiple choice
    correct_answer = models.TextField()
    order = models.PositiveIntegerField()
    points = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.test.title} - Question {self.order}"

    class Meta:
        db_table = 'questions'
        ordering = ['order']


class TestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_results')
    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE, related_name='results')
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    answers = models.JSONField()  # Store user's answers
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.test.title} - {self.score}"

    def calculate_score(self):
        """Calculate score based on correct answers"""
        if self.total_questions > 0:
            percentage = (self.correct_answers / self.total_questions) * 100
            # Convert to IELTS band score (simplified conversion)
            if percentage >= 90:
                return 9.0
            elif percentage >= 80:
                return 8.0
            elif percentage >= 70:
                return 7.0
            elif percentage >= 60:
                return 6.0
            elif percentage >= 50:
                return 5.0
            elif percentage >= 40:
                return 4.0
            else:
                return 3.0
        return 0.0

    class Meta:
        db_table = 'test_results'
        ordering = ['-completed_at']


# Listening Module Models
class ListeningTest(models.Model):
    title = models.CharField(max_length=200, default="IELTS Listening Test")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    total_duration = models.PositiveIntegerField(default=30)  # minutes

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'listening_tests'
        ordering = ['-created_at']


class ListeningSection(models.Model):
    test = models.ForeignKey(ListeningTest, on_delete=models.CASCADE, related_name='sections')
    section_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    audio_url = models.URLField(max_length=500, blank=True, null=True)  # URL to the audio file
    audio_file = models.FileField(upload_to='listening_audios/', blank=True, null=True)  # Updated to FileField
    transcript = models.TextField()
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test.title} - Section {self.section_number}"

    class Meta:
        db_table = 'listening_sections'
        ordering = ['section_number']
        unique_together = ['test', 'section_number']


class ListeningQuestion(models.Model):
    QUESTION_TYPES = [
        ('radio', 'Multiple Choice'),
        ('dropdown', 'Matching/Dropdown'),
        ('text', 'Text Input'),
        ('multi_choice', 'Multiple Choice (Checkbox)'),
        ('labeling', 'Plan/Map/Diagram Labeling'),
        ('completion', 'Form/Note/Table/Flowchart Completion'),
        ('sentence_completion', 'Sentence Completion'),
        ('short_answer', 'Short Answer'),
    ]

    section = models.ForeignKey(ListeningSection, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    choices = models.JSONField(null=True, blank=True)  # For multiple choice, dropdown, etc.
    correct_answer = models.TextField()
    order = models.PositiveIntegerField()
    points = models.PositiveIntegerField(default=1)
    image_url = models.URLField(max_length=500, null=True, blank=True)  # For labeling questions
    additional_data = models.JSONField(null=True, blank=True)  # For extra question data

    def __str__(self):
        return f"{self.section} - Question {self.order}"

    class Meta:
        db_table = 'listening_questions'
        ordering = ['order']
        unique_together = ['section', 'order']


class ListeningUserResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listening_results')
    test = models.ForeignKey(ListeningTest, on_delete=models.CASCADE, related_name='user_results')
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    answers = models.JSONField()  # Store user's answers
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.DurationField(null=True, blank=True)
    mode = models.CharField(max_length=20, choices=[
        ('practice', 'Practice Mode'),
        ('exam', 'Exam Mode'),
    ], default='exam')

    def __str__(self):
        return f"{self.user.email} - {self.test.title} - {self.score}"

    def calculate_score(self):
        """Calculate score based on correct answers"""
        if self.total_questions > 0:
            percentage = (self.correct_answers / self.total_questions) * 100
            # Convert to IELTS band score (simplified conversion)
            if percentage >= 90:
                return 9.0
            elif percentage >= 80:
                return 8.0
            elif percentage >= 70:
                return 7.0
            elif percentage >= 60:
                return 6.0
            elif percentage >= 50:
                return 5.0
            elif percentage >= 40:
                return 4.0
            else:
                return 3.0
        return 0.0

    class Meta:
        db_table = 'listening_user_results'
        ordering = ['-completed_at']


# Writing Module Models
class WritingTest(models.Model):
    title = models.CharField(max_length=200, default="IELTS Writing Test")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    
    # Task 1 data
    task1_image = models.TextField(blank=True, null=True)  # Base64 or URL
    task1_image_description = models.TextField(blank=True, null=True)
    task1_type = models.CharField(max_length=50, choices=[
        ('graph', 'Graph'),
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('diagram', 'Diagram'),
        ('map', 'Map'),
    ], default='graph')
    
    # Task 2 data
    task2_essay_prompt = models.TextField()
    task2_type = models.CharField(max_length=50, choices=[
        ('opinion', 'Opinion-based'),
        ('problem_solution', 'Problem-Solution'),
        ('discussion', 'Discussion'),
        ('advantage_disadvantage', 'Advantage-Disadvantage'),
    ], default='opinion')
    
    # Time limits
    task1_time_limit = models.PositiveIntegerField(default=20)  # minutes
    task2_time_limit = models.PositiveIntegerField(default=40)  # minutes

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'writing_tests'
        ordering = ['-created_at']


class WritingTestSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='writing_submissions')
    test = models.ForeignKey(WritingTest, on_delete=models.CASCADE, related_name='submissions')
    
    # User's answers
    task1_answer = models.TextField()
    task2_answer = models.TextField()
    
    # AI Evaluation results
    task1_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    task1_feedback = models.TextField(blank=True, null=True)
    task2_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    task2_feedback = models.TextField(blank=True, null=True)
    overall_band_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    
    # Detailed evaluation criteria
    task1_criteria = models.JSONField(null=True, blank=True)  # Store detailed criteria scores
    task2_criteria = models.JSONField(null=True, blank=True)  # Store detailed criteria scores
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    
    # Time tracking
    task1_time_taken = models.DurationField(null=True, blank=True)
    task2_time_taken = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.test.title} - {self.overall_band_score}"

    class Meta:
        db_table = 'writing_test_submissions'
        ordering = ['-submitted_at'] 