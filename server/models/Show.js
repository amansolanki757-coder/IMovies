import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for fast date-matching
      required: [true, 'Show date (YYYY-MM-DD) is required'],
      index: true,
    },
    showTime: {
      type: String, // e.g. "10:30 AM", "01:45 PM", "06:30 PM", "10:00 PM"
      required: [true, 'Show time is required'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Base ticket price is required'],
    },
    vipPriceMultiplier: {
      type: Number,
      default: 1.5,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for show filtering
showSchema.index({ movieId: 1, showDate: 1, isActive: 1 });
showSchema.index({ theatreId: 1, showDate: 1, isActive: 1 });
showSchema.index({ showDate: 1, isActive: 1 });

export default mongoose.model('Show', showSchema);

