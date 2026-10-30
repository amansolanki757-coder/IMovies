import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovieDetails } from '../redux/slices/movieSlice';

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentMovie, currentShows, loading } = useSelector((state) => state.movies);

  // Generate next 5 calendar dates
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ isoStr, label: `${dayName}, ${dayNum} ${monthName}` });
    }
    return dates;
  };

  const availableDates = generateDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0].isoStr);

  useEffect(() => {
    dispatch(fetchMovieDetails(id));
  }, [dispatch, id]);

  if (loading || !currentMovie) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading movie details...</span>
        </div>
      </div>
    );
  }

  // Filter shows by selected date
  const filteredShows = currentShows.filter((s) => s.showDate === selectedDate);

  // Group shows by Theatre
  const showsByTheatre = filteredShows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatreId,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  return (
    <div>
      {/* Movie Hero Banner with Backdrop */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(10, 12, 16, 0.98) 30%, rgba(10, 12, 16, 0.75) 70%, rgba(10, 12, 16, 0.5)), url(${currentMovie.backdrop || currentMovie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '440px',
        }}
      >
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center gy-4">
            {/* Poster Column */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="img-fluid rounded-4 shadow-lg border border-secondary"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
              />
            </div>

            {/* Info Column */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold">
                  {currentMovie.language}
                </span>
                <span className="rating-tag">
                  <i className="bi bi-star-fill text-warning"></i>
                  {currentMovie.rating}/10
                </span>
                <span className="text-secondary small">
                  <i className="bi bi-clock me-1"></i>
                  {currentMovie.durationMinutes} mins
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white mb-2">{currentMovie.title}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {currentMovie.genres?.map((g) => (
                  <span key={g} className="badge bg-dark border border-secondary text-secondary">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-light opacity-75 mb-3" style={{ maxWidth: '750px', lineHeight: '1.6' }}>
                {currentMovie.description}
              </p>

              <div className="small text-secondary mb-4">
                {currentMovie.director && (
                  <div className="mb-1">
                    <strong className="text-white">Director:</strong> {currentMovie.director}
                  </div>
                )}
                {currentMovie.cast?.length > 0 && (
                  <div>
                    <strong className="text-white">Starring:</strong> {currentMovie.cast.join(', ')}
                  </div>
                )}
              </div>

              {currentMovie.trailerUrl && (
                <a
                  href={currentMovie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-cinema-outline btn-sm d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-play-circle-fill text-danger fs-5"></i>
                  <span>Watch Trailer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container py-5">
        <h4 className="fw-bold text-white mb-4">Select Date & Showtimes</h4>

        {/* Date Selector Pills */}
        <div className="d-flex gap-2 mb-4 overflow-x-auto pb-2">
          {availableDates.map((item) => (
            <button
              key={item.isoStr}
              className={`btn ${selectedDate === item.isoStr ? 'btn-danger' : 'btn-dark border-secondary text-white'} px-4 py-2 rounded-3 text-nowrap`}
              onClick={() => setSelectedDate(item.isoStr)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Theatres & Shows Listing */}
        {Object.keys(showsByTheatre).length === 0 ? (
          <div className="glass-card text-center py-5">
            <i className="bi bi-calendar-x text-secondary display-4 mb-3 d-block"></i>
            <h5 className="text-white">No Shows Scheduled for this Date</h5>
            <p className="text-muted small">Please select another date above or check back shortly.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {Object.values(showsByTheatre).map(({ theatre, shows }) => (
              <div key={theatre._id} className="glass-card p-4">
                <div className="row gy-3 align-items-center">
                  <div className="col-12 col-md-5">
                    <h5 className="text-white fw-bold mb-1">{theatre.name}</h5>
                    <p className="text-secondary small mb-2">{theatre.address}, {theatre.city}</p>
                    <div className="d-flex flex-wrap gap-1">
                      {theatre.facilities?.map((f) => (
                        <span key={f} className="badge bg-dark text-muted" style={{ fontSize: '0.68rem' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 col-md-7">
                    <div className="d-flex flex-wrap gap-2">
                      {shows.map((show) => (
                        <Link
                          key={show._id}
                          to={`/seat-selection/${show._id}`}
                          className="btn btn-cinema-outline text-center py-2 px-3"
                          style={{ minWidth: '100px' }}
                        >
                          <div className="fw-bold">{show.showTime}</div>
                          <div className="small text-secondary" style={{ fontSize: '0.72rem' }}>
                            Screen {show.screenNumber} • ₹{show.ticketPrice}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

