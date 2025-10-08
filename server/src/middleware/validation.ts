import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

// Validation schemas
const shipmentSchema = Joi.object({
  date: Joi.date().required().messages({
    'any.required': 'Date is required',
    'date.base': 'Date must be a valid date'
  }),
  pickupCustomerName: Joi.string().trim().max(100).required().messages({
    'any.required': 'Pickup customer name is required',
    'string.max': 'Pickup customer name cannot exceed 100 characters'
  }),
  pickupCustomerMoNo: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required().messages({
    'any.required': 'Pickup customer mobile number is required',
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  pickupRef: Joi.string().trim().max(50).allow('').optional(),
  awb: Joi.string().trim().max(50).required().messages({
    'any.required': 'AWB number is required',
    'string.max': 'AWB number cannot exceed 50 characters'
  }),
  awbImageUrl: Joi.string().allow('').optional(),
  courierPartner: Joi.string().trim().max(50).required().messages({
    'any.required': 'Courier partner is required',
    'string.max': 'Courier partner name cannot exceed 50 characters'
  }),
  weight: Joi.number().min(0).required().messages({
    'any.required': 'Weight is required',
    'number.min': 'Weight must be greater than or equal to 0'
  }),
  weightImageUrl: Joi.string().allow('').optional(),
  pinCode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'any.required': 'Pin code is required',
    'string.pattern.base': 'Pin code must be exactly 6 digits'
  }),
  city: Joi.string().trim().max(50).required().messages({
    'any.required': 'City is required',
    'string.max': 'City name cannot exceed 50 characters'
  }),
  state: Joi.string().trim().max(50).required().messages({
    'any.required': 'State is required',
    'string.max': 'State name cannot exceed 50 characters'
  }),
  bookingCode: Joi.string().trim().max(50).allow('').optional(),
  baseAmount: Joi.number().min(0).required().messages({
    'any.required': 'Base amount is required',
    'number.min': 'Base amount must be greater than or equal to 0'
  }),
  royaltyMargin: Joi.number().min(0).required().messages({
    'any.required': 'Royalty margin is required',
    'number.min': 'Royalty margin must be greater than or equal to 0'
  }),
  gst: Joi.number().min(0).required().messages({
    'any.required': 'GST is required',
    'number.min': 'GST must be greater than or equal to 0'
  }),
  stickerUrl: Joi.string().allow('').optional(),
  saleCost: Joi.number().min(0).required().messages({
    'any.required': 'Sale cost is required',
    'number.min': 'Sale cost must be greater than or equal to 0'
  }),
  customerName: Joi.string().trim().max(100).required().messages({
    'any.required': 'Customer name is required',
    'string.max': 'Customer name cannot exceed 100 characters'
  }),
  customerMoNo: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required().messages({
    'any.required': 'Customer mobile number is required',
    'string.pattern.base': 'Please provide a valid customer phone number'
  }),
  paymentStatus: Joi.string().valid('Pending', 'Paid', 'Partial', 'Refunded').default('Pending'),
  shipmentStatus: Joi.string().valid('Created', 'Picked', 'InTransit', 'Delivered', 'RTS', 'Cancelled').default('Created'),
  additionalFields: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
  createdBy: Joi.string().trim().optional(),
  updatedBy: Joi.string().trim().optional(),
  userId: Joi.string().optional() // Added by backend automatically
});

const shipmentUpdateSchema = shipmentSchema.fork(
  ['date', 'pickupCustomerName', 'pickupCustomerMoNo', 'awb', 'courierPartner', 'weight', 'pinCode', 'city', 'state', 'baseAmount', 'royaltyMargin', 'gst', 'saleCost', 'customerName', 'customerMoNo'],
  (schema) => schema.optional()
);

/**
 * Middleware to validate shipment creation data
 */
export const validateShipment = (req: Request, res: Response, next: NextFunction) => {
  // Log the incoming request body for debugging
  console.log('=== SHIPMENT VALIDATION DEBUG ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const { error, value } = shipmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    console.log('Validation errors:', error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    })));

    const errorMessages = error.details.map(detail => detail.message);
    throw new ApiError(400, `Validation error: ${errorMessages.join(', ')}`);
  }

  console.log('Validation successful, processed data:', JSON.stringify(value, null, 2));
  req.body = value;
  next();
};

/**
 * Middleware to validate shipment update data
 */
export const validateShipmentUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = shipmentUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new ApiError(400, `Validation error: ${errorMessages.join(', ')}`);
  }

  req.body = value;
  next();
};

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new ApiError(400, `Validation error: ${errorMessages.join(', ')}`);
    }

    req.body = value;
    next();
  };
};
