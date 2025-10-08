import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { UserRole, Permission } from '../models/User';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize, requireRole } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', search, role, isActive } = req.query;

  const filter: any = {};
  
  if (search) {
    filter.$or = [
      { username: new RegExp(search as string, 'i') },
      { email: new RegExp(search as string, 'i') }
    ];
  }
  
  if (role) {
    filter.role = role;
  }
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getAllPermissions(),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })),
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum
    }
  });
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Admin only
 */
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getAllPermissions(),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}));

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post('/', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, role, permissions, isActive } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(400, 'User with this email or username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || UserRole.USER,
    permissions: permissions || [],
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getAllPermissions(),
      isActive: user.isActive
    },
    message: 'User created successfully'
  });
}));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const { username, email, role, permissions, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent changing super admin role (unless you are super admin)
  const currentUser = await User.findById((req as any).user.id);
  if (user.role === UserRole.SUPER_ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(403, 'Only super admin can modify super admin users');
  }

  // Update fields
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  if (permissions) user.permissions = permissions;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getAllPermissions(),
      isActive: user.isActive
    },
    message: 'User updated successfully'
  });
}));

/**
 * @route   PUT /api/users/:id/password
 * @desc    Reset user password
 * @access  Admin only
 */
router.put('/:id/password', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Super Admin only
 */
router.delete('/:id', requireRole(UserRole.SUPER_ADMIN), asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent deleting super admin
  if (user.role === UserRole.SUPER_ADMIN) {
    throw new ApiError(403, 'Cannot delete super admin user');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

/**
 * @route   GET /api/users/roles/list
 * @desc    Get all available roles
 * @access  Private
 */
router.get('/roles/list', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(UserRole).map(role => ({
      value: role,
      label: role.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }))
  });
}));

/**
 * @route   GET /api/users/permissions/list
 * @desc    Get all available permissions
 * @access  Private
 */
router.get('/permissions/list', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(Permission).map(permission => ({
      value: permission,
      label: permission.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }))
  });
}));

export default router;

