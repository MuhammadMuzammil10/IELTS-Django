import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ListeningResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/listening-results/');
      const data = response.data;
      setResults(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Listening Test Results</h1>
          <p className="text-gray-600">
            View your performance in IELTS listening tests and track your progress over time.
          </p>
        </div>

        {/* Results Grid */}
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{result.test.title}</h3>
                    <p className="text-sm text-gray-500">
                      Completed on {new Date(result.completed_at).toLocaleDateString()} at{' '}
                      {new Date(result.completed_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score.toFixed(1)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadge(result.score)}`}>
                      Band {result.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-gray-900">{result.correct_answers}</div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-gray-900">{result.total_questions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.correct_answers > 0 ? Math.round((result.correct_answers / result.total_questions) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Time: {formatDuration(result.time_taken)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>Mode: {result.mode === 'exam' ? 'Exam' : 'Practice'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/listening-results/${result.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listening test results yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete your first listening test to see your results here.
            </p>
            <div className="mt-6">
              <Link
                to="/listening-tests"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Take a Listening Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningResults;
