import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings/my');
      setUpcoming(res.data.upcoming || []);
      setPast(res.data.past || []);
    } catch (err) {
      toast.error('Failed to load your booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket? The seats will be released immediately.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const res = await API.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Customer initiated cancellation',
      });
      toast.success(res.data.message || 'Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const renderBookingCard = (booking) => {
    const show = booking.showId;
    const movie = show?.movieId;
    const theatre = show?.theatreId;
    const isCancelled = booking.status === 'cancelled';

    return (
      <div key={booking._id} className="glass-card p-3 mb-3">
        <div className="row g-3 align-items-center">
          <div className="col-3 col-md-2 col-lg-1 text-center">
            <img
              src={movie?.poster}
              alt={movie?.title}
              className="rounded-3 shadow w-100"
              style={{ maxHeight: '95px', objectFit: 'cover' }}
            />
          </div>

          <div className="col-9 col-md-5 col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="text-white fw-bold m-0">{movie?.title}</h6>
              <span
                className={`badge ${isCancelled ? 'bg-danger' : 'bg-success'} px-2 py-1 rounded-pill`}
                style={{ fontSize: '0.68rem' }}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>
            <div className="text-secondary small">{theatre?.name} • Screen {show?.screenNumber}</div>
            <div className="text-muted small">{theatre?.city}</div>
            <div className="text-danger small fw-semibold mt-1">
              Code: <span className="text-warning">{booking.bookingCode}</span>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <div className="text-secondary small">Showtime</div>
            <div className="text-white fw-bold small">{show?.showDate}</div>
            <div className="text-danger small fw-semibold">{show?.showTime}</div>
            <div className="text-secondary small mt-1">
              Seats: <span className="text-white fw-bold">{booking.seatNumbers.join(', ')}</span>
            </div>
          </div>

          <div className="col-6 col-md-2 col-lg-3 text-md-end">
            <div className="text-secondary small">Total Paid</div>
            <div className="text-white fw-bold fs-5 mb-2">₹{booking.totalAmount}</div>

            {!isCancelled && activeTab === 'upcoming' && (
              <button
                className="btn btn-sm btn-outline-danger"
                disabled={cancellingId === booking._id}
                onClick={() => handleCancelBooking(booking._id)}
              >
                {cancellingId === booking._id ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  'Cancel Ticket'
                )}
              </button>
            )}

            <Link
              to={`/booking/${booking._id}`}
              className="btn btn-sm btn-cinema ms-2 text-decoration-none"
            >
              View Pass
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      {/* User Header Profile */}
      <div className="glass-card p-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-3"
            style={{ width: '64px', height: '64px' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="fw-bold text-white mb-0">{user?.name}</h4>
            <div className="text-secondary small">{user?.email}</div>
            <div className="text-muted small mt-1">
              Account Role: <span className="text-warning fw-bold">{user?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-3 text-center">
          <div className="glass-card px-3 py-2 rounded-3">
            <div className="text-danger fw-bold fs-4">{upcoming.length}</div>
            <div className="text-secondary small">Upcoming Shows</div>
          </div>
          <div className="glass-card px-3 py-2 rounded-3">
            <div className="text-white fw-bold fs-4">{past.length}</div>
            <div className="text-secondary small">Past Bookings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'upcoming' ? 'active bg-danger' : 'text-white glass-card'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Tickets ({upcoming.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'past' ? 'active bg-danger' : 'text-white glass-card'}`}
            onClick={() => setActiveTab('past')}
          >
            Past Bookings ({past.length})
          </button>
        </li>
      </ul>

      {/* Booking List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : activeTab === 'upcoming' ? (
        upcoming.length === 0 ? (
          <div className="glass-card text-center py-5">
            <i className="bi bi-ticket-perforated text-secondary display-3 mb-3 d-block"></i>
            <h5 className="text-white">No Upcoming Bookings</h5>
            <p className="text-muted small">You don't have any movie tickets reserved right now.</p>
            <Link to="/" className="btn btn-cinema mt-2">Explore Movies</Link>
          </div>
        ) : (
          upcoming.map(renderBookingCard)
        )
      ) : past.length === 0 ? (
        <div className="glass-card text-center py-5">
          <i className="bi bi-clock-history text-secondary display-3 mb-3 d-block"></i>
          <h5 className="text-white">No Past Booking History</h5>
          <p className="text-muted small">Your completed show history will appear here.</p>
        </div>
      ) : (
        past.map(renderBookingCard)
      )}
    </div>
  );
};

export default UserDashboard;

