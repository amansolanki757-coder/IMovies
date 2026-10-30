import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
      index: true,
    },
    seatNumbers: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
    },
    seatDetails: [
      {
        seatNumber: String,
        seatType: String,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total booking amount is required'],
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for instant user booking history retrieval & admin reporting
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);

