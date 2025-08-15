import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiClock, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReadingTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchTest();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (test && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [test, timeLeft]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`/api/tests/${id}/`);
      setTest(response.data);
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Submitting your test automatically.');
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleQuestionNavigation = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const timeTaken = 60 * 60 - timeLeft; // Time taken in seconds
      const response = await axios.post(`/api/tests/${id}/submit/`, {
        answers,
        time_taken: timeTaken
      });
      
      toast.success('Test submitted successfully!');
      navigate(`/results/${response.data.result.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'matching':
        return (
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">{question.question_text}</p>
            <select
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select an answer</option>
              {question.choices?.map((choice, index) => (
                <option key={index} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">{question.question_text}</p>
            <div className="space-y-2">
              {['True', 'False', 'Not Given'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'fill_blank':
      case 'short_answer':
        return (
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">{question.question_text}</p>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your answer"
            />
          </div>
        );

      default:
        return <p>Question type not supported</p>;
    }
  };

  const getQuestionStatus = (questionIndex) => {
    const question = test.questions[questionIndex];
    if (answers[question.id] && answers[question.id].trim() !== '') {
      return 'answered';
    }
    return questionIndex === currentQuestion ? 'active' : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-600">IELTS Reading Test</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiClock className="w-5 h-5 text-red-600" />
                <span className={`text-xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reading Passage */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reading Passage</h2>
              <div className="prose max-w-none">
                <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {test.passage}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="space-y-6">
            {/* Question Navigation */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`question-nav ${getQuestionStatus(index)}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Question */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {test.questions.length}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentQuestion === test.questions.length - 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {renderQuestion(test.questions[currentQuestion])}
              </div>

              {/* Question Type Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {test.questions[currentQuestion].question_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your test? You cannot change your answers after submission.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingTest; 