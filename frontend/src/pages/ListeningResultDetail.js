import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ListeningResultDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState({
    score: 0,
    correct_answers: 0,
    total_questions: 0,
    answers: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(`/api/listening-results/${id}/`);
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  // Safe score handling
  const score = typeof result.score === 'number' ? result.score : 0;
  const displayScore = score.toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 7.0) return 'text-green-600';
    if (score >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 8.0) return 'bg-green-100 text-green-800';
    if (score >= 7.0) return 'bg-blue-100 text-blue-800';
    if (score >= 6.0) return 'bg-yellow-100 text-yellow-800';
    if (score >= 5.0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getQuestionTypeLabel = (type) => {
    const typeLabels = {
      'radio': 'Multiple Choice',
      'dropdown': 'Matching/Dropdown',
      'text': 'Text Input',
      'multi_choice': 'Multiple Choice (Checkbox)',
      'labeling': 'Plan/Map/Diagram Labeling',
      'completion': 'Form/Note/Table/Flowchart Completion',
      'sentence_completion': 'Sentence Completion',
      'short_answer': 'Short Answer'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-2xl font-bold mb-4">Result Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Result Details</h1>
              <p className="text-gray-600">{result.test.title}</p>
            </div>
            <Link
              to="/listening-results"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
            >
              ← Back to Results
            </Link>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Band Score</div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getScoreBadge(result.score)}`}>
                Band {displayScore}
              </span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{result.correct_answers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{result.total_questions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {result.correct_answers > 0 ? Math.round((result.correct_answers / result.total_questions) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Completed: {new Date(result.completed_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time: {formatDuration(result.time_taken)}</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>Mode: {result.mode === 'exam' ? 'Exam' : 'Practice'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Answers</h2>
          
          <div className="space-y-6">
            {result.answers_detail.map((detail, index) => (
              <div key={index} className={`border rounded-lg p-4 ${detail.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">Section {detail.section_number}</span>
                      <span className="text-sm font-medium text-gray-500">Question {detail.question_id}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {getQuestionTypeLabel(detail.question_type)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{detail.question_text}</h3>
                  </div>
                  <div className={`flex items-center ${detail.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {detail.is_correct ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h4>
                    <div className="bg-white border border-gray-300 rounded-md p-3">
                      <span className="text-gray-900">
                        {Array.isArray(detail.user_answer) ? detail.user_answer.join(', ') : (detail.user_answer || 'No answer provided')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</h4>
                    <div className="bg-white border border-gray-300 rounded-md p-3">
                      <span className="text-gray-900">{detail.correct_answer}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningResultDetail;
