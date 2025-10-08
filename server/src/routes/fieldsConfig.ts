import express, { Request, Response } from 'express';
import { FieldsConfig, IFieldsConfig } from '../models';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/fields-config
 * @desc    Get all field configurations
 * @access  Public
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const fieldsConfig = await FieldsConfig.find().sort({ order: 1 });

  res.json({
    success: true,
    data: fieldsConfig
  });
}));

/**
 * @route   GET /api/fields-config/:key
 * @desc    Get single field configuration by key
 * @access  Public
 */
router.get('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  const fieldConfig = await FieldsConfig.findOne({ key });
  
  if (!fieldConfig) {
    throw new ApiError(404, 'Field configuration not found');
  }

  res.json({
    success: true,
    data: fieldConfig
  });
}));

/**
 * @route   POST /api/fields-config
 * @desc    Create new field configuration
 * @access  Public
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    key,
    label,
    type,
    enumValues,
    visible = true,
    order,
    required = false,
    placeholder,
    helpText,
    defaultValue,
    validation,
    dependencies,
    width = 'full',
    group,
    icon,
    readonly = false
  } = req.body;

  // Validate required fields
  if (!key || !label || !type) {
    throw new ApiError(400, 'Key, label, and type are required fields');
  }

  // Validate key format
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
    throw new ApiError(400, 'Field key must start with a letter and contain only letters, numbers, and underscores');
  }

  // Check if field with this key already exists
  const existingField = await FieldsConfig.findOne({ key });
  if (existingField) {
    throw new ApiError(400, 'Field with this key already exists');
  }

  // Validate enum values for ENUM and RADIO types
  if ((type === 'enum' || type === 'radio') && (!enumValues || enumValues.length === 0)) {
    throw new ApiError(400, 'Enum values are required for enum and radio field types');
  }

  // If no order specified, set it to the highest order + 1
  let fieldOrder = order;
  if (!fieldOrder) {
    const lastField = await FieldsConfig.findOne().sort({ order: -1 });
    fieldOrder = lastField ? lastField.order + 1 : 1;
  }

  const fieldConfig = new FieldsConfig({
    key,
    label,
    type,
    enumValues,
    visible,
    order: fieldOrder,
    required,
    placeholder,
    helpText,
    defaultValue,
    validation,
    dependencies,
    width,
    group,
    icon,
    readonly
  });

  await fieldConfig.save();

  res.status(201).json({
    success: true,
    data: fieldConfig,
    message: 'Field configuration created successfully'
  });
}));

/**
 * @route   PUT /api/fields-config/:key
 * @desc    Update field configuration
 * @access  Public
 */
router.put('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const updates = req.body;

  const fieldConfig = await FieldsConfig.findOne({ key });

  if (!fieldConfig) {
    throw new ApiError(404, 'Field configuration not found');
  }

  // Don't allow changing the key
  delete updates.key;

  // Validate enum values for ENUM and RADIO types if type is being updated
  if (updates.type && (updates.type === 'enum' || updates.type === 'radio')) {
    const enumValues = updates.enumValues || fieldConfig.enumValues;
    if (!enumValues || enumValues.length === 0) {
      throw new ApiError(400, 'Enum values are required for enum and radio field types');
    }
  }

  // If updating order, ensure it's valid
  if (updates.order !== undefined && updates.order < 0) {
    throw new ApiError(400, 'Field order must be greater than or equal to 0');
  }

  Object.assign(fieldConfig, updates);
  await fieldConfig.save();

  res.json({
    success: true,
    data: fieldConfig,
    message: 'Field configuration updated successfully'
  });
}));

/**
 * @route   DELETE /api/fields-config/:key
 * @desc    Delete field configuration
 * @access  Public
 */
router.delete('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  const fieldConfig = await FieldsConfig.findOne({ key });
  
  if (!fieldConfig) {
    throw new ApiError(404, 'Field configuration not found');
  }

  await FieldsConfig.deleteOne({ key });

  res.json({
    success: true,
    message: 'Field configuration deleted successfully'
  });
}));

/**
 * @route   PUT /api/fields-config/bulk/update
 * @desc    Bulk update field configurations (for reordering, visibility changes)
 * @access  Public
 */
router.put('/bulk/update', asyncHandler(async (req: Request, res: Response) => {
  const { fields } = req.body;

  if (!Array.isArray(fields)) {
    throw new ApiError(400, 'Fields must be an array');
  }

  // Update each field configuration
  const updatePromises = fields.map(async (field: any) => {
    const { key, ...updates } = field;
    
    if (!key) {
      throw new ApiError(400, 'Each field must have a key');
    }

    return FieldsConfig.findOneAndUpdate(
      { key },
      updates,
      { new: true, runValidators: true }
    );
  });

  const updatedFields = await Promise.all(updatePromises);

  res.json({
    success: true,
    data: updatedFields,
    message: 'Field configurations updated successfully'
  });
}));

/**
 * @route   POST /api/fields-config/initialize
 * @desc    Initialize default field configurations
 * @access  Public
 */
