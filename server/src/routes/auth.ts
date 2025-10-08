import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (first user) or Admin only
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { username, email, password, role } = value;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(400, 'User with this email or username already exists');
  }

  // Check if this is the first user (make them super admin)
  const userCount = await User.countDocuments();
  const userRole = userCount === 0 ? UserRole.SUPER_ADMIN : (role || UserRole.USER);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: userRole
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.getAllPermissions()
      },
      token
    },
    message: 'User registered successfully'
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { email, password } = value;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact administrator.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.getAllPermissions()
      },
      token
    },
    message: 'Login successful'
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // User is attached to req by auth middleware
  const user = (req as any).user;

  if (!user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const userData = await User.findById(user.id).select('-password');
  if (!userData) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      id: userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      permissions: userData.getAllPermissions(),
      isActive: userData.isActive,
      createdAt: userData.createdAt
    }
  });
}));

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const userData = await User.findById(user.id);
  if (!userData) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(newPassword, salt);
  await userData.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export default router;

