import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Seat from '../models/Seat.js';

// @desc    Process simulated payment for a booking
// @route   POST /api/payments/process
// @access  Private
export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, simulateFailure } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate('showId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Simulate failure case for testing validation
    if (simulateFailure) {
      const failedTransactionId = `TXN-FAIL-${Date.now()}`;
      const failedPayment = await Payment.create({
        bookingId: booking._id,
        userId,
        amount: booking.totalAmount,
        paymentMethod: paymentMethod || 'Credit Card',
        transactionId: failedTransactionId,
        status: 'failed',
        failureReason: 'Transaction declined by bank simulation',
      });

      // Release locked seats
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

      booking.status = 'cancelled';
      booking.cancellationReason = 'Payment failed';
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment simulation failed. Your seats have been released.',
        payment: failedPayment,
      });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      {
        paymentMethod: paymentMethod || 'UPI',
        transactionId,
        status: 'success',
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details for a booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
export const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

