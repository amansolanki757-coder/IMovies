import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosConfig';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Booking Not Found</h4>
        <Link to="/" className="btn btn-cinema mt-3">Back to Home</Link>
      </div>
    );
  }

  const show = booking.showId;
  const movie = show?.movieId;
  const theatre = show?.theatreId;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {/* Success Banner */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-success bg-opacity-25 text-success d-inline-flex align-items-center justify-content-center mb-2"
              style={{ width: '64px', height: '64px' }}
            >
              <i className="bi bi-check-circle-fill display-6"></i>
            </div>
            <h3 className="fw-bold text-white mb-1">Booking Confirmed!</h3>
            <p className="text-muted small">
              A confirmation email & notification has been dispatched to your account.
            </p>
          </div>

          {/* Digital Cinema Ticket Card */}
          <div className="ticket-pass p-4 mb-4 shadow-lg">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge bg-danger px-3 py-1 rounded-pill mb-2">IMovies Pass</span>
                <h4 className="fw-bold text-white mb-1">{movie?.title}</h4>
                <div className="text-secondary small">{movie?.language} • {movie?.durationMinutes} mins</div>
              </div>
              <div className="text-end">
                <div className="text-secondary small">Booking Code</div>
                <div className="fw-bold text-warning fs-5">{booking.bookingCode}</div>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="text-secondary small">Cinema</div>
                <div className="text-white fw-bold">{theatre?.name}</div>
                <div className="text-muted small">{theatre?.city}</div>
              </div>
              <div className="col-6">
                <div className="text-secondary small">Date & Time</div>
                <div className="text-white fw-bold">{show?.showDate}</div>
                <div className="text-danger fw-bold">{show?.showTime}</div>
              </div>
              <div className="col-6">
                <div className="text-secondary small">Auditorium</div>
                <div className="text-white fw-bold">Screen {show?.screenNumber}</div>
              </div>
              <div className="col-6">
                <div className="text-secondary small">Seats ({booking.seatNumbers.length})</div>
                <div className="text-white fw-bold fs-5">{booking.seatNumbers.join(', ')}</div>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            {/* QR Code & Total */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small">Amount Paid</div>
                <div className="text-white fw-bold fs-4">₹{booking.totalAmount}</div>
                <span className="badge bg-success bg-opacity-25 text-success border border-success">
                  Payment Verified
                </span>
              </div>

              {/* Digital QR Code Visual Representation */}
              <div className="text-center p-2 bg-white rounded-3 shadow">
                <i className="bi bi-qr-code display-5 text-dark"></i>
                <div className="text-dark fw-bold" style={{ fontSize: '0.65rem' }}>
                  SCAN AT GATE
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-cinema-outline flex-grow-1"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-2"></i> Print Ticket
            </button>
            <Link to="/dashboard" className="btn btn-cinema flex-grow-1 text-center">
              <i className="bi bi-ticket-detailed me-2"></i> View My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

