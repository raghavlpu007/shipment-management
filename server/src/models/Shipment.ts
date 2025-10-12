import mongoose, { Document, Schema } from 'mongoose';

// Enums for status fields
export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  PARTIAL = 'Partial',
  REFUNDED = 'Refunded'
}

export enum ShipmentStatus {
  CREATED = 'Created',
  PICKED = 'Picked',
  IN_TRANSIT = 'InTransit',
  DELIVERED = 'Delivered',
  RTS = 'RTS',
  CANCELLED = 'Cancelled'
}

// Interface for the Shipment document
export interface IShipment extends Document {
  date: Date;
  pickupCustomerName: string;
  pickupCustomerMoNo: string;
  pickupRef: string;
  awb: string;
  awbImageUrl?: string;
  courierPartner: string;
  weight: number;
  weightImageUrl?: string;
  pinCode: string;
  city: string;
  state: string;
  bookingCode: string;
  baseAmount: number;
  royaltyMargin: number;
  totalBeforeGst: number; // Computed field
  gst: number;
  totalAfterGst: number; // Computed field
  stickerUrl?: string;
  grandTotal: number; // Computed field
  saleCost: number;
  customerName: string;
  customerMoNo: string;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  additionalFields: Map<string, any>;
  createdBy: string;
  updatedBy: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

// Shipment Schema
const ShipmentSchema = new Schema<IShipment>({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  pickupCustomerName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Pickup customer name cannot exceed 100 characters']
  },
  pickupCustomerMoNo: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        return validatePhone(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  pickupRef: {
    type: String,
    trim: true,
    maxlength: [50, 'Pickup reference cannot exceed 50 characters']
  },
  awb: {
    type: String,
    required: [true, 'AWB number is required'],
    trim: true,
    maxlength: [50, 'AWB number cannot exceed 50 characters']
  },
  awbImageUrl: {
    type: String,
    trim: true
  },
  courierPartner: {
    type: String,
    required: [true, 'Courier partner is required'],
    trim: true,
    maxlength: [50, 'Courier partner name cannot exceed 50 characters']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be greater than or equal to 0']
  },
  weightImageUrl: {
    type: String,
    trim: true
  },
  pinCode: {
    type: String,
    required: [true, 'Pin code is required'],
    validate: {
      validator: validatePincode,
      message: 'Pin code must be exactly 6 digits'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  bookingCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Booking code cannot exceed 50 characters']
  },
  baseAmount: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Base amount must be greater than or equal to 0']
  },
  royaltyMargin: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Royalty margin must be greater than or equal to 0']
  },
  totalBeforeGst: {
    type: Number,
    min: [0, 'Total before GST must be greater than or equal to 0']
  },
  gst: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'GST must be greater than or equal to 0']
  },
  totalAfterGst: {
    type: Number,
    min: [0, 'Total after GST must be greater than or equal to 0']
  },
  stickerUrl: {
    type: String,
    trim: true
  },
  grandTotal: {
    type: Number,
    min: [0, 'Grand total must be greater than or equal to 0']
  },
  saleCost: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Sale cost must be greater than or equal to 0']
  },
  customerName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerMoNo: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        return validatePhone(v);
      },
      message: 'Please provide a valid customer phone number'
    }
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  shipmentStatus: {
    type: String,
    enum: Object.values(ShipmentStatus),
    default: ShipmentStatus.CREATED
  },
  additionalFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true
  },
  updatedBy: {
    type: String,
    required: [true, 'Updated by is required'],
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate derived fields
ShipmentSchema.pre('save', function(next) {
  // Use default values if fields are missing
  const baseAmount = this.baseAmount || 0;
  const royaltyMargin = this.royaltyMargin || 0;
  const gst = this.gst || 0;

  // Calculate totalBeforeGst
  this.totalBeforeGst = baseAmount + royaltyMargin;

  // Calculate totalAfterGst
  this.totalAfterGst = this.totalBeforeGst + gst;

  // Calculate grandTotal
  this.grandTotal = this.totalAfterGst;

  next();
});

// Indexes for better query performance
ShipmentSchema.index({ userId: 1, date: -1 });
ShipmentSchema.index({ userId: 1, awb: 1 }, { unique: true });
ShipmentSchema.index({ userId: 1, customerName: 1 });
ShipmentSchema.index({ userId: 1, city: 1, state: 1 });
ShipmentSchema.index({ userId: 1, paymentStatus: 1 });
ShipmentSchema.index({ userId: 1, shipmentStatus: 1 });
ShipmentSchema.index({ userId: 1, createdAt: -1 });

// Text index for search functionality
ShipmentSchema.index({
  pickupCustomerName: 'text',
  awb: 'text',
  customerName: 'text',
  city: 'text',
  state: 'text',
  courierPartner: 'text'
});

export const Shipment = mongoose.model<IShipment>('Shipment', ShipmentSchema);
