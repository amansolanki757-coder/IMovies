import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovies } from '../redux/slices/movieSlice';
import MovieCard from '../components/MovieCard';
import FilterBar from '../components/FilterBar';

const Home = () => {
  const dispatch = useDispatch();
  const { movies, loading, selectedCity, selectedGenre, selectedLanguage, searchQuery } = useSelector(
    (state) => state.movies
  );
  const [status, setStatus] = useState('now_showing');

  useEffect(() => {
    dispatch(
      fetchMovies({
        city: selectedCity,
        genre: selectedGenre,
        language: selectedLanguage,
        search: searchQuery,
        status,
      })
    );
  }, [dispatch, selectedCity, selectedGenre, selectedLanguage, searchQuery, status]);

  // Featured hero movie
  const featuredMovie = movies[0];

  return (
    <div className="container py-4">
      {/* Hero Banner Spotlight */}
      {featuredMovie && !searchQuery && selectedGenre === 'All' && (
        <div
          className="glass-card mb-5 overflow-hidden position-relative p-4 p-md-5 d-flex align-items-end rounded-4"
          style={{
            minHeight: '380px',
            backgroundImage: `linear-gradient(to top, rgba(10, 12, 16, 0.95) 15%, rgba(10, 12, 16, 0.4) 60%, rgba(10, 12, 16, 0.2)), url(${featuredMovie.backdrop || featuredMovie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="position-relative" style={{ maxWidth: '640px', zIndex: 2 }}>
            <span className="badge bg-danger mb-2 px-3 py-2 rounded-pill fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
              Premiere Spotlight
            </span>
            <h1 className="display-5 fw-bold text-white mb-2">{featuredMovie.title}</h1>
            <p className="text-light opacity-75 small mb-3 line-clamp-2">
              {featuredMovie.description}
            </p>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <a href={`/movie/${featuredMovie._id}`} className="btn btn-cinema px-4 py-2">
                <i className="bi bi-play-fill me-1"></i> Book Tickets Now
              </a>
              <span className="text-warning fw-bold d-flex align-items-center gap-1">
                <i className="bi bi-star-fill"></i> {featuredMovie.rating}/10
              </span>
              <span className="text-secondary small">
                {featuredMovie.language} • {featuredMovie.durationMinutes}m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Discovery Bar */}
      <FilterBar currentStatus={status} setStatus={setStatus} />

      {/* Movie Section Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-white m-0">
            {status === 'now_showing' ? 'Now In Cinemas' : 'Coming Soon to IMovies'}
          </h3>
          <p className="text-muted small m-0">
            {selectedCity !== 'All' ? `Showing in ${selectedCity}` : 'Across all locations'}
          </p>
        </div>
        <span className="text-secondary small">{movies.length} Movies Available</span>
      </div>

      {/* Movie Cards Grid */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading catalog...</span>
          </div>
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-card text-center py-5 my-4">
          <i className="bi bi-camera-reels text-secondary display-3 mb-3 d-block"></i>
          <h5 className="text-white">No Movies Match Your Criteria</h5>
          <p className="text-muted small">Try selecting another genre, city, or clearing your search.</p>
        </div>
      ) : (
        <div className="row">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

