import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiBarChart, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ResultDetail = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(`/api/results/${id}/`);
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching result:', error);
      toast.error('Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'matching':
        return 'bg-blue-100 text-blue-800';
      case 'true_false':
        return 'bg-green-100 text-green-800';
      case 'fill_blank':
        return 'bg-purple-100 text-purple-800';
      case 'short_answer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeText = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Result not found</h2>
        <Link to="/results" className="text-primary-600 hover:text-primary-500">
          Back to Results
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/results"
            className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{result.test.title}</h1>
          <p className="mt-2 text-gray-600">Detailed test result analysis</p>
        </div>
      </div>

      {/* Result Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiBarChart className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Band Score</p>
              <p className="text-2xl font-semibold text-gray-900">{result.score}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Correct Answers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {result.correct_answers}/{result.total_questions}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FiClock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Time Taken</p>
              <p className="text-2xl font-semibold text-gray-900">
                {result.time_taken ? formatTime(result.time_taken) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiBook className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {((result.correct_answers / result.total_questions) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Passage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Passage</h3>
        <div className="prose max-w-none">
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {result.test.passage}
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Question Analysis</h3>
        
        <div className="space-y-6">
          {result.answers_detail?.map((detail, index) => (
            <div key={detail.question_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-900">Q{index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(detail.question_type)}`}>
                    {getQuestionTypeText(detail.question_type)}
                  </span>
                  {detail.is_correct ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <span className="text-sm text-gray-500">{detail.points} point{detail.points !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-900 font-medium">{detail.question_text}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <div className={`p-2 rounded border ${
                      detail.is_correct 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {detail.user_answer || 'No answer provided'}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                    <div className="p-2 rounded border bg-green-50 border-green-200 text-green-800">
                      {detail.correct_answer}
                    </div>
                  </div>
                </div>

                {!detail.is_correct && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Tip:</strong> Review this question type and practice similar questions to improve your accuracy.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Question Type Performance</h4>
            <div className="space-y-2">
              {Object.entries(
                result.answers_detail?.reduce((acc, detail) => {
                  const type = detail.question_type;
                  if (!acc[type]) acc[type] = { total: 0, correct: 0 };
                  acc[type].total++;
                  if (detail.is_correct) acc[type].correct++;
                  return acc;
                }, {}) || {}
              ).map(([type, stats]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {type.replace('_', ' ')}:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.correct}/{stats.total} ({(stats.correct / stats.total * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Focus on question types where you scored lower</li>
              <li>• Practice time management for better efficiency</li>
              <li>• Review the reading passage more carefully</li>
              <li>• Take more practice tests to improve overall performance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/tests"
          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          Take Another Test
        </Link>
        <Link
          to="/results"
          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          View All Results
        </Link>
      </div>
    </div>
  );
};

export default ResultDetail; 