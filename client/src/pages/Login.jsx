import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.auth);
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter email and password');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || 'Invalid credentials');
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('adminpassword123');
    } else {
      setEmail('user@imovies.com');
      setPassword('userpassword123');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-lg rounded-4">
            <div className="text-center mb-4">
              <i className="bi bi-film text-danger display-4 mb-2 d-inline-block"></i>
              <h3 className="fw-bold text-white mb-1">Welcome to IMovies</h3>
              <p className="text-secondary small">Sign in to book tickets and manage reservations</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3 rounded-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-white small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema w-100 py-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Demo Credentials Quick Fills */}
            <div className="mt-3 pt-3 border-top border-secondary text-center">
              <div className="text-secondary small mb-2">⚡ 1-Click Demo Credentials:</div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning w-50"
                  onClick={() => handleQuickFill('admin')}
                >
                  <i className="bi bi-shield-lock me-1"></i> Demo Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info w-50"
                  onClick={() => handleQuickFill('user')}
                >
                  <i className="bi bi-person me-1"></i> Demo User
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/register" className="text-danger small fw-bold text-decoration-none">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

