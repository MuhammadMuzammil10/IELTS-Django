import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiEdit3, FiClock, FiTrendingUp, FiCheckCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';

const WritingResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWritingResult();
  }, [resultId]);

  const fetchWritingResult = async () => {
    console.log('fetchWritingResult', resultId);
    try {
      const response = await axios.get(`/api/writing-results/${resultId}/`);
      setResult(response.data);
    } catch (error) {
      setError('Failed to fetch writing result');
      console.error('Error fetching writing result:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 7) return 'bg-blue-100';
    if (score >= 6) return 'bg-yellow-100';
    if (score >= 5) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getCriteriaScore = (criteria, task) => {
    if (task === 1 && result.task1_criteria) {
      return result.task1_criteria[criteria] || 'N/A';
    } else if (task === 2 && result.task2_criteria) {
      return result.task2_criteria[criteria] || 'N/A';
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-primary-600" />
          <span>Loading detailed results...</span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Result not found'}</p>
          <button
            onClick={() => navigate('/writing-results')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiEdit3 className="text-2xl text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {result.test?.title || 'Writing Test Results'}
              </h1>
              <p className="text-gray-600">
                Submitted: {new Date(result.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getScoreBgColor(result.overall_band_score)} ${getScoreColor(result.overall_band_score)}`}>
              {result.overall_band_score || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Band Score</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/writing-results')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" />
          Back to Results
        </button>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task 1 Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(result.task1_score)}`}>
                {result.task1_score || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Taken</span>
              <span className="text-sm font-medium">{result.task1_time_taken || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task 2 Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(result.task2_score)}`}>
                {result.task2_score || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Taken</span>
              <span className="text-sm font-medium">{result.task2_time_taken || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Criteria Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task 1 Criteria Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Task Achievement</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('task_achievement', 1))}`}>
                {getCriteriaScore('task_achievement', 1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Coherence & Cohesion</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('coherence_cohesion', 1))}`}>
                {getCriteriaScore('coherence_cohesion', 1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lexical Resource</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('lexical_resource', 1))}`}>
                {getCriteriaScore('lexical_resource', 1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Grammatical Range</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('grammatical_range', 1))}`}>
                {getCriteriaScore('grammatical_range', 1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task 2 Criteria Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Task Response</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('task_response', 2))}`}>
                {getCriteriaScore('task_response', 2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Coherence & Cohesion</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('coherence_cohesion', 2))}`}>
                {getCriteriaScore('coherence_cohesion', 2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lexical Resource</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('lexical_resource', 2))}`}>
                {getCriteriaScore('lexical_resource', 2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Grammatical Range</span>
              <span className={`font-bold ${getScoreColor(getCriteriaScore('grammatical_range', 2))}`}>
                {getCriteriaScore('grammatical_range', 2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task 1 Feedback</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.task1_feedback || 'No feedback available yet.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task 2 Feedback</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.task2_feedback || 'No feedback available yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Your Answers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Task 1 Answer</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.task1_answer || 'No answer provided.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Task 2 Answer</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.task2_answer || 'No answer provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Task 1 Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {result.test?.task1_type || 'N/A'}</p>
              <p>Time Limit: {result.test?.task1_time_limit || 'N/A'} minutes</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Task 2 Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {result.test?.task2_type || 'N/A'}</p>
              <p>Time Limit: {result.test?.task2_time_limit || 'N/A'} minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingResultDetail;
