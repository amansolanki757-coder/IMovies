import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// @desc    Get all movies with filters & pagination
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      city,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by status (now_showing / coming_soon)
    if (status) {
      query.status = status;
    }

    // Filter by Genre
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    // Filter by Language
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    // Search by title, description, cast
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { cast: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by City (cross-reference active shows in that city)
    if (city && city !== 'All') {
      const cityTheatres = await Theatre.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
      }).select('_id');
      const theatreIds = cityTheatres.map((t) => t._id);

      const activeShows = await Show.find({
        theatreId: { $in: theatreIds },
        isActive: true,
      }).select('movieId');
      const movieIds = [...new Set(activeShows.map((s) => s.movieId.toString()))];

      query._id = { $in: movieIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ releaseDate: -1, rating: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with its active shows
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Fetch shows grouped by date & theatre
    const shows = await Show.find({ movieId: movie._id, isActive: true })
      .populate('theatreId', 'name city address facilities')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      movie,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const movieData = { ...req.body };

    // Format genres if passed as comma-separated string
    if (typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map((g) => g.trim());
    }

    // Format cast if passed as string
    if (typeof movieData.cast === 'string') {
      movieData.cast = movieData.cast.split(',').map((c) => c.trim());
    }

    // Handle poster file upload if provided
    if (req.file) {
      movieData.poster = `/uploads/${req.file.filename}`;
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const updateData = { ...req.body };

    if (typeof updateData.genres === 'string') {
      updateData.genres = updateData.genres.split(',').map((g) => g.trim());
    }

    if (typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map((c) => c.trim());
    }

    if (req.file) {
      updateData.poster = `/uploads/${req.file.filename}`;
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Deactivate associated shows
    await Show.updateMany({ movieId: movie._id }, { isActive: false });
    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Movie and related shows removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

