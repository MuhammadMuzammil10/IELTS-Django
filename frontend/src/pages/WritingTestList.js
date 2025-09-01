import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiEdit3, FiClock, FiBarChart, FiTrendingUp, FiLoader } from 'react-icons/fi';

const WritingTestList = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWritingTests();
  }, []);

  const fetchWritingTests = async () => {
    try {
      const response = await axios.get('/api/writing-tests/');
      console.log('Fetched writing tests:', response.data);
      setTests(response.data.results || response.data);
    } catch (error) {
      setError('Failed to fetch writing tests');
      console.error('Error fetching writing tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'graph':
        return <FiTrendingUp className="text-blue-500" />;
      case 'chart':
        return <FiBarChart className="text-green-500" />;
      case 'table':
        return <FiBarChart className="text-purple-500" />;
      case 'diagram':
        return <FiBarChart className="text-orange-500" />;
      case 'map':
        return <FiBarChart className="text-red-500" />;
      default:
        return <FiBarChart className="text-gray-500" />;
    }
  };

  const getTaskTypeLabel = (type) => {
    switch (type) {
      case 'graph':
        return 'Graph';
      case 'chart':
        return 'Chart';
      case 'table':
        return 'Table';
      case 'diagram':
        return 'Diagram';
      case 'map':
        return 'Map';
      default:
        return 'Visual';
    }
  };

  const getTask2TypeLabel = (type) => {
    switch (type) {
      case 'opinion':
        return 'Opinion-based';
      case 'problem_solution':
        return 'Problem-Solution';
      case 'discussion':
        return 'Discussion';
      case 'advantage_disadvantage':
        return 'Advantage-Disadvantage';
      default:
        return 'Essay';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-primary-600" />
          <span>Loading writing tests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Writing Tests</h1>
        <p className="text-purple-100">
          Practice your IELTS writing skills with Task 1 (graphs/charts) and Task 2 (essays)
        </p>
      </div>

      {/* Tests Grid */}
      {tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <FiEdit3 className="text-2xl text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Task 1 Info */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {getTaskTypeIcon(test.task1_type)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Task 1: {getTaskTypeLabel(test.task1_type)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="mr-1" />
                  <span>{test.task1_time_limit} minutes</span>
                </div>
              </div>

              {/* Task 2 Info */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <FiEdit3 className="text-gray-500" />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Task 2: {getTask2TypeLabel(test.task2_type)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="mr-1" />
                  <span>{test.task2_time_limit} minutes</span>
                </div>
              </div>

              {/* Difficulty and Action */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.difficulty_level === 'easy' 
                    ? 'bg-green-100 text-green-800'
                    : test.difficulty_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {test.difficulty_level.charAt(0).toUpperCase() + test.difficulty_level.slice(1)}
                </span>
                
                <Link
                  to={`/writing-tests/${test.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiEdit3 className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Writing Tests Available</h3>
          <p className="text-gray-600 mb-6">
            There are no writing tests available at the moment. Please check back later.
          </p>
          <Link
            to="/dashboard"
            className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Writing Test Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">About IELTS Writing Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Task 1 (20 minutes)</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Describe visual information (graphs, charts, tables)</li>
              <li>• Write at least 150 words</li>
              <li>• Focus on data trends and comparisons</li>
              <li>• Use formal, academic language</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Task 2 (40 minutes)</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Write an essay responding to a prompt</li>
              <li>• Write at least 250 words</li>
              <li>• Present clear arguments with examples</li>
              <li>• Use appropriate essay structure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingTestList;
