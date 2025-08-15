import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiBook, FiClock, FiBarChart, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests/');
      console.log("Reading Tests Data: ", response.data);
      setTests(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || test.difficulty_level === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reading Tests</h1>
          <p className="mt-2 text-gray-600">
            Practice with authentic IELTS reading passages and questions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div key={test.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {test.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty_level)}`}>
                      {getDifficultyText(test.difficulty_level)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {test.question_count} questions
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span>60 minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiBook className="w-4 h-4 mr-2" />
                  <span>Reading Test</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiBarChart className="w-4 h-4 mr-2" />
                  <span>IELTS Band Score</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Created {new Date(test.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/tests/${test.id}`}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <FiPlay className="w-4 h-4 mr-1" />
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600">
            {searchTerm || difficultyFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No tests are currently available'
            }
          </p>
          {(searchTerm || difficultyFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('all');
              }}
              className="mt-4 text-primary-600 hover:text-primary-500 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Test Information */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About IELTS Reading Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Test Format</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 60 minutes duration</li>
              <li>• 40 questions total</li>
              <li>• Academic reading passages</li>
              <li>• Multiple question types</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Question Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Matching questions</li>
              <li>• True/False/Not Given</li>
              <li>• Fill in the blanks</li>
              <li>• Short answer questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestList; 