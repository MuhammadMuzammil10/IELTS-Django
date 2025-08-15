import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ListeningTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  // const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const audioRef = useRef(null);
  // State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasAudioEnded, setHasAudioEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && !isTestComplete) {
      handleSubmitTest();
    }
  }, [timeLeft, isTestComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`/api/listening-tests/${id}/`);
      setTest(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // const handleAudioPlay = () => {
  //   if (audioRef.current) {
  //     audioRef.current.play();
  //     setIsAudioPlaying(true);
  //   }
  // };
  

  // const handleAudioEnded = () => {
  //   setIsAudioPlaying(false);
  // };

  // Ref
  const audioRef = useRef(null);

  // Handlers
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    setHasAudioEnded(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarClick = (e) => {
    if (audioRef.current && !hasAudioEnded) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const percentage = clickPosition / progressBar.clientWidth;
      audioRef.current.currentTime = percentage * duration;
      setCurrentTime(percentage * duration);
    }
  };

  // Reset state when section changes
  useEffect(() => {
    setIsAudioPlaying(false);
    setHasAudioEnded(false);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.load();
      setDuration(audioRef.current.duration || 0);
    }
  }, [currentSection]);


  const handleNextQuestion = () => {
    const currentSectionData = test.sections[currentSection];
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < test.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const previousSection = test.sections[currentSection - 1];
      setCurrentQuestion(previousSection.questions.length - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      const response = await axios.post(`/api/listening-tests/${id}/submit/`, {
        answers: answers,
        time_taken: 30 * 60 - timeLeft, // Convert to seconds
        mode: 'exam'
      });

      const result = response.data;
      setIsTestComplete(true);
      navigate(`/listening-results/${result.result_id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // const formatTime = (seconds) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  // };

  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Icons
  const PlayIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PauseIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ExclamationCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={answers[question.id] === choice}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
      case 'short_answer':
      case 'sentence_completion':
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        );

      case 'dropdown':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an answer</option>
            {question.choices.map((choice, index) => (
              <option key={index} value={choice}>{choice}</option>
            ))}
          </select>
        );

      case 'multi_choice':
        return (
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(choice) || false}
                  onChange={(e) => {
                    const currentAnswers = answers[question.id] || [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentAnswers, choice]);
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter(a => a !== choice));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        );
    }
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

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-2xl font-bold mb-4">Test Not Found</h2>
        </div>
      </div>
    );
  }

  const currentSectionData = test.sections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IELTS Listening Test</h1>
              <p className="text-gray-600">Section {currentSection + 1} of {test.sections.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audio Player */}
          {/* Audio Player */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Section {currentSection + 1}: Listening</h3>
                <div className="flex items-center">
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                    One Play Only
                  </span>
                </div>
              </div>

              {/* Section Info */}
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-800">{currentSectionData.title}</p>
                <div className="mt-2 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-800">{currentSectionData.instructions}</p>
                </div>
              </div>

              {/* Audio Player */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Playback</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src={currentSectionData.audio_file}
                    onEnded={handleAudioEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="hidden"
                  />
                  
                  {/* Custom Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full mb-2 relative cursor-pointer"
                      onClick={handleProgressBarClick}>
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Player Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    {!hasAudioEnded ? (
                      <button
                        onClick={handlePlayPause}
                        disabled={isAudioPlaying}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 flex items-center justify-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAudioPlaying ? (
                          <PauseIcon className="h-6 w-6" />
                        ) : (
                          <PlayIcon className="h-6 w-6" />
                        )}
                      </button>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-red-600 font-medium">
                          <ExclamationCircleIcon className="h-5 w-5 inline mr-1" />
                          Audio finished. You cannot replay this section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Management */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time Remaining</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatTime(duration - currentTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">Questions</p>
                      <p className="text-lg font-bold text-gray-900">
                        {currentSectionData.questions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Question {currentQuestion + 1} of {currentSectionData.questions.length}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentSection === 0 && currentQuestion === 0}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentSection === test.sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>

              {currentQuestionData && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-semibold text-blue-900 mb-2">Question {currentQuestion + 1}</h4>
                    <p className="text-blue-800">{currentQuestionData.question_text}</p>
                  </div>

                  <div className="space-y-4">
                    {renderQuestion(currentQuestionData)}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {currentSection === test.sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1 && (
                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={handleSubmitTest}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold"
                  >
                    Submit Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningTest;
