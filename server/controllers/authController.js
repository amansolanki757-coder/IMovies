import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user with detailed validation
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Name Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: 'Please provide your full name (minimum 2 characters)',
      });
    }

    // 2. Email Validation
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please enter a valid email address (e.g., student@medicaps.ac.in)',
      });
    }

    // 3. Password Validation
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 6 characters long',
      });
    }

    // 4. Mobile Phone Validation (If entered, must be digits only)
    if (phone && phone.trim() !== '') {
      const cleanedPhone = phone.replace(/[\s+-]/g, '');
      if (!/^\d{10,15}$/.test(cleanedPhone) || /[a-zA-Z]/.test(phone)) {
        return res.status(400).json({
          success: false,
          field: 'phone',
          message: `Invalid mobile number "${phone}". It must contain 10-15 digits only, with no letters or special symbols.`,
        });
      }
    }

    // 5. Duplicate Email Check
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'An account with this email already exists. Please sign in or use another email.',
      });
    }

    // Role assignment
    const userRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: userRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: No account found with this email',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password does not match',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) {
      if (phone && !/^\d{10,15}$/.test(phone.replace(/[\s+-]/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Phone must contain 10-15 digits only',
        });
      }
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
