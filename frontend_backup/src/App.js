import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import TrainSearch from './components/TrainSearch';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import { getCurrentUser } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const handleLogin = () => {
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              user ? (
                <Home user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.is_admin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/search"
            element={user ? <TrainSearch /> : <Navigate to="/login" />}
          />
          <Route
            path="/book"
            element={user ? <BookingForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-bookings"
            element={user ? <MyBookings /> : <Navigate to="/login" />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home({ user }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Train Booking System</h1>
        <p className="home-subtitle">
          {user.is_admin
            ? `Hello Admin ${user.username}! Manage your trains and locations.`
            : `Hello ${user.username}! Book your train tickets easily.`}
        </p>
        
        <div className="home-cards">
          {user.is_admin ? (
            <>
              <div className="home-card">
                <div className="card-icon">📍</div>
                <h3>Manage Locations</h3>
                <p>Add and manage railway stations</p>
                <a href="/admin" className="card-button">Go to Admin Panel</a>
              </div>
              <div className="home-card">
                <div className="card-icon">🚂</div>
                <h3>Manage Trains</h3>
                <p>Add and manage train schedules</p>
                <a href="/admin" className="card-button">Go to Admin Panel</a>
              </div>
            </>
          ) : (
            <>
              <div className="home-card">
                <div className="card-icon">🔍</div>
                <h3>Search Trains</h3>
                <p>Find trains for your journey</p>
                <a href="/search" className="card-button">Search Now</a>
              </div>
              <div className="home-card">
                <div className="card-icon">🎫</div>
                <h3>My Bookings</h3>
                <p>View and manage your bookings</p>
                <a href="/my-bookings" className="card-button">View Bookings</a>
              </div>
            </>
          )}
        </div>

        <div className="features-section">
          <h2>Why Choose Us?</h2>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <h4>Fast Booking</h4>
              <p>Book tickets in seconds</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💳</span>
              <h4>Secure Payment</h4>
              <p>Safe and secure transactions</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <h4>Easy Access</h4>
              <p>Book anytime, anywhere</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h4>Real-time Updates</h4>
              <p>Live seat availability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;