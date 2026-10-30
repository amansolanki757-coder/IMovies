import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Movie language is required'],
      trim: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
      index: true,
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL or path is required'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for robust search
movieSchema.index({ title: 'text', description: 'text', cast: 'text', director: 'text' });

export default mongoose.model('Movie', movieSchema);

