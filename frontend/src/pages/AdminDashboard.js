import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiHeadphones, FiEdit3, FiPlus, FiLoader } from 'react-icons/fi';
import axios from 'axios';
const AdminDashboard = () => {
  const { user } = useAuth();
  const [generatingReading, setGeneratingReading] = useState(false);
  const [generatingListening, setGeneratingListening] = useState(false);
  const [generatingWriting, setGeneratingWriting] = useState(false);
  const [message, setMessage] = useState('');

  const generateReadingTest = async () => {
    setGeneratingReading(true);
    setMessage('');
    
    try {
      const response = await axios.post('/api/generate-test/');
      const data = response.data;
      setMessage(`Reading test generated successfully! Test ID: ${data.test_id}`);
    } catch (error) {
      setMessage(`Error generating reading test: ${error.response?.data?.error || error.message}`);
    } finally {
      setGeneratingReading(false);
    }
  };

  const generateListeningTest = async () => {
    setGeneratingListening(true);
    setMessage('');
    
    try {
      const response = await axios.post('/api/generate-listening-test/', {
        difficulty_level: 'medium',
        include_audio: true
      });
      const data = response.data;
      setMessage(`Listening test generated successfully! Test ID: ${data.test_id}, Sections: ${data.sections_count}`);
    } catch (error) {
      setMessage(`Error generating listening test: ${error.response?.data?.error || error.message}`);
    } finally {
      setGeneratingListening(false);
    }
  };

  const generateWritingTest = async () => {
    setGeneratingWriting(true);
    setMessage('');
    
    try {
      const response = await axios.post('/api/writing-tests/generate/', {
        difficulty_level: 'medium',
        task1_type: 'random',
        task2_type: 'random'
      });
      const data = response.data;
      setMessage(`Writing test generated successfully! Test ID: ${data.test_id}`);
    } catch (error) {
      setMessage(`Error generating writing test: ${error.response?.data?.error || error.message}`);
    } finally {
      setGeneratingWriting(false);
    }
  };

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage IELTS tests and content generation</p>
        </div>

        {/* Test Generation Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Reading Test Generation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiBook className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Reading Test Generator</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Generate new IELTS reading tests with AI-powered content creation. 
              Tests include authentic passages and various question types.
            </p>
            <button
              onClick={generateReadingTest}
              disabled={generatingReading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generatingReading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Generate Reading Test
                </>
              )}
            </button>
          </div>

          {/* Listening Test Generation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiHeadphones className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Listening Test Generator</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Generate new IELTS listening tests with 4 sections and 40 questions. 
              Includes AI-generated transcripts and audio integration.
            </p>
            <button
              onClick={generateListeningTest}
              disabled={generatingListening}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generatingListening ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Generate Listening Test
                </>
              )}
            </button>
          </div>

          {/* Writing Test Generation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiEdit3 className="text-2xl text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Writing Test Generator</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Generate new IELTS writing tests with Task 1 (graphs/charts) and Task 2 (essays). 
              Includes AI-generated images and essay prompts.
            </p>
            <button
              onClick={generateWritingTest}
              disabled={generatingWriting}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generatingWriting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Generate Writing Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Status</h3>
            <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          </div>
        )}

        {/* Admin Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current User</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">Role: Administrator</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Available Actions</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Generate Reading Tests</li>
                <li>• Generate Listening Tests</li>
                <li>• Generate Writing Tests</li>
                <li>• View Test Analytics</li>
                <li>• Manage User Content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Generation Guidelines */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Test Generation Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Reading Tests</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Academic passages (800-1000 words)</li>
                <li>• 10 questions per test</li>
                <li>• Multiple question types</li>
                <li>• AI-generated content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Listening Tests</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 4 sections with 10 questions each</li>
                <li>• 30-minute duration</li>
                <li>• AI-generated transcripts</li>
                <li>• Audio integration support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Writing Tests</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Task 1: Graphs, charts, tables, diagrams</li>
                <li>• Task 2: Opinion, discussion, problem-solution</li>
                <li>• AI-generated images and prompts</li>
                <li>• Automated IELTS evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 