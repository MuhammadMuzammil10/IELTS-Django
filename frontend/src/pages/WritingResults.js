import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiEdit3, FiClock, FiTrendingUp, FiCheckCircle, FiLoader } from 'react-icons/fi';

const WritingResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWritingResults();
  }, []);

  const fetchWritingResults = async () => {
    try {
      const response = await axios.get('/api/writing-results/');
      setResults(response.data.results || response.data);
    } catch (error) {
      setError('Failed to fetch writing results');
      console.error('Error fetching writing results:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-primary-600" />
          <span>Loading writing results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Writing Test Results</h1>
        <p className="text-purple-100">
          View your IELTS writing test performance and detailed feedback
        </p>
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FiEdit3 className="text-2xl text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.test?.title || 'Writing Test'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getScoreBgColor(result.overall_band_score)} ${getScoreColor(result.overall_band_score)}`}>
                    {result.overall_band_score || 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Overall Band Score</p>
                </div>
              </div>

              {/* Task Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Task 1 Score</h4>
                    <span className={`text-lg font-bold ${getScoreColor(result.task1_score)}`}>
                      {result.task1_score || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Time taken: {result.task1_time_taken || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Task 2 Score</h4>
                    <span className={`text-lg font-bold ${getScoreColor(result.task2_score)}`}>
                      {result.task2_score || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Time taken: {result.task2_time_taken || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <Link
                  to={`/writing-results/${result.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  View Detailed Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiEdit3 className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Writing Results Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't taken any writing tests yet. Start your first test to see results here.
          </p>
          <Link
            to="/writing-tests"
            className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200"
          >
            Take Writing Test
          </Link>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Writing Performance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Task 1 Tips</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Focus on main trends and comparisons</li>
              <li>• Use appropriate vocabulary for data description</li>
              <li>• Write at least 150 words</li>
              <li>• Use formal, academic language</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Task 2 Tips</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Plan your essay structure before writing</li>
              <li>• Use clear topic sentences</li>
              <li>• Provide specific examples</li>
              <li>• Write at least 250 words</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingResults;
