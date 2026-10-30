import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');

  // Client-side validation errors
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Validate phone on change
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);

    if (!val || val.trim() === '') {
      setPhoneError('');
      return;
    }

    // Check if phone contains letters or non-digits
    if (/[a-zA-Z]/.test(val)) {
      setPhoneError('Letters are not allowed in mobile numbers. Please enter digits only.');
    } else if (!/^[0-9+ -]{10,15}$/.test(val)) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
    } else {
      setPhoneError('');
    }
  };

  // Validate email on change
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (!val) {
      setEmailError('');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Please enter a valid email address format.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check Full Name
    if (!name || name.trim().length < 2) {
      toast.warning('Full name must be at least 2 characters long');
      return;
    }

    // 2. Check Email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Please enter a valid email address');
      return;
    }

    // 3. Check Password
    if (!password || password.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }

    // 4. Check Mobile Phone (Letters prohibited)
    if (phone && phone.trim() !== '') {
      if (/[a-zA-Z]/.test(phone)) {
        toast.error('Invalid Phone: Mobile numbers cannot contain letters!');
        setPhoneError('Letters are not allowed in mobile numbers.');
        return;
      }
      const cleaned = phone.replace(/[\s+-]/g, '');
      if (cleaned.length < 10) {
        toast.error('Invalid Phone: Mobile number must have at least 10 digits.');
        setPhoneError('Mobile number must be at least 10 digits.');
        return;
      }
    }

    const result = await dispatch(registerUser({ name, email, password, phone, role }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Welcome to IMovies.');
      navigate('/');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="glass-card p-4 p-md-5 shadow-lg rounded-4">
            <div className="text-center mb-4">
              <i className="bi bi-person-plus-fill text-danger display-5 mb-2 d-inline-block"></i>
              <h3 className="fw-bold text-white mb-1">Create an Account</h3>
              <p className="text-secondary small">Join IMovies for seamless movie bookings and perks</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3 rounded-3 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label text-white small fw-semibold">Full Name *</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="e.g. Aman Solanki"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white small fw-semibold">Email Address *</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control bg-dark border-secondary text-white ${emailError ? 'is-invalid border-danger' : ''}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {emailError && (
                  <div className="text-danger small mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-x-circle me-1"></i>
                    {emailError}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label text-white small fw-semibold">Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white small fw-semibold">Mobile Phone (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-phone"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control bg-dark border-secondary text-white ${phoneError ? 'is-invalid border-danger' : ''}`}
                    placeholder="e.g. 9876543210 (10 digits)"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                {phoneError && (
                  <div className="text-danger small mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                    {phoneError}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label text-white small fw-semibold">Account Type</label>
                <select
                  className="form-select bg-dark border-secondary text-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">Regular User (Book tickets)</option>
                  <option value="admin">Administrator (Manage movies & shows)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-cinema w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
                disabled={loading || !!phoneError || !!emailError}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg fs-5"></i>
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-danger small fw-bold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
