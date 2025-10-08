import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

const API_BASE_URL = 'https://api.data.gov.in/resource/04cbe4b1-2f2b-4c39-a1d5-1c2e28bc0e32';
const API_KEY = '579b464db66ec23bdd000001702d8843fff1475440c90f70f44c0cfd';

/**
 * @route   GET /api/pincode/:pincode
 * @desc    Get pincode details (proxy to government API)
 * @access  Public
 */
router.get('/:pincode', asyncHandler(async (req: Request, res: Response) => {
  const { pincode } = req.params;

  // Validate pincode format
  if (!/^\d{6}$/.test(pincode)) {
    throw new ApiError(400, 'Invalid pincode format. Must be 6 digits.');
  }

  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.append('api-key', API_KEY);
    url.searchParams.append('format', 'json');
    url.searchParams.append('filters[pincode]', pincode);
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch pincode data: ${response.statusText}`);
    }

    const data: any = await response.json();

    if (!data.records || data.records.length === 0) {
      throw new ApiError(404, 'No data found for this pincode');
    }

    const record = data.records[0];
    const transformedData = {
      pincode: record.pincode,
      city: record.districtname || '',
      state: record.statename || '',
      district: record.districtname || '',
      division: record.divisionname || '',
      region: record.regionname || '',
    };

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to fetch pincode data from external API');
  }
}));

export default router;

