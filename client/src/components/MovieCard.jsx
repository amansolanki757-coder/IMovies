import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="glass-card glass-card-hover h-100 overflow-hidden d-flex flex-column position-relative">
        {/* Rating & Status Badges */}
        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1" style={{ zIndex: 2 }}>
          <div className="rating-tag">
            <i className="bi bi-star-fill text-warning"></i>
            <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
          </div>
          {movie.status === 'coming_soon' && (
            <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '0.7rem' }}>
              Coming Soon
            </span>
          )}
        </div>

        {/* Poster Image Container */}
        <div className="position-relative overflow-hidden" style={{ paddingTop: '145%' }}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>

        {/* Card Body */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            <h6 className="fw-bold text-white mb-1 text-truncate" title={movie.title}>
              {movie.title}
            </h6>
            <div className="text-secondary small mb-2 text-truncate">
              {movie.genres?.join(', ')}
            </div>
            <div className="d-flex align-items-center justify-content-between text-muted small">
              <span>{movie.language}</span>
              <span>
                <i className="bi bi-clock me-1"></i>
                {movie.durationMinutes}m
              </span>
            </div>
          </div>

          <div className="mt-3">
            <Link
              to={`/movie/${movie._id}`}
              className="btn btn-cinema btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-ticket-perforated-fill"></i>
              <span>Book Tickets</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

