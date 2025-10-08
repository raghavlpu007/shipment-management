// Enums
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

// Interfaces
export interface Shipment {
  _id: string;
  date: string;
  pickupCustomerName: string;
  pickupCustomerMoNo: string;
  pickupRef?: string;
  awb: string;
  awbImageUrl?: string;
  courierPartner: string;
  weight: number;
  weightImageUrl?: string;
  pinCode: string;
  city: string;
  state: string;
  bookingCode?: string;
  baseAmount: number;
  royaltyMargin: number;
  totalBeforeGst?: number;
  gst: number;
  totalAfterGst?: number;
  stickerUrl?: string;
  grandTotal?: number;
  saleCost: number;
  customerName: string;
  customerMoNo: string;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  additionalFields?: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentData extends Omit<Shipment, '_id' | 'totalBeforeGst' | 'totalAfterGst' | 'grandTotal' | 'createdAt' | 'updatedAt'> {}

export interface UpdateShipmentData extends Partial<CreateShipmentData> {}

// Pincode API Types
export interface PincodeAPIRecord {
  pincode: string
  districtname: string
  statename: string
  officename: string
  divisionname: string
  regionname: string
}

export interface PincodeAPIResponse {
  records: PincodeAPIRecord[]
  total: number
  count: number
  help: string
}

export interface PincodeData {
  pincode: string
  city: string
  state: string
  district: string
  division: string
  region: string
}

export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  step?: number;
  accept?: string;
  multiple?: boolean;
  custom?: string;
}

export interface FieldDependency {
  field: string;
  value: any;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
}

export interface FieldsConfig {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldsConfigData extends Omit<FieldsConfig, '_id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateFieldsConfigData extends Partial<CreateFieldsConfigData> {}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ShipmentsResponse extends ApiResponse<Shipment[]> {
  pagination: PaginationInfo;
}

export interface ShipmentStatsResponse extends ApiResponse<{
  summary: {
    totalShipments: number;
    totalAmount: number;
    avgAmount: number;
    totalWeight: number;
  };
  statusBreakdown: Array<{ _id: string; count: number }>;
  paymentBreakdown: Array<{ _id: string; count: number; totalAmount: number }>;
}> {}

// Query parameters
export interface ShipmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  city?: string;
  state?: string;
  courierPartner?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// File upload types
export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface UploadResponse extends ApiResponse<UploadedFile | UploadedFile[]> {}

// Import/Export types
export interface ImportPreviewData {
  filename: string;
  totalRows: number;
  headers: string[];
  sampleData: any[];
  availableFields: Array<{
    key: string;
    label: string;
    type: string;
  }>;
  suggestedMappings: Record<string, string>;
}

export interface ImportPreviewResponse extends ApiResponse<ImportPreviewData> {}

export interface ImportExecuteData {
  filename: string;
  mappings: Record<string, string>;
  defaultValues?: Record<string, any>;
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

export interface ImportExecuteResponse extends ApiResponse<ImportResult> {}

// Form types
export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  enumValues?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Table types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

// Filter types
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'dateRange';
  options?: FilterOption[];
  placeholder?: string;
}
