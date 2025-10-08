import mongoose, { Document, Schema } from 'mongoose';

// Enum for field types
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  ENUM = 'enum',
  BOOLEAN = 'boolean',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  TEXTAREA = 'textarea',
  FILE = 'file',
  PASSWORD = 'password',
  COLOR = 'color',
  RANGE = 'range'
}

// Interface for validation rules
export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  step?: number;
  accept?: string; // For file types
  multiple?: boolean; // For file and select types
  custom?: string; // Custom validation function name
}

// Interface for field dependencies
export interface FieldDependency {
  field: string;
  value: any;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
}

// Interface for the FieldsConfig document
export interface IFieldsConfig extends Document {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: string[];
  visible: boolean;
  order: number;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  validation?: ValidationRule;
  dependencies?: FieldDependency[];
  width?: 'full' | 'half' | 'third' | 'quarter';
  group?: string;
  icon?: string;
  readonly?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// FieldsConfig Schema
const FieldsConfigSchema = new Schema<IFieldsConfig>({
  key: {
    type: String,
    required: [true, 'Field key is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Field key cannot exceed 50 characters'],
    match: [/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Field key must start with a letter and contain only letters, numbers, and underscores']
  },
  label: {
    type: String,
    required: [true, 'Field label is required'],
    trim: true,
    maxlength: [100, 'Field label cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: Object.values(FieldType),
    required: [true, 'Field type is required']
  },
  enumValues: {
    type: [String],
    validate: {
      validator: function(this: IFieldsConfig, values: string[]) {
        // Only validate enumValues if type is ENUM or RADIO
        if (this.type === FieldType.ENUM || this.type === FieldType.RADIO) {
          return values && values.length > 0;
        }
        return true;
      },
      message: 'Enum values are required when field type is enum or radio'
    }
  },
  visible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: [true, 'Field order is required'],
    min: [0, 'Field order must be greater than or equal to 0']
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    trim: true,
    maxlength: [200, 'Placeholder cannot exceed 200 characters']
  },
  helpText: {
    type: String,
    trim: true,
    maxlength: [500, 'Help text cannot exceed 500 characters']
  },
  validation: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    minLength: {
      type: Number
    },
    maxLength: {
      type: Number
    },
    pattern: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Validation message cannot exceed 200 characters']
    },
    step: {
      type: Number
    },
    accept: {
      type: String,
      trim: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    custom: {
      type: String,
      trim: true
    }
  },
  defaultValue: {
    type: Schema.Types.Mixed,
    required: false
  },
  dependencies: [{
    field: {
      type: String,
      required: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'],
      default: 'equals'
    }
  }],
  width: {
    type: String,
    enum: ['full', 'half', 'third', 'quarter'],
    default: 'full'
  },
  group: {
    type: String,
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  readonly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (key already has unique: true, so no need to index again)
FieldsConfigSchema.index({ order: 1 });
FieldsConfigSchema.index({ visible: 1 });

// Static method to get default field configurations
FieldsConfigSchema.statics.getDefaultConfigs = function() {
  return [
    {
      key: 'date',
      label: 'Date',
      type: FieldType.DATE,
      visible: true,
      order: 1,
      required: true,
      width: 'third'
    },
    {
      key: 'pickupCustomerName',
      label: 'Pickup Customer Name',
      type: FieldType.TEXT,
      visible: true,
      order: 2,
      required: true,
      placeholder: 'Enter pickup customer name',
      width: 'third'
    },
    {
      key: 'pickupCustomerMoNo',
      label: 'Pickup Customer Mobile',
      type: FieldType.PHONE,
      visible: true,
      order: 3,
      required: true,
      placeholder: 'Enter mobile number',
      width: 'third'
    },
    {
      key: 'pickupRef',
      label: 'Pickup Reference',
      type: FieldType.TEXT,
      visible: true,
      order: 4,
      required: false,
      placeholder: 'Enter pickup reference',
      width: 'third'
    },
    {
      key: 'awb',
      label: 'AWB Number',
      type: FieldType.TEXT,
      visible: true,
      order: 5,
      required: true,
      placeholder: 'Enter AWB number',
      width: 'third'
    },
    {
      key: 'awbImageUrl',
      label: 'AWB Image',
      type: FieldType.FILE,
      visible: true,
      order: 6,
      required: false,
      width: 'third'
    },
    {
      key: 'courierPartner',
      label: 'Courier Partner',
      type: FieldType.TEXT,
      visible: true,
      order: 7,
      required: true,
      placeholder: 'Enter courier partner name',
      width: 'third'
    },
    {
      key: 'weight',
      label: 'Weight (kg)',
      type: FieldType.NUMBER,
      visible: true,
      order: 8,
      required: true,
      placeholder: 'Enter weight in kg',
      validation: { min: 0 },
      width: 'third'
    },
    {
      key: 'weightImageUrl',
      label: 'Weight Image',
      type: FieldType.FILE,
      visible: true,
      order: 9,
      required: false,
      width: 'third'
    },
    {
      key: 'pinCode',
      label: 'Pin Code',
      type: FieldType.TEXT,
      visible: true,
      order: 10,
      required: true,
      placeholder: 'Enter 6-digit pin code',
      validation: { pattern: '^\\d{6}$', message: 'Pin code must be exactly 6 digits' },
      width: 'third'
    },
    {
      key: 'city',
      label: 'City',
      type: FieldType.TEXT,
      visible: true,
      order: 11,
      required: true,
      placeholder: 'Enter city name',
      width: 'third'
    },
    {
      key: 'state',
      label: 'State',
      type: FieldType.TEXT,
      visible: true,
      order: 12,
      required: true,
      placeholder: 'Enter state name',
      width: 'third'
    },
    {
      key: 'bookingCode',
      label: 'Booking Code',
      type: FieldType.TEXT,
      visible: true,
      order: 13,
      required: false,
      placeholder: 'Enter booking code',
      width: 'third'
    },
    {
      key: 'baseAmount',
      label: 'Base Amount',
      type: FieldType.NUMBER,
      visible: true,
      order: 14,
      required: true,
      placeholder: 'Enter base amount',
      validation: { min: 0 },
      width: 'third'
    },
    {
      key: 'royaltyMargin',
      label: 'Royalty Margin',
      type: FieldType.NUMBER,
      visible: true,
      order: 15,
      required: true,
      placeholder: 'Enter royalty margin',
      validation: { min: 0 },
      width: 'third'
    },
    {
      key: 'gst',
      label: 'GST Amount',
      type: FieldType.NUMBER,
      visible: true,
      order: 16,
      required: true,
      placeholder: 'Enter GST amount',
      validation: { min: 0 },
      width: 'third'
    },
    {
      key: 'stickerUrl',
      label: 'Sticker',
      type: FieldType.FILE,
      visible: true,
      order: 17,
      required: false,
      width: 'third'
    },
    {
      key: 'saleCost',
      label: 'Sale Cost',
      type: FieldType.NUMBER,
      visible: true,
      order: 18,
      required: true,
      placeholder: 'Enter sale cost',
      validation: { min: 0 },
      width: 'third'
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      type: FieldType.TEXT,
      visible: true,
      order: 19,
      required: true,
      placeholder: 'Enter customer name',
      width: 'half'
    },
    {
      key: 'customerMoNo',
      label: 'Customer Mobile',
      type: FieldType.PHONE,
      visible: true,
      order: 20,
      required: true,
      placeholder: 'Enter customer mobile number',
      width: 'third'
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: FieldType.ENUM,
      enumValues: ['Pending', 'Paid', 'Partial', 'Refunded'],
      visible: true,
      order: 21,
      required: true,
      width: 'third'
    },
    {
      key: 'shipmentStatus',
      label: 'Shipment Status',
      type: FieldType.ENUM,
      enumValues: ['Created', 'Picked', 'InTransit', 'Delivered', 'RTS', 'Cancelled'],
      visible: true,
      order: 22,
      required: true,
      width: 'third'
    }
  ];
};

export const FieldsConfig = mongoose.model<IFieldsConfig>('FieldsConfig', FieldsConfigSchema);
