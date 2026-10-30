import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
      index: true,
    },
    seatNumber: {
      type: String, // e.g. "A1", "A2", "B5", "F10"
      required: [true, 'Seat number is required'],
    },
    row: {
      type: String, // "A", "B", ...
      required: true,
    },
    col: {
      type: Number, // 1, 2, ...
      required: true,
    },
    seatType: {
      type: String,
      enum: ['Standard', 'Prime', 'VIP Recliner'],
      default: 'Standard',
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid concurrency checks and seat map retrieval
seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ showId: 1, status: 1 });
seatSchema.index({ lockExpiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-expire temporary locks if TTL index triggered

export default mongoose.model('Seat', seatSchema);

