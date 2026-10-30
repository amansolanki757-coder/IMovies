import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShowSeats, updateSeatRealtime, lockSeatsAction } from '../redux/slices/bookingSlice';
import { useSocket } from '../context/SocketContext';
import SeatMap from '../components/SeatMap';
import { toast } from 'react-toastify';

const SeatSelection = () => {
  const { showId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();

  const { activeShow, seats, selectedSeats, loading } = useSelector((state) => state.booking);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [locking, setLocking] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchShowSeats(showId));
  }, [dispatch, showId]);

  // Real-time WebSocket room events
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join:show', showId);

    // When another user locks seats
    socket.on('seat:locked', ({ seatNumbers, lockedBy }) => {
      dispatch(updateSeatRealtime({ seatNumbers, status: 'locked', lockedBy }));
    });

    // When seats are released
    socket.on('seat:released', ({ seatNumbers }) => {
      dispatch(updateSeatRealtime({ seatNumbers, status: 'available', lockedBy: null }));
    });

    // When seats are permanently booked
    socket.on('seat:booked', ({ seatNumbers }) => {
      dispatch(updateSeatRealtime({ seatNumbers, status: 'booked', lockedBy: null }));
    });

    return () => {
      socket.emit('leave:show', showId);
      socket.off('seat:locked');
      socket.off('seat:released');
      socket.off('seat:booked');
    };
  }, [socket, showId, dispatch]);

  if (loading || !activeShow) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading auditorium layout...</span>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  let subtotal = 0;
  selectedSeats.forEach((seatNum) => {
    const seatObj = seats.find((s) => s.seatNumber === seatNum);
    let price = activeShow.ticketPrice;
    if (seatObj?.seatType === 'VIP Recliner') {
      price = Math.round(activeShow.ticketPrice * (activeShow.vipPriceMultiplier || 1.5));
    } else if (seatObj?.seatType === 'Prime') {
      price = Math.round(activeShow.ticketPrice * 1.25);
    }
    subtotal += price;
  });

  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal + convenienceFee;

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with booking');
      navigate('/login', { state: { from: `/seat-selection/${showId}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat');
      return;
    }

    setLocking(true);
    try {
      const resultAction = await dispatch(
        lockSeatsAction({ showId, seatNumbers: selectedSeats })
      );

      if (lockSeatsAction.fulfilled.match(resultAction)) {
        // Broadcast lock to other sockets in this room
        if (socket) {
          socket.emit('seat:lock', {
            showId,
            seatNumbers: selectedSeats,
          });
        }
        navigate('/checkout');
      } else {
        toast.error(resultAction.payload || 'Failed to reserve selected seats');
        dispatch(fetchShowSeats(showId));
      }
    } catch (err) {
      toast.error('An error occurred during seat reservation');
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header Info Banner */}
      <div className="glass-card p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1">{activeShow.movieId?.title}</h4>
          <p className="text-secondary small mb-0">
            {activeShow.theatreId?.name} • Screen {activeShow.screenNumber} •{' '}
            <span className="text-white">{activeShow.showDate} ({activeShow.showTime})</span>
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-danger px-3 py-2 rounded-pill">
            <i className="bi bi-broadcast me-1"></i> Live Concurrency Active
          </span>
        </div>
      </div>

      <div className="row gy-4">
        {/* Interactive Cinema Seat Grid */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 text-center">
            <SeatMap
              seats={seats}
              basePrice={activeShow.ticketPrice}
              vipMultiplier={activeShow.vipPriceMultiplier || 1.5}
            />
          </div>
        </div>

        {/* Selected Seats & Booking Summary Panel */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-4 position-sticky" style={{ top: '90px' }}>
            <h5 className="fw-bold text-white mb-3">Booking Summary</h5>

            <div className="mb-3">
              <div className="text-secondary small mb-1">Selected Seats:</div>
              {selectedSeats.length === 0 ? (
                <div className="text-muted small fst-italic">No seats selected yet (Max 10)</div>
              ) : (
                <div className="d-flex flex-wrap gap-1">
                  {selectedSeats.map((seatNum) => (
                    <span key={seatNum} className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
                      {seatNum}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-secondary my-3" />

            {/* Price Calculations */}
            <div className="d-flex justify-content-between text-secondary small mb-2">
              <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
              <span className="text-white fw-bold">₹{subtotal}</span>
            </div>

            <div className="d-flex justify-content-between text-secondary small mb-3">
              <span>Convenience Fee & GST (10%)</span>
              <span className="text-white fw-bold">₹{convenienceFee}</span>
            </div>

            <div className="d-flex justify-content-between text-white fw-bold fs-5 mb-4 pt-2 border-top border-secondary">
              <span>Total Payable</span>
              <span className="text-danger">₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-cinema w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              disabled={selectedSeats.length === 0 || locking}
              onClick={handleProceedToCheckout}
            >
              {locking ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Holding Seats...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-lock-fill"></i>
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>

            <p className="text-center text-muted small mt-3 mb-0" style={{ fontSize: '0.75rem' }}>
              Seats will be temporarily locked for 10 minutes upon proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

