import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // 5MB default
  }
});

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file
 * @access  Public
 */
router.post('/single', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    },
    message: 'File uploaded successfully'
  });
}));

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Public
 */
router.post('/multiple', upload.array('files', 5), asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }

  const uploadedFiles = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  }));

  res.json({
    success: true,
    data: uploadedFiles,
    message: `${files.length} files uploaded successfully`
  });
}));

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded file
 * @access  Public
 */
router.delete('/:filename', asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'File not found');
  }

  // Delete file
  fs.unlinkSync(filePath);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
}));

/**
 * @route   GET /api/upload/list
 * @desc    List all uploaded files
 * @access  Public
 */
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const files = fs.readdirSync(uploadsDir);
  
  const fileList = files.map(filename => {
    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);
    
    return {
      filename,
      size: stats.size,
      createdAt: stats.birthtime,
      url: `/uploads/${filename}`
    };
  });

  res.json({
    success: true,
    data: fileList
  });
}));

// Error handling for multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files'
      });
    }
  }
  return next(error);
});

export default router;
