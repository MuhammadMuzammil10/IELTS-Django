import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestList from './pages/TestList';
import ReadingTest from './pages/ReadingTest';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import AdminDashboard from './pages/AdminDashboard';
import ListeningTestList from './pages/ListeningTestList';
import ListeningTest from './pages/ListeningTest';
import ListeningResults from './pages/ListeningResults';
import ListeningResultDetail from './pages/ListeningResultDetail';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && user.is_staff ? children : <Navigate to="/dashboard" />;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tests" 
              element={
                <PrivateRoute>
                  <TestList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tests/:id" 
              element={
                <PrivateRoute>
                  <ReadingTest />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <PrivateRoute>
                  <Results />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/results/:id" 
              element={
                <PrivateRoute>
                  <ResultDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/listening-tests" 
              element={
                <PrivateRoute>
                  <ListeningTestList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/listening-tests/:id" 
              element={
                <PrivateRoute>
                  <ListeningTest />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/listening-results" 
              element={
                <PrivateRoute>
                  <ListeningResults />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/listening-results/:id" 
              element={
                <PrivateRoute>
                  <ListeningResultDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 