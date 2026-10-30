import Show from '../models/Show.js';
import Seat from '../models/Seat.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

// Helper function to generate full 60-seat grid for a show
export const generateSeatsForShow = async (showId) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsData = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    let seatType = 'Standard';
    if (row === 'A' || row === 'B') {
      seatType = 'VIP Recliner';
    } else if (row === 'C' || row === 'D') {
      seatType = 'Prime';
    }

    for (let col = 1; col <= 10; col++) {
      seatsData.push({
        showId,
        seatNumber: `${row}${col}`,
        row,
        col,
        seatType,
        status: 'available',
      });
    }
  }

  return await Seat.insertMany(seatsData);
};

// @desc    Get shows with filtering by movie, theatre, date, city
// @route   GET /api/shows
// @access  Public
export const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, date, city } = req.query;
    const query = { isActive: true };

    if (movieId) {
      query.movieId = movieId;
    }

    if (theatreId) {
      query.theatreId = theatreId;
    }

    if (date) {
      query.showDate = date; // Format: YYYY-MM-DD
    }

    // Filter by city if specified
    if (city && city !== 'All') {
      const cityTheatres = await Theatre.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
      }).select('_id');
      query.theatreId = { $in: cityTheatres.map((t) => t._id) };
    }

    const shows = await Show.find(query)
      .populate('movieId', 'title poster durationMinutes language genres rating')
      .populate('theatreId', 'name city address facilities')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details and its live seat matrix
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Release any expired temporary seat locks
    await Seat.updateMany(
      {
        showId: show._id,
        status: 'locked',
        lockExpiresAt: { $lt: new Date() },
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      }
    );

    const seats = await Seat.find({ showId: show._id }).sort({ row: 1, col: 1 });

    res.status(200).json({
      success: true,
      show,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show & generate seat layout (Admin)
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res, next) => {
  try {
    const { movieId, theatreId, screenNumber, showDate, showTime, ticketPrice } = req.body;

    // Verify movie and theatre exist
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenNumber: screenNumber || 1,
      showDate,
      showTime,
      ticketPrice,
    });

    // Auto-generate 60-seat matrix for this show
    await generateSeatsForShow(show._id);

    const populatedShow = await Show.findById(show._id)
      .populate('movieId', 'title poster durationMinutes')
      .populate('theatreId', 'name city');

    res.status(201).json({
      success: true,
      message: 'Show created with seat matrix successfully',
      show: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate show (Admin)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    show.isActive = false;
    await show.save();

    res.status(200).json({
      success: true,
      message: 'Show deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