router.post('/initialize', asyncHandler(async (req: Request, res: Response) => {
  // Check if any field configurations already exist
  const existingCount = await FieldsConfig.countDocuments();

  if (existingCount > 0) {
    return res.json({
      success: true,
      message: 'Field configurations already exist',
      data: await FieldsConfig.find().sort({ order: 1 })
    });
  }

  // Get default configurations from the model
  const defaultConfigs = (FieldsConfig as any).getDefaultConfigs();

  // Insert default configurations
  const createdConfigs = await FieldsConfig.insertMany(defaultConfigs);

  return res.status(201).json({
    success: true,
    data: createdConfigs,
    message: 'Default field configurations initialized successfully'
  });
}));

/**
 * @route   GET /api/fields-config/visible/list
 * @desc    Get only visible field configurations for forms
 * @access  Public
 */
router.get('/visible/list', asyncHandler(async (req: Request, res: Response) => {
  const visibleFields = await FieldsConfig.find({ visible: true }).sort({ order: 1 });

  res.json({
    success: true,
    data: visibleFields
  });
}));

/**
 * @route   POST /api/fields-config/duplicate/:key
 * @desc    Duplicate a field configuration
 * @access  Public
 */
router.post('/duplicate/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { newKey, newLabel } = req.body;

  if (!newKey || !newLabel) {
    throw new ApiError(400, 'New key and label are required');
  }

  // Validate new key format
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newKey)) {
    throw new ApiError(400, 'Field key must start with a letter and contain only letters, numbers, and underscores');
  }

  // Check if source field exists
  const sourceField = await FieldsConfig.findOne({ key });
  if (!sourceField) {
    throw new ApiError(404, 'Source field configuration not found');
  }

  // Check if new key already exists
  const existingField = await FieldsConfig.findOne({ key: newKey });
  if (existingField) {
    throw new ApiError(400, 'Field with this key already exists');
  }

  // Get next order
  const lastField = await FieldsConfig.findOne().sort({ order: -1 });
  const newOrder = lastField ? lastField.order + 1 : 1;

  // Create duplicate field
  const duplicateField = new FieldsConfig({
    key: newKey,
    label: newLabel,
    type: sourceField.type,
    enumValues: sourceField.enumValues,
    visible: sourceField.visible,
    order: newOrder,
    required: sourceField.required,
    placeholder: sourceField.placeholder,
    helpText: sourceField.helpText,
    defaultValue: sourceField.defaultValue,
    validation: sourceField.validation,
    dependencies: sourceField.dependencies,
    width: sourceField.width,
    group: sourceField.group,
    icon: sourceField.icon,
    readonly: sourceField.readonly
  });

  await duplicateField.save();

  res.status(201).json({
    success: true,
    data: duplicateField,
    message: 'Field configuration duplicated successfully'
  });
}));

/**
 * @route   POST /api/fields-config/reorder
 * @desc    Reorder field configurations
 * @access  Public
 */
router.post('/reorder', asyncHandler(async (req: Request, res: Response) => {
  const { fieldOrders } = req.body;

  if (!fieldOrders || !Array.isArray(fieldOrders)) {
    throw new ApiError(400, 'Field orders array is required');
  }

  // Update each field's order
  const updatePromises = fieldOrders.map(({ key, order }) =>
    FieldsConfig.findOneAndUpdate({ key }, { order }, { new: true })
  );

  const updatedFields = await Promise.all(updatePromises);

  res.json({
    success: true,
    data: updatedFields,
    message: 'Field configurations reordered successfully'
  });
}));

/**
 * @route   GET /api/fields-config/groups
 * @desc    Get all field groups
 * @access  Public
 */
router.get('/groups', asyncHandler(async (req: Request, res: Response) => {
  const groups = await FieldsConfig.distinct('group', {
    group: {
      $ne: null,
      $exists: true,
      $not: { $eq: '' }
    }
  });

  res.json({
    success: true,
    data: groups
  });
}));

/**
 * @route   GET /api/fields-config/types
 * @desc    Get all available field types
 * @access  Public
 */
router.get('/types', asyncHandler(async (req: Request, res: Response) => {
  const { FieldType } = require('../models/FieldsConfig');

  const fieldTypes = (Object.values(FieldType) as string[]).map((type: string) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
    description: getFieldTypeDescription(type)
  }));

  res.json({
    success: true,
    data: fieldTypes
  });
}));

// Helper function to get field type descriptions
function getFieldTypeDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    text: 'Single line text input',
    number: 'Numeric input with validation',
    date: 'Date picker',
    time: 'Time picker',
    datetime: 'Date and time picker',
    enum: 'Dropdown selection from predefined options',
    boolean: 'True/false checkbox',
    checkbox: 'Multiple selection checkboxes',
    radio: 'Single selection from radio buttons',
    email: 'Email address input with validation',
    phone: 'Phone number input with formatting',
    url: 'URL input with validation',
    textarea: 'Multi-line text input',
    file: 'File upload',
    password: 'Password input (hidden text)',
    color: 'Color picker',
    range: 'Range slider input'
  };

  return descriptions[type] || 'Custom field type';
}

export default router;
