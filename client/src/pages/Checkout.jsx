import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createBookingAction } from '../redux/slices/bookingSlice';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { activeShow, selectedSeats, seats } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!activeShow || selectedSeats.length === 0) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Seat hold time expired. Please reselect your seats.');
          navigate(`/seat-selection/${activeShow._id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeShow, selectedSeats, navigate]);

  if (!activeShow || selectedSeats.length === 0) return null;

  // Calculate pricing
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

  const convenienceFee = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + convenienceFee;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (simulateFailure) {
        toast.error('Payment Simulation Failed: Bank declined the transaction.');
        setProcessing(false);
        return;
      }

      const bookingPayload = {
        showId: activeShow._id,
        seatNumbers: selectedSeats,
        paymentMethod,
      };

      const resultAction = await dispatch(createBookingAction(bookingPayload));

      if (createBookingAction.fulfilled.match(resultAction)) {
        // Broadcast permanently booked seats to other viewers
        if (socket) {
          socket.emit('seat:booked', {
            showId: activeShow._id,
            seatNumbers: selectedSeats,
          });
        }
        toast.success('Payment verified! Booking confirmed.');
        navigate(`/booking-confirmation/${resultAction.payload.booking._id}`);
      } else {
        toast.error(resultAction.payload || 'Booking could not be finalized.');
      }
    } catch (err) {
      toast.error('Payment processing encountered an unexpected error.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center gy-4">
        {/* Left Column: Payment Details */}
        <div className="col-12 col-md-7">
          <div className="glass-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-white m-0">Payment Gateway</h4>
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                <i className="bi bi-stopwatch me-1"></i>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>

            <p className="text-secondary small mb-4">
              Your seats are temporarily locked. Complete payment to generate your digital tickets.
            </p>

            {/* Payment Method Selector */}
            <form onSubmit={handlePayNow}>
              <div className="mb-4">
                <label className="form-label text-white fw-semibold small">Choose Payment Mode</label>
                <div className="d-flex flex-column gap-2">
                  {['UPI', 'Credit Card', 'Debit Card', 'IMovies Wallet'].map((mode) => (
                    <label
                      key={mode}
                      className={`glass-card p-3 d-flex align-items-center justify-content-between rounded-3 cursor-pointer ${paymentMethod === mode ? 'border-danger' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMode"
                          className="form-check-input bg-dark border-secondary m-0"
                          checked={paymentMethod === mode}
                          onChange={() => setPaymentMethod(mode)}
                        />
                        <span className="text-white fw-medium">{mode}</span>
                      </div>
                      <i className={`bi ${mode === 'UPI' ? 'bi-qr-code-scan' : mode.includes('Card') ? 'bi-credit-card-2-front' : 'bi-wallet2'} text-danger fs-5`}></i>
                    </label>
                  ))}
                </div>
              </div>

              {/* Requirement Checklist Option: Simulate Payment Failure to test error resilience */}
              <div className="p-3 mb-4 rounded-3 bg-dark border border-secondary">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="failureCheck"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  <label className="form-check-label text-secondary small" htmlFor="failureCheck">
                    <span className="text-warning fw-bold">Test Validation Mode:</span> Simulate Payment Failure
                    (Validates error-handling requirement)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check fs-5"></i>
                    <span>Pay ₹{grandTotal} & Confirm Tickets</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-12 col-md-5">
          <div className="glass-card p-4">
            <h5 className="fw-bold text-white mb-3">Order Details</h5>

            <div className="d-flex gap-3 mb-3">
              <img
                src={activeShow.movieId?.poster}
                alt={activeShow.movieId?.title}
                className="rounded-3"
                style={{ width: '70px', height: '100px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="text-white fw-bold mb-1">{activeShow.movieId?.title}</h6>
                <div className="text-secondary small">{activeShow.theatreId?.name}</div>
                <div className="text-secondary small">Screen {activeShow.screenNumber}</div>
                <div className="text-danger small fw-semibold mt-1">
                  {activeShow.showDate} • {activeShow.showTime}
                </div>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            <div className="mb-3">
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>Seats</span>
                <span className="text-white fw-bold">{selectedSeats.join(', ')}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>Tickets Count</span>
                <span className="text-white fw-bold">{selectedSeats.length}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>User</span>
                <span className="text-white fw-bold">{user?.name}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>Email</span>
                <span className="text-white fw-bold">{user?.email}</span>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            <div className="d-flex justify-content-between text-secondary small mb-2">
              <span>Subtotal</span>
              <span className="text-white">₹{subtotal}</span>
            </div>
            <div className="d-flex justify-content-between text-secondary small mb-3">
              <span>Convenience Fee (10%)</span>
              <span className="text-white">₹{convenienceFee}</span>
            </div>

            <div className="d-flex justify-content-between text-white fw-bold fs-5 pt-2 border-top border-secondary">
              <span>Total Amount</span>
              <span className="text-danger">₹{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

