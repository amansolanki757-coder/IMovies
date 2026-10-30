import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Screen 1',
  },
  totalSeats: {
    type: Number,
    default: 60,
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
    },
    screens: [screenSchema],
    facilities: {
      type: [String],
      default: ['Dolby 7.1 Atmos', 'Recliner Seats', '4K Laser Projection', 'Food & Beverages', 'Parking'],
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ name: 1, city: 1 });

export default mongoose.model('Theatre', theatreSchema);

