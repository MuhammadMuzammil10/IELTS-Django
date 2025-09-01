import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiBook, FiBarChart, FiTarget, FiTrendingUp, FiClock, FiCheckCircle, FiHeadphones, FiEdit3 } from 'react-icons/fi';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, resultsResponse] = await Promise.all([
        axios.get('/api/stats/'),
        axios.get('/api/results/')
      ]);
      
      setStats(statsResponse.data);
      setRecentResults(resultsResponse.data.results || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: recentResults.slice(-5).map(result => 
      new Date(result.completed_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Band Score',
        data: recentResults.slice(-5).map(result => result.score),
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
        text: 'Recent Performance',
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.first_name || user.username}!
        </h1>
        <p className="text-primary-100">
          Ready to improve your IELTS skills? Choose a test type to get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiBook className="text-2xl text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Reading Tests</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Practice your reading comprehension with academic passages and various question types.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tests Taken:</span>
              <span className="font-medium">{stats?.reading_tests_taken || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Score:</span>
              <span className="font-medium">{stats?.reading_avg_score || 0}</span>
            </div>
          </div>
          <Link
            to="/tests"
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Start Reading Test
            <FiBook className="ml-2" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiHeadphones className="text-2xl text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Listening Tests</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Improve your listening skills with authentic IELTS-style audio and questions.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tests Taken:</span>
              <span className="font-medium">{stats?.listening_tests_taken || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Score:</span>
              <span className="font-medium">{stats?.listening_avg_score || 0}</span>
            </div>
          </div>
          <Link
            to="/listening-tests"
            className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Start Listening Test
            <FiHeadphones className="ml-2" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiEdit3 className="text-2xl text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Writing Tests</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Practice your writing skills with Task 1 (graphs/charts) and Task 2 (essays) with AI evaluation.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tests Taken:</span>
              <span className="font-medium">{stats?.writing_tests_taken || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Score:</span>
              <span className="font-medium">{stats?.writing_avg_score || 0}</span>
            </div>
          </div>
          <Link
            to="/writing-tests"
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            Start Writing Test
            <FiEdit3 className="ml-2" />
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FiTarget className="text-2xl text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_tests_taken || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FiTrendingUp className="text-2xl text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Reading Avg</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.reading_avg_score || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FiHeadphones className="text-2xl text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Listening Avg</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.listening_avg_score || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FiEdit3 className="text-2xl text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Writing Avg</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.writing_avg_score || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FiCheckCircle className="text-2xl text-indigo-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Overall Avg</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.reading_avg_score && stats?.listening_avg_score && stats?.writing_avg_score
                  ? ((stats.reading_avg_score + stats.listening_avg_score + stats.writing_avg_score) / 3).toFixed(1)
                  : stats?.reading_avg_score && stats?.listening_avg_score
                  ? ((stats.reading_avg_score + stats.listening_avg_score) / 2).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
          <Link
            to="/results"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        
        {recentResults.length > 0 ? (
          <div className="space-y-4">
            {recentResults.slice(0, 5).map((result) => (
              <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{result.test.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(result.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{result.score}</p>
                  <p className="text-sm text-gray-600">Band Score</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiBook className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No test results yet. Start your first test!</p>
          </div>
        )}
      </div>

      {/* Performance Chart */}
      {recentResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Trend</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 