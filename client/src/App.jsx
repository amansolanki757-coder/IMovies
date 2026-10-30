import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
import { ToastContainer } from 'react-toastify';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected User Pages
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MovieManager from './pages/admin/MovieManager';
import TheatreManager from './pages/admin/TheatreManager';
import ShowScheduler from './pages/admin/ShowScheduler';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Automatically restore authenticated session if token present
    if (localStorage.getItem('imovies_token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/seat-selection/:showId" element={<SeatSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies"
            element={
              <ProtectedRoute adminOnly={true}>
                <MovieManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/theatres"
            element={
              <ProtectedRoute adminOnly={true}>
                <TheatreManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shows"
            element={
              <ProtectedRoute adminOnly={true}>
                <ShowScheduler />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3500}
        hideProgressBar={false}
      />
    </div>
  );
}

export default App;
