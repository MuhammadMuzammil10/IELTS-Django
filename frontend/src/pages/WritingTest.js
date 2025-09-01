import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiEdit3, FiClock, FiSave, FiCheck, FiLoader, FiArrowLeft } from 'react-icons/fi';

const WritingTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Task answers
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  
  // Time tracking
  const [task1TimeLeft, setTask1TimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [task2TimeLeft, setTask2TimeLeft] = useState(40 * 60); // 40 minutes in seconds
  const [currentTask, setCurrentTask] = useState(1);
  const [task1StartTime, setTask1StartTime] = useState(null);
  const [task2StartTime, setTask2StartTime] = useState(null);

  useEffect(() => {
    fetchWritingTest();
  }, [testId]);

  useEffect(() => {
    let interval = null;
    if (currentTask === 1 && task1TimeLeft > 0) {
      interval = setInterval(() => {
        setTask1TimeLeft(time => time - 1);
      }, 1000);
    } else if (currentTask === 2 && task2TimeLeft > 0) {
      interval = setInterval(() => {
        setTask2TimeLeft(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTask, task1TimeLeft, task2TimeLeft]);

  const fetchWritingTest = async () => {
    console.log('Fetching writing test...', testId);
    try {
      const response = await axios.get(`/api/writing-tests/${testId}/`);
      setTest(response.data);
      setTask1StartTime(new Date());
    } catch (error) {
      setError('Failed to fetch writing test');
      console.error('Error fetching writing test:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const switchToTask2 = () => {
    setCurrentTask(2);
    setTask2StartTime(new Date());
  };

  const submitTest = async () => {
    if (!task1Answer.trim() || !task2Answer.trim()) {
      setError('Please complete both tasks before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const task1TimeTaken = task1StartTime ? new Date() - task1StartTime : 0;
      const task2TimeTaken = task2StartTime ? new Date() - task2StartTime : 0;

      const response = await axios.post(`/api/writing-tests/${testId}/submit/`, {
        task1_answer: task1Answer,
        task2_answer: task2Answer,
        task1_time_taken: `00:${Math.floor(task1TimeTaken / 1000 / 60)}:${Math.floor((task1TimeTaken / 1000) % 60)}`,
        task2_time_taken: `00:${Math.floor(task2TimeTaken / 1000 / 60)}:${Math.floor((task2TimeTaken / 1000) % 60)}`
      });

      // Navigate to results page
      navigate(`/writing-results/${response.data.submission_id}`);
    } catch (error) {
      setError('Failed to submit test. Please try again.');
      console.error('Error submitting test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-primary-600" />
          <span>Loading writing test...</span>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/writing-tests')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Writing Tests
          </button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiEdit3 className="text-2xl text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600">IELTS Writing Test</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center text-lg font-semibold">
                <FiClock className="mr-2" />
                {currentTask === 1 ? formatTime(task1TimeLeft) : formatTime(task2TimeLeft)}
              </div>
              <p className="text-sm text-gray-600">
                Task {currentTask} Time Remaining
              </p>
            </div>
          </div>
        </div>

        {/* Task Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentTask(1)}
            className={`px-4 py-2 rounded-md font-medium ${
              currentTask === 1
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Task 1
          </button>
          <button
            onClick={() => setCurrentTask(2)}
            className={`px-4 py-2 rounded-md font-medium ${
              currentTask === 2
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Task 2
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {currentTask === 1 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Task 1: Academic Writing</h2>
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Visual Information</h3>
              {test.task1_image && (
                <div className="mb-4">
                  {test.task1_image.startsWith('data:') ? (
                    <img 
                      src={test.task1_image} 
                      alt="Task 1 Visual" 
                      className="max-w-full h-auto border rounded-lg"
                    />
                  ) : (
                    <img 
                      src={test.task1_image} 
                      alt="Task 1 Visual" 
                      className="max-w-full h-auto border rounded-lg"
                    />
                  )}
                </div>
              )}
              {/* <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{test.task1_image_description}</p>
              </div> */}
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
              <p className="text-gray-700">
                Write at least 150 words describing the visual information. Focus on the main trends, 
                comparisons, and key features. Use formal, academic language.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer (Minimum 150 words)
              </label>
              <textarea
                value={task1Answer}
                onChange={(e) => setTask1Answer(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your Task 1 response here..."
              />
              <div className="mt-2 text-sm text-gray-600">
                Word count: {task1Answer.split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Task 2: Essay Writing</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Essay Prompt</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{test.task2_essay_prompt}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
              <p className="text-gray-700">
                Write at least 250 words responding to the prompt. Present clear arguments with examples. 
                Use appropriate essay structure with introduction, body paragraphs, and conclusion.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Essay (Minimum 250 words)
              </label>
              <textarea
                value={task2Answer}
                onChange={(e) => setTask2Answer(e.target.value)}
                className="w-full h-80 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your Task 2 essay here..."
              />
              <div className="mt-2 text-sm text-gray-600">
                Word count: {task2Answer.split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/writing-tests')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" />
          Back to Tests
        </button>

        <div className="flex space-x-4">
          {currentTask === 1 ? (
            <button
              onClick={switchToTask2}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Next: Task 2
            </button>
          ) : (
            <button
              onClick={submitTest}
              disabled={submitting || !task1Answer.trim() || !task2Answer.trim()}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Submit Test
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WritingTest;
