import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiClock, FiBarChart, FiTarget, FiCheckCircle, FiUsers, FiHeadphones, FiArrowRight, FiStar } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiBook,
      title: 'IELTS Reading Tests',
      description: 'Practice with authentic IELTS-style reading passages and questions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FiHeadphones,
      title: 'IELTS Listening Tests',
      description: 'Improve listening skills with authentic audio and comprehensive questions',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: FiClock,
      title: 'Real Exam Conditions',
      description: 'Practice under authentic IELTS timing and pressure simulation',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: FiBarChart,
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive performance reports',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: FiTarget,
      title: 'Multiple Question Types',
      description: 'Master all question formats for both reading and listening',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: FiCheckCircle,
      title: 'Instant Feedback',
      description: 'Get immediate results and explanations for all questions',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      score: "8.5",
      text: "The listening tests helped me improve my comprehension skills significantly. The audio quality is excellent!",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      score: "7.5",
      text: "Great platform for IELTS preparation. Both reading and listening modules are very comprehensive.",
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      score: "8.0",
      text: "The practice tests are very close to the real IELTS exam. Highly recommended!",
      avatar: "ED"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-soft-light"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-soft-light"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Master <span className="text-blue-200">IELTS</span> With Confidence
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive IELTS preparation with authentic reading and listening tests. Track your progress and achieve your target band score.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Link
                  to="/tests"
                  className="group bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                >
                  Start Reading Test
                  <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/listening-tests"
                  className="group bg-green-500 text-white hover:bg-green-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                >
                  Start Listening Test
                  <FiHeadphones className="ml-2" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Test Modules Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              IELTS Test Modules
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive reading and listening modules designed to match the real IELTS exam
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reading Module */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <FiBook className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Reading Module</h3>
                  <p className="text-blue-600 font-medium">Academic & General Training</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <FiClock className="w-5 h-5 mr-3 text-blue-500" />
                  <span>60 minutes • 40 questions</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiTarget className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Multiple question types</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiBarChart className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Detailed performance analytics</span>
                </div>
              </div>
              
              <Link
                to={user ? "/tests" : "/register"}
                className="group inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Start Reading Test
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Listening Module */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <FiHeadphones className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Listening Module</h3>
                  <p className="text-green-600 font-medium">4 Sections • 40 Questions</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <FiClock className="w-5 h-5 mr-3 text-green-500" />
                  <span>30 minutes • 4 sections</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiTarget className="w-5 h-5 mr-3 text-green-500" />
                  <span>Authentic audio recordings</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiBarChart className="w-5 h-5 mr-3 text-green-500" />
                  <span>Real-time scoring</span>
                </div>
              </div>
              
              <Link
                to={user ? "/listening-tests" : "/register"}
                className="group inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Start Listening Test
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive IELTS preparation with authentic materials and advanced analytics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-100">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who have improved their IELTS scores with our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex mb-4 justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-blue-600 font-medium">Band {testimonial.score}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your IELTS Journey?
          </h2>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who have achieved their target band scores with our comprehensive IELTS preparation platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="group bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="group bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;