import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSeatSelection } from '../redux/slices/bookingSlice';

const SeatMap = ({ seats, basePrice, vipMultiplier = 1.5 }) => {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state) => state.booking);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // Group seats by rows
  const groupedRows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(groupedRows).sort();

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedBy && seat.lockedBy !== currentUserId) return;
    dispatch(toggleSeatSelection(seat.seatNumber));
  };

  const getSeatClass = (seat) => {
    if (selectedSeats.includes(seat.seatNumber)) {
      return 'seat-selected';
    }
    if (seat.status === 'booked') {
      return 'seat-booked';
    }
    if (seat.status === 'locked') {
      if (seat.lockedBy && seat.lockedBy === currentUserId) {
        return 'seat-selected';
      }
      return 'seat-locked';
    }
    return 'seat-available';
  };

  const calculateSeatPrice = (type) => {
    if (type === 'VIP Recliner') return Math.round(basePrice * vipMultiplier);
    if (type === 'Prime') return Math.round(basePrice * 1.25);
    return basePrice;
  };

  return (
    <div className="w-100 overflow-x-auto py-3">
      {/* Curved Screen Indicator */}
      <div className="screen-curve">
        <span className="screen-text">Cinema Screen This Way</span>
      </div>

      {/* Seat Rows Matrix */}
      <div className="d-flex flex-column align-items-center gap-2 mb-4" style={{ minWidth: '460px' }}>
        {rows.map((rowKey) => {
          const rowSeats = groupedRows[rowKey].sort((a, b) => a.col - b.col);
          const rowType = rowSeats[0]?.seatType || 'Standard';

          return (
            <div key={rowKey} className="d-flex align-items-center gap-2">
              {/* Row Label Left */}
              <div
                className="text-secondary fw-bold text-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowKey}
              </div>

              {/* Left Column Block (1-5) */}
              <div className="d-flex gap-1">
                {rowSeats.slice(0, 5).map((seat) => (
                  <div
                    key={seat._id || seat.seatNumber}
                    className={`cinema-seat ${getSeatClass(seat)}`}
                    onClick={() => handleSeatClick(seat)}
                    title={`Seat ${seat.seatNumber} (${seat.seatType}) - ₹${calculateSeatPrice(seat.seatType)}`}
                  >
                    {seat.col}
                  </div>
                ))}
              </div>

              {/* Cinema Aisle Gap */}
              <div style={{ width: '28px' }}></div>

              {/* Right Column Block (6-10) */}
              <div className="d-flex gap-1">
                {rowSeats.slice(5, 10).map((seat) => (
                  <div
                    key={seat._id || seat.seatNumber}
                    className={`cinema-seat ${getSeatClass(seat)}`}
                    onClick={() => handleSeatClick(seat)}
                    title={`Seat ${seat.seatNumber} (${seat.seatType}) - ₹${calculateSeatPrice(seat.seatType)}`}
                  >
                    {seat.col}
                  </div>
                ))}
              </div>

              {/* Row Label Right */}
              <div
                className="text-secondary fw-bold text-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowKey}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Legend */}
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 pt-3 border-top border-secondary text-secondary small">
        <div className="d-flex align-items-center gap-2">
          <div className="cinema-seat seat-available m-0" style={{ width: '20px', height: '18px' }}></div>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="cinema-seat seat-selected m-0" style={{ width: '20px', height: '18px' }}></div>
          <span>Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="cinema-seat seat-locked m-0" style={{ width: '20px', height: '18px' }}></div>
          <span>Locked</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="cinema-seat seat-booked m-0" style={{ width: '20px', height: '18px' }}></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;

