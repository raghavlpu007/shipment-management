import express, { Request, Response } from 'express';
import { Shipment, IShipment } from '../models';
import { validateShipment, validateShipmentUpdate } from '../middleware/validation';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Interface for query parameters
interface ShipmentQuery {
  page?: string;
  limit?: string;
  search?: string;
  paymentStatus?: string;
  shipmentStatus?: string;
  city?: string;
  state?: string;
  courierPartner?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * @route   GET /api/shipments
 * @desc    Get all shipments with filtering, searching, and pagination
 * @access  Public
 */
router.get('/', asyncHandler(async (req: Request<{}, {}, {}, ShipmentQuery>, res: Response) => {
  const {
    page = '1',
    limit = '10',
    search,
    paymentStatus,
    shipmentStatus,
    city,
    state,
    courierPartner,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object - filter by userId (user's own data only)
  const filter: any = {
    userId: req.user!.id
  };

  // Text search across multiple fields
  if (search) {
    filter.$text = { $search: search };
  }

  // Status filters
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }
  if (shipmentStatus) {
    filter.shipmentStatus = shipmentStatus;
  }

  // Location filters
  if (city) {
    filter.city = new RegExp(city, 'i');
  }
  if (state) {
    filter.state = new RegExp(state, 'i');
  }
  if (courierPartner) {
    filter.courierPartner = new RegExp(courierPartner, 'i');
  }

  // Date range filter
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) {
      filter.date.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      filter.date.$lte = new Date(dateTo);
    }
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sort options
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  try {
    // Execute query with pagination
    const [shipments, total] = await Promise.all([
      Shipment.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Shipment.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: shipments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Error fetching shipments');
  }
}));

/**
 * @route   GET /api/shipments/:id
 * @desc    Get single shipment by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shipment = await Shipment.findOne({ 
    _id: id, 
    userId: req.user!.id 
  });

  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }



  res.json({
    success: true,
    data: shipment
  });
}));

/**
 * @route   POST /api/shipments
 * @desc    Create new shipment
 * @access  Public
 */
router.post('/', validateShipment, asyncHandler(async (req: Request, res: Response) => {
  const shipmentData = {
    ...req.body,
    userId: req.user!.id,
    createdBy: req.user!.email,
    updatedBy: req.user!.email
  };

  const shipment = new Shipment(shipmentData);
  await shipment.save();

  res.status(201).json({
    success: true,
    data: shipment,
    message: 'Shipment created successfully'
  });
}));

/**
 * @route   PUT /api/shipments/:id
 * @desc    Update shipment
 * @access  Public
 */
router.put('/:id', validateShipmentUpdate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shipment = await Shipment.findOne({ 
    _id: id, 
    userId: req.user!.id 
  });
  
  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }

  // Update fields
  Object.assign(shipment, {
    ...req.body,
    updatedBy: req.user!.email
  });

  await shipment.save();

  res.json({
    success: true,
    data: shipment,
    message: 'Shipment updated successfully'
  });
}));

/**
 * @route   DELETE /api/shipments/:id
 * @desc    Delete shipment
 * @access  Public
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shipment = await Shipment.findOne({ 
    _id: id, 
    userId: req.user!.id 
  });
  
  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }

  await Shipment.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Shipment deleted successfully'
  });
}));

/**
 * @route   GET /api/shipments/stats/summary
 * @desc    Get shipment statistics summary
 * @access  Public
 */
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const stats = await Shipment.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalShipments: { $sum: 1 },
        totalAmount: { $sum: '$saleCost' },
        avgAmount: { $avg: '$saleCost' },
        totalWeight: { $sum: '$weight' }
      }
    }
  ]);

  const statusStats = await Shipment.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$shipmentStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const paymentStats = await Shipment.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$saleCost' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      summary: stats[0] || {
        totalShipments: 0,
        totalAmount: 0,
        avgAmount: 0,
        totalWeight: 0
      },
      statusBreakdown: statusStats,
      paymentBreakdown: paymentStats
    }
  });
}));

/**
 * @route   GET /api/shipments/export/csv
 * @desc    Export shipments to CSV
 * @access  Public
 */
