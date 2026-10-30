import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { setCity, setSearchQuery } from '../redux/slices/movieSlice';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { selectedCity, searchQuery } = useSelector((state) => state.movies);

  const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top glass-card border-bottom border-secondary px-3 py-2">
      <div className="container-fluid">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-white">
          <i className="bi bi-film text-danger fs-3"></i>
          <span>
            I<span className="text-danger">Movies</span>
          </span>
        </Link>

        {/* City Location Selector Dropdown */}
        <div className="d-flex align-items-center me-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-dark border-secondary text-danger">
              <i className="bi bi-geo-alt-fill"></i>
            </span>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={selectedCity}
              onChange={(e) => dispatch(setCity(e.target.value))}
              style={{ minWidth: '120px' }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Cities' : city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Navbar Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#imoviesNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Content */}
        <div className="collapse navbar-collapse" id="imoviesNavbar">
          {/* Global Movie Search Bar */}
          <div className="mx-auto my-2 my-lg-0 w-50">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white"
                placeholder="Search movies, genres, actors, directors..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
              {searchQuery && (
                <button
                  className="btn btn-dark border-secondary text-muted"
                  onClick={() => dispatch(setSearchQuery(''))}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Right Action Items */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                {/* Admin Portal Shortcut if Admin */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-speedometer2"></i>
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-dark dropdown-toggle d-flex align-items-center gap-2 bg-transparent border-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div
                      className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '36px', height: '36px' }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-start d-none d-md-block">
                      <div className="text-white small fw-bold">{user?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {user?.role === 'admin' ? 'Administrator' : 'Moviegoer'}
                      </div>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-card p-2 shadow">
                    <li>
                      <Link className="dropdown-item rounded py-2" to="/dashboard">
                        <i className="bi bi-ticket-perforated me-2 text-danger"></i>
                        My Bookings
                      </Link>
                    </li>
                    {user?.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item rounded py-2" to="/admin">
                          <i className="bi bi-gear-fill me-2 text-warning"></i>
                          Admin Portal
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider border-secondary" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item rounded py-2 text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

