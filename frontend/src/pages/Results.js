import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiBarChart, FiClock, FiCheckCircle, FiXCircle, FiEye, FiTrendingUp } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const [resultsResponse, statsResponse] = await Promise.all([
        axios.get('/api/results/'),
        axios.get('/api/stats/')
      ]);
      
      setResults(resultsResponse.data.results || resultsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 7.0) return 'text-green-600';
    if (score >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 7.0) return 'bg-green-100';
    if (score >= 6.0) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const chartData = {
    labels: results.slice(-10).map(result => 
      new Date(result.completed_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Band Score',
        data: results.slice(-10).map(result => result.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 9,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
        <p className="mt-2 text-gray-600">
          Track your IELTS reading performance and improvement over time
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiBarChart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_tests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.average_score}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.best_score}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiClock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recent_scores?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {results.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Test Results</h3>
        
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {result.test.title}
                    </h4>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>Completed: {new Date(result.completed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        <span>{result.correct_answers}/{result.total_questions} correct</span>
                      </div>
                      {result.time_taken && (
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          <span>Time: {formatTime(result.time_taken)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(result.score)} ${getScoreColor(result.score)}`}>
                        {result.score} Band Score
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((result.correct_answers / result.total_questions) * 100).toFixed(1)}% accuracy
                      </p>
                    </div>
                    
                    <Link
                      to={`/results/${result.id}`}
                      className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      <FiEye className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiBarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test results yet</h3>
            <p className="text-gray-600 mb-4">
              Start practicing with our IELTS reading tests to see your results here.
            </p>
            <Link
              to="/tests"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Start Your First Test
            </Link>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {results.length > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Score Analysis</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Highest Score:</span>
                  <span className="font-medium">{Math.max(...results.map(r => r.score))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lowest Score:</span>
                  <span className="font-medium">{Math.min(...results.map(r => r.score))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Score:</span>
                  <span className="font-medium">
                    {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Improvement Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Practice regularly with different question types</li>
                <li>• Focus on time management during tests</li>
                <li>• Review incorrect answers to understand patterns</li>
                <li>• Read academic texts to improve comprehension</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results; 