from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, ReadingTestListView, ReadingTestDetailView,
    TestSubmissionView, TestResultListView, TestResultDetailView, GenerateTestView, user_stats,
    ListeningTestListView, ListeningTestDetailView, ListeningTestSubmissionView,
    ListeningTestResultListView, ListeningTestResultDetailView, GenerateListeningTestView,
    WritingTestListView, WritingTestDetailView, WritingTestSubmissionView,
    WritingTestResultListView, WritingTestResultDetailView, GenerateWritingTestView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Reading Tests
    path('tests/', ReadingTestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', ReadingTestDetailView.as_view(), name='test-detail'),
    path('tests/<int:test_id>/submit/', TestSubmissionView.as_view(), name='test-submit'),
    
    # Reading Results
    path('results/', TestResultListView.as_view(), name='result-list'),
    path('results/<int:pk>/', TestResultDetailView.as_view(), name='result-detail'),
    
    # Listening Tests
    path('listening-tests/', ListeningTestListView.as_view(), name='listening-test-list'),
    path('listening-tests/<int:pk>/', ListeningTestDetailView.as_view(), name='listening-test-detail'),
    path('listening-tests/<int:test_id>/submit/', ListeningTestSubmissionView.as_view(), name='listening-test-submit'),
    
    # Listening Results
    path('listening-results/', ListeningTestResultListView.as_view(), name='listening-result-list'),
    path('listening-results/<int:pk>/', ListeningTestResultDetailView.as_view(), name='listening-result-detail'),
    
    # Writing Tests
    path('writing-tests/', WritingTestListView.as_view(), name='writing-test-list'),
    path('writing-tests/<int:pk>/', WritingTestDetailView.as_view(), name='writing-test-detail'),
    path('writing-tests/<int:test_id>/submit/', WritingTestSubmissionView.as_view(), name='writing-test-submit'),
    
    # Writing Results
    path('writing-results/', WritingTestResultListView.as_view(), name='writing-result-list'),
    path('writing-results/<int:pk>/', WritingTestResultDetailView.as_view(), name='writing-result-detail'),
    
    # Admin
    path('generate-test/', GenerateTestView.as_view(), name='generate-test'),
    path('generate-listening-test/', GenerateListeningTestView.as_view(), name='generate-listening-test'),
    path('writing-tests/generate/', GenerateWritingTestView.as_view(), name='generate-writing-test'),
    
    # Statistics
    path('stats/', user_stats, name='user-stats'),
] 