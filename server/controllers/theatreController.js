import Theatre from '../models/Theatre.js';

// @desc    Get all theatres, optionally filtered by city
// @route   GET /api/theatres
// @access  Public
export const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }
    res.status(200).json({
      success: true,
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre (Admin)
// @route   POST /api/theatres
// @access  Private/Admin
export const createTheatre = async (req, res, next) => {
  try {
    const { name, city, address, screens, facilities } = req.body;

    const theatre = await Theatre.create({
      name,
      city,
      address,
      screens: screens && screens.length > 0 ? screens : [{ screenNumber: 1, name: 'Screen 1', totalSeats: 60 }],
      facilities: facilities || ['Dolby Atmos', 'Recliner Seats', '4K Projection', 'Food & Beverages'],
    });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    await theatre.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Theatre removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

