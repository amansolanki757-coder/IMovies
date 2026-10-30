import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-card border-top border-secondary mt-5 py-4 text-secondary">
      <div className="container">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-md-4 text-center text-md-start">
            <Link to="/" className="text-white text-decoration-none fw-bold fs-5">
              <i className="bi bi-film text-danger me-2"></i>
              IMovies
            </Link>
            <p className="small text-muted mt-1 mb-0">
              Movie ticket booking made simple. Real-time cinema reservations.
            </p>
          </div>
          <div className="col-12 col-md-4 text-center">
            <div className="d-flex justify-content-center gap-3 small">
              <Link to="/" className="text-muted text-decoration-none">Home</Link>
              <Link to="/dashboard" className="text-muted text-decoration-none">My Tickets</Link>
              <Link to="/admin" className="text-muted text-decoration-none">Admin</Link>
            </div>
          </div>
          <div className="col-12 col-md-4 text-center text-md-end small text-muted">
            &copy; {new Date().getFullYear()} IMovies Entertainment Inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

