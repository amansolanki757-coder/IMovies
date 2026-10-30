import Booking from '../models/Booking.js';
import Seat from '../models/Seat.js';
import Show from '../models/Show.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

// Helper: generate 8-character unique alphanumeric booking code
const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'IMV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new booking & reserve seats
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat numbers are required',
      });
    }

    const show = await Show.findById(showId).populate('movieId theatreId');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Verify seats
    const seats = await Seat.find({
      showId,
      seatNumber: { $in: seatNumbers },
    });

    const unavailable = seats.filter(
      (s) => s.status === 'booked' || (s.status === 'locked' && s.lockedBy?.toString() !== userId.toString())
    );

    if (unavailable.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats are unavailable',
      });
    }

    // Calculate total amount based on seat tiers
    let totalAmount = 0;
    const seatDetails = seats.map((seat) => {
      let price = show.ticketPrice;
      if (seat.seatType === 'VIP Recliner') {
        price = Math.round(show.ticketPrice * show.vipPriceMultiplier);
      } else if (seat.seatType === 'Prime') {
        price = Math.round(show.ticketPrice * 1.25);
      }
      totalAmount += price;
      return {
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        price,
      };
    });

    // Generate unique booking code
    let bookingCode = generateBookingCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
      else bookingCode = generateBookingCode();
    }

    // Mark seats as booked
    await Seat.updateMany(
      { showId, seatNumber: { $in: seatNumbers } },
      { status: 'booked', lockedBy: null, lockExpiresAt: null }
    );

    // Create booking
    const booking = await Booking.create({
      userId,
      showId,
      seatNumbers,
      seatDetails,
      totalAmount,
      bookingCode,
      status: 'confirmed',
    });

    // Create simulated payment record
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
      bookingId: booking._id,
      userId,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      transactionId,
      status: 'success',
    });

    // Create confirmation notification
    await Notification.create({
      userId,
      title: 'Booking Confirmed!',
      message: `Your booking for "${show.movieId.title}" at ${show.theatreId.name} on ${show.showDate} (${show.showTime}) is confirmed. Code: ${bookingCode}`,
      type: 'booking',
      link: `/booking/${booking._id}`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title poster durationMinutes language' },
          { path: 'theatreId', select: 'name city address' },
        ],
      });

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      booking: populatedBooking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's booking history (Upcoming and Past)
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title poster durationMinutes language genres' },
          { path: 'theatreId', select: 'name city address' },
        ],
      })
      .sort({ createdAt: -1 });

    const todayStr = new Date().toISOString().split('T')[0];

    const upcoming = [];
    const past = [];

    bookings.forEach((b) => {
      if (b.showId && b.showId.showDate >= todayStr && b.status === 'confirmed') {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      upcoming,
      past,
      all: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId' },
          { path: 'theatreId' },
        ],
      })
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & release seats
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showId',
      populate: { path: 'movieId theatreId' },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Release seats back to 'available'
    await Seat.updateMany(
      {
        showId: booking.showId._id,
        seatNumber: { $in: booking.seatNumbers },
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      }
    );

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    // Update payment record to refunded
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      { status: 'refunded' }
    );

    // Create notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingCode}) for "${booking.showId.movieId.title}" has been cancelled and seats released.`,
      type: 'cancellation',
      link: `/bookings`,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin) with pagination & filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) query.bookingCode = { $regex: search.trim(), $options: 'i' };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title poster' },
          { path: 'theatreId', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

