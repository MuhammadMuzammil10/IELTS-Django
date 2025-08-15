from django.contrib import admin
from .models import ReadingTest, Question, TestResult, ListeningTest, ListeningSection, ListeningQuestion, ListeningUserResult


@admin.register(ListeningTest)
class ListeningTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'is_active', 'created_at', 'created_by')
    list_filter = ('difficulty_level', 'is_active', 'created_at')
    search_fields = ('title',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('title', 'difficulty_level', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ListeningSection)
class ListeningSectionAdmin(admin.ModelAdmin):
    list_display = ('test', 'section_number', 'audio_file', 'created_at')
    list_filter = ('test', 'section_number', 'created_at')
    search_fields = ('test__title',)


    fieldsets = (
        (None, {
            'fields': ('test', 'section_number', 'audio_file')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('question_text', 'question_type', 'choices', 'correct_answer', 'order', 'points')


@admin.register(ReadingTest)
class ReadingTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'is_active', 'created_at', 'created_by')
    list_filter = ('difficulty_level', 'is_active', 'created_at')
    search_fields = ('title', 'passage')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [QuestionInline]
    
    fieldsets = (
        (None, {
            'fields': ('title', 'passage', 'difficulty_level', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('test', 'question_type', 'order', 'points')
    list_filter = ('question_type', 'test', 'points')
    search_fields = ('question_text', 'test__title')
    ordering = ('test', 'order')


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'correct_answers', 'total_questions', 'completed_at')
    list_filter = ('test', 'completed_at', 'score')
    search_fields = ('user__email', 'user__username', 'test__title')
    readonly_fields = ('started_at', 'completed_at', 'time_taken')
    
    fieldsets = (
        (None, {
            'fields': ('user', 'test', 'score', 'total_questions', 'correct_answers')
        }),
        ('Answers', {
            'fields': ('answers',),
            'classes': ('collapse',)
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'time_taken'),
            'classes': ('collapse',)
        }),
    ) 