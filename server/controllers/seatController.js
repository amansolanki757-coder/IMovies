import Seat from '../models/Seat.js';

// @desc    Get seats for a given show
// @route   GET /api/seats/show/:showId
// @access  Public
export const getShowSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;

    // Auto-release expired locks
    await Seat.updateMany(
      {
        showId,
        status: 'locked',
        lockExpiresAt: { $lt: new Date() },
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      }
    );

    const seats = await Seat.find({ showId }).sort({ row: 1, col: 1 });
    res.status(200).json({
      success: true,
      count: seats.length,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lock seats temporarily for checkout (10-minute hold)
// @route   POST /api/seats/lock
// @access  Private
export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    const userId = req.user._id;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat numbers are required',
      });
    }

    // Release expired locks first
    await Seat.updateMany(
      {
        showId,
        status: 'locked',
        lockExpiresAt: { $lt: new Date() },
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      }
    );

    // Verify all requested seats are currently 'available' or already locked by this user
    const seats = await Seat.find({
      showId,
      seatNumber: { $in: seatNumbers },
    });

    const unavailableSeats = seats.filter(
      (s) => s.status === 'booked' || (s.status === 'locked' && s.lockedBy?.toString() !== userId.toString())
    );

    if (unavailableSeats.length > 0) {
      const takenList = unavailableSeats.map((s) => s.seatNumber).join(', ');
      return res.status(409).json({
        success: false,
        message: `Seats [${takenList}] are no longer available. Please select different seats.`,
      });
    }

    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    // Lock the seats
    await Seat.updateMany(
      {
        showId,
        seatNumber: { $in: seatNumbers },
      },
      {
        status: 'locked',
        lockedBy: userId,
        lockExpiresAt: tenMinutesFromNow,
      }
    );

    const updatedSeats = await Seat.find({
      showId,
      seatNumber: { $in: seatNumbers },
    });

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully for 10 minutes',
      lockExpiresAt: tenMinutesFromNow,
      seats: updatedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release locked seats (e.g., checkout abandoned)
// @route   POST /api/seats/release
// @access  Private
export const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    const userId = req.user._id;

    await Seat.updateMany(
      {
        showId,
        seatNumber: { $in: seatNumbers },
        lockedBy: userId,
        status: 'locked',
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Seats released successfully',
    });
  } catch (error) {
    next(error);
  }
};

