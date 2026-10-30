import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ShowScheduler = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [movieId, setMovieId] = useState('');
  const [theatreId, setTheatreId] = useState('');
  const [screenNumber, setScreenNumber] = useState(1);
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTime, setShowTime] = useState('06:30 PM');
  const [ticketPrice, setTicketPrice] = useState(280);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        API.get('/shows'),
        API.get('/movies?status=now_showing&limit=100'),
        API.get('/theatres'),
      ]);

      setShows(showsRes.data.shows || []);
      setMovies(moviesRes.data.movies || []);
      setTheatres(theatresRes.data.theatres || []);

      if (moviesRes.data.movies?.length > 0) {
        setMovieId(moviesRes.data.movies[0]._id);
      }
      if (theatresRes.data.theatres?.length > 0) {
        setTheatreId(theatresRes.data.theatres[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load scheduler data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/shows', {
        movieId,
        theatreId,
        screenNumber: parseInt(screenNumber, 10),
        showDate,
        showTime,
        ticketPrice: parseFloat(ticketPrice),
      });

      toast.success(res.data.message || 'Show scheduled & 60 seats generated!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scheduling show');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled show?')) return;
    try {
      await API.delete(`/shows/${id}`);
      toast.success('Show cancelled');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel show');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <h3 className="fw-bold text-white m-0">Showtime & Screen Scheduler</h3>
        </div>

        <button className="btn btn-cinema" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> Schedule Showtime
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary">
                  <th>MOVIE</th>
                  <th>THEATRE / CITY</th>
                  <th>SCREEN</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>BASE PRICE</th>
                  <th className="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id} className="border-secondary">
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={s.movieId?.poster}
                          alt={s.movieId?.title}
                          className="rounded-2"
                          style={{ width: '34px', height: '48px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-white text-truncate" style={{ maxWidth: '160px' }}>
                          {s.movieId?.title}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-white small fw-semibold">{s.theatreId?.name}</div>
                      <div className="text-secondary small">{s.theatreId?.city}</div>
                    </td>
                    <td className="text-secondary small">Screen {s.screenNumber}</td>
                    <td className="text-white small">{s.showDate}</td>
                    <td className="fw-bold text-danger small">{s.showTime}</td>
                    <td className="fw-bold text-white small">₹{s.ticketPrice}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(s._id)}
                        title="Cancel Show"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Schedule New Showtime</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleScheduleShow}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Movie *</label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      value={movieId}
                      onChange={(e) => setMovieId(e.target.value)}
                      required
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Multiplex *</label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      value={theatreId}
                      onChange={(e) => setTheatreId(e.target.value)}
                      required
                    >
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} - {t.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Screen #</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control bg-dark border-secondary text-white"
                        value={screenNumber}
                        onChange={(e) => setScreenNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Base Ticket Price (₹)</label>
                      <input
                        type="number"
                        min="100"
                        className="form-control bg-dark border-secondary text-white"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        className="form-control bg-dark border-secondary text-white"
                        value={showDate}
                        onChange={(e) => setShowDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Time</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={showTime}
                        onChange={(e) => setShowTime(e.target.value)}
                      >
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="01:45 PM">01:45 PM</option>
                        <option value="04:30 PM">04:30 PM</option>
                        <option value="07:15 PM">07:15 PM</option>
                        <option value="10:00 PM">10:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-dark border border-secondary text-secondary small">
                    <i className="bi bi-info-circle text-info me-1"></i>
                    A full 60-seat matrix (VIP Recliner, Prime, Standard) will be auto-generated.
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema">
                    Generate & Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowScheduler;

