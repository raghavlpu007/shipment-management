import express, { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Shipment } from '../models';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Configure multer for CSV/XLSX uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only CSV and XLSX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route   POST /api/import/preview
 * @desc    Preview CSV/XLSX file data and return column mapping options
 * @access  Public
 */
router.post('/preview', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
    let data: any[] = [];
    let headers: string[] = [];

    if (fileExtension === '.csv') {
      // Parse CSV
      data = await new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', reject);
      });

      if (data.length > 0) {
        headers = Object.keys(data[0]);
      }
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // Parse XLSX
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length > 0) {
        headers = Object.keys(data[0]);
      }
    }

    // Get sample data (first 5 rows)
    const sampleData = data.slice(0, 5);

    // Define available field mappings
    const availableFields = [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'pickupCustomerName', label: 'Pickup Customer Name', type: 'text' },
      { key: 'pickupCustomerMoNo', label: 'Pickup Customer Mobile', type: 'phone' },
      { key: 'pickupRef', label: 'Pickup Reference', type: 'text' },
      { key: 'awb', label: 'AWB Number', type: 'text' },
      { key: 'courierPartner', label: 'Courier Partner', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'number' },
      { key: 'pinCode', label: 'Pin Code', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'bookingCode', label: 'Booking Code', type: 'text' },
      { key: 'baseAmount', label: 'Base Amount', type: 'number' },
      { key: 'royaltyMargin', label: 'Royalty Margin', type: 'number' },
      { key: 'gst', label: 'GST Amount', type: 'number' },
      { key: 'saleCost', label: 'Sale Cost', type: 'number' },
      { key: 'customerName', label: 'Customer Name', type: 'text' },
      { key: 'customerMoNo', label: 'Customer Mobile', type: 'phone' },
      { key: 'paymentStatus', label: 'Payment Status', type: 'enum' },
      { key: 'shipmentStatus', label: 'Shipment Status', type: 'enum' }
    ];

    // Auto-suggest mappings based on header names
    const suggestedMappings: { [key: string]: string } = {};
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Simple matching logic
      if (lowerHeader.includes('date')) suggestedMappings[header] = 'date';
      else if (lowerHeader.includes('awb')) suggestedMappings[header] = 'awb';
      else if (lowerHeader.includes('weight')) suggestedMappings[header] = 'weight';
      else if (lowerHeader.includes('pincode') || lowerHeader.includes('pin')) suggestedMappings[header] = 'pinCode';
      else if (lowerHeader.includes('city')) suggestedMappings[header] = 'city';
      else if (lowerHeader.includes('state')) suggestedMappings[header] = 'state';
      else if (lowerHeader.includes('customer') && lowerHeader.includes('name')) suggestedMappings[header] = 'customerName';
      else if (lowerHeader.includes('customer') && (lowerHeader.includes('mobile') || lowerHeader.includes('phone'))) suggestedMappings[header] = 'customerMoNo';
      else if (lowerHeader.includes('pickup') && lowerHeader.includes('name')) suggestedMappings[header] = 'pickupCustomerName';
      else if (lowerHeader.includes('pickup') && (lowerHeader.includes('mobile') || lowerHeader.includes('phone'))) suggestedMappings[header] = 'pickupCustomerMoNo';
      else if (lowerHeader.includes('courier')) suggestedMappings[header] = 'courierPartner';
      else if (lowerHeader.includes('base') && lowerHeader.includes('amount')) suggestedMappings[header] = 'baseAmount';
      else if (lowerHeader.includes('royalty')) suggestedMappings[header] = 'royaltyMargin';
      else if (lowerHeader.includes('gst')) suggestedMappings[header] = 'gst';
      else if (lowerHeader.includes('sale')) suggestedMappings[header] = 'saleCost';
      else if (lowerHeader.includes('payment') && lowerHeader.includes('status')) suggestedMappings[header] = 'paymentStatus';
      else if (lowerHeader.includes('shipment') && lowerHeader.includes('status')) suggestedMappings[header] = 'shipmentStatus';
    });

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        totalRows: data.length,
        headers,
        sampleData,
        availableFields,
        suggestedMappings
      }
    });

  } catch (error) {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new ApiError(500, 'Error processing file');
  }
}));

/**
 * @route   POST /api/import/execute
 * @desc    Execute import with column mappings
 * @access  Public
 */
router.post('/execute', asyncHandler(async (req: Request, res: Response) => {
  const { filename, mappings, defaultValues = {} } = req.body;

  if (!filename || !mappings) {
    throw new ApiError(400, 'Filename and mappings are required');
  }

  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', 'temp', filename);

  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'File not found');
  }

  try {
    const fileExtension = path.extname(filename).toLowerCase();
    let data: any[] = [];

    if (fileExtension === '.csv') {
      data = await new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    // Transform data according to mappings
    const transformedData = data.map((row, index) => {
      const shipmentData: any = {
        ...defaultValues,
        userId: req.user!.id,
        createdBy: req.user!.email,
        updatedBy: req.user!.email
      };

      // Apply mappings
      Object.entries(mappings).forEach(([csvColumn, shipmentField]) => {
        if (row[csvColumn] !== undefined && row[csvColumn] !== null && row[csvColumn] !== '' && typeof shipmentField === 'string') {
          let value = row[csvColumn];

          // Type conversion based on field
          if (['baseAmount', 'royaltyMargin', 'gst', 'saleCost', 'weight'].includes(shipmentField)) {
            value = parseFloat(value) || 0;
          } else if (shipmentField === 'date') {
            value = new Date(value);
          }

          (shipmentData as any)[shipmentField] = value;
        }
      });

      return shipmentData;
    });

    // Validate and save data
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (let i = 0; i < transformedData.length; i++) {
      try {
        const shipment = new Shipment(transformedData[i]);
        await shipment.save();
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          data: transformedData[i],
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: results,
      message: `Import completed. ${results.successful} successful, ${results.failed} failed.`
    });

  } catch (error) {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new ApiError(500, 'Error executing import');
  }
}));

export default router;
