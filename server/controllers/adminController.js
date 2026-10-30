import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// @desc    Get dashboard metrics & analytics (Admin)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const activeShows = await Show.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Aggregate total revenue
    const revenueAggregation = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title' },
          { path: 'theatreId', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Top 5 grossing movies
    const topMovies = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: '$show' },
      {
        $group: {
          _id: '$show.movieId',
          ticketsSold: { $sum: { $size: '$seatNumbers' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $project: {
          title: '$movie.title',
          poster: '$movie.poster',
          ticketsSold: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        activeShows,
        totalBookings,
        cancelledBookings,
        totalRevenue,
      },
      recentBookings,
      topMovies,
    });
  } catch (error) {
    next(error);
  }
};