router.get('/export/csv', asyncHandler(async (req: Request, res: Response) => {
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const path = require('path');

  // Get all shipments or apply filters - only for current user
  const filter: any = {
    userId: req.user!.id
  };
  const { search, paymentStatus, shipmentStatus, city, state, dateFrom, dateTo } = req.query;

  if (search) filter.$text = { $search: search };
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (shipmentStatus) filter.shipmentStatus = shipmentStatus;
  if (city) filter.city = new RegExp(city as string, 'i');
  if (state) filter.state = new RegExp(state as string, 'i');

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
    if (dateTo) filter.date.$lte = new Date(dateTo as string);
  }

  const shipments = await Shipment.find(filter).lean();

  // Define CSV headers
  const csvHeaders = [
    { id: 'date', title: 'Date' },
    { id: 'pickupCustomerName', title: 'Pickup Customer Name' },
    { id: 'pickupCustomerMoNo', title: 'Pickup Customer Mobile' },
    { id: 'pickupRef', title: 'Pickup Reference' },
    { id: 'awb', title: 'AWB Number' },
    { id: 'courierPartner', title: 'Courier Partner' },
    { id: 'weight', title: 'Weight' },
    { id: 'pinCode', title: 'Pin Code' },
    { id: 'city', title: 'City' },
    { id: 'state', title: 'State' },
    { id: 'bookingCode', title: 'Booking Code' },
    { id: 'baseAmount', title: 'Base Amount' },
    { id: 'royaltyMargin', title: 'Royalty Margin' },
    { id: 'totalBeforeGst', title: 'Total Before GST' },
    { id: 'gst', title: 'GST' },
    { id: 'totalAfterGst', title: 'Total After GST' },
    { id: 'grandTotal', title: 'Grand Total' },
    { id: 'saleCost', title: 'Sale Cost' },
    { id: 'customerName', title: 'Customer Name' },
    { id: 'customerMoNo', title: 'Customer Mobile' },
    { id: 'paymentStatus', title: 'Payment Status' },
    { id: 'shipmentStatus', title: 'Shipment Status' },
    { id: 'createdAt', title: 'Created At' }
  ];

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `shipments-export-${timestamp}.csv`;
  const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

  // Create CSV writer
  const csvWriter = createCsvWriter({
    path: filepath,
    header: csvHeaders
  });

  // Format data for CSV
  const csvData = shipments.map(shipment => ({
    ...shipment,
    date: new Date(shipment.date).toISOString().split('T')[0],
    createdAt: new Date(shipment.createdAt).toISOString()
  }));

  await csvWriter.writeRecords(csvData);

  // Send file
  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
    // Clean up file after sending
    setTimeout(() => {
      if (require('fs').existsSync(filepath)) {
        require('fs').unlinkSync(filepath);
      }
    }, 60000); // Delete after 1 minute
  });
}));

/**
 * @route   GET /api/shipments/export/xlsx
 * @desc    Export shipments to XLSX
 * @access  Public
 */
router.get('/export/xlsx', asyncHandler(async (req: Request, res: Response) => {
  const XLSX = require('xlsx');
  const path = require('path');

  // Get all shipments or apply filters (same logic as CSV export) - only for current user
  const filter: any = {
    userId: req.user!.id
  };
  const { search, paymentStatus, shipmentStatus, city, state, dateFrom, dateTo } = req.query;

  if (search) filter.$text = { $search: search };
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (shipmentStatus) filter.shipmentStatus = shipmentStatus;
  if (city) filter.city = new RegExp(city as string, 'i');
  if (state) filter.state = new RegExp(state as string, 'i');

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
    if (dateTo) filter.date.$lte = new Date(dateTo as string);
  }

  const shipments = await Shipment.find(filter).lean();

  // Format data for XLSX
  const xlsxData = shipments.map(shipment => ({
    'Date': new Date(shipment.date).toISOString().split('T')[0],
    'Pickup Customer Name': shipment.pickupCustomerName,
    'Pickup Customer Mobile': shipment.pickupCustomerMoNo,
    'Pickup Reference': shipment.pickupRef || '',
    'AWB Number': shipment.awb,
    'Courier Partner': shipment.courierPartner,
    'Weight': shipment.weight,
    'Pin Code': shipment.pinCode,
    'City': shipment.city,
    'State': shipment.state,
    'Booking Code': shipment.bookingCode || '',
    'Base Amount': shipment.baseAmount,
    'Royalty Margin': shipment.royaltyMargin,
    'Total Before GST': shipment.totalBeforeGst,
    'GST': shipment.gst,
    'Total After GST': shipment.totalAfterGst,
    'Grand Total': shipment.grandTotal,
    'Sale Cost': shipment.saleCost,
    'Customer Name': shipment.customerName,
    'Customer Mobile': shipment.customerMoNo,
    'Payment Status': shipment.paymentStatus,
    'Shipment Status': shipment.shipmentStatus,
    'Created At': new Date(shipment.createdAt).toISOString()
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(xlsxData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `shipments-export-${timestamp}.xlsx`;
  const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

  // Write file
  XLSX.writeFile(workbook, filepath);

  // Send file
  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
    // Clean up file after sending
    setTimeout(() => {
      if (require('fs').existsSync(filepath)) {
        require('fs').unlinkSync(filepath);
      }
    }, 60000); // Delete after 1 minute
  });
}));

export default router;
