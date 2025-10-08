import mongoose, { Document, Schema } from 'mongoose'

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export enum Permission {
  // Field Configuration Permissions
  FIELD_CONFIG_VIEW = 'field_config_view',
  FIELD_CONFIG_CREATE = 'field_config_create',
  FIELD_CONFIG_EDIT = 'field_config_edit',
  FIELD_CONFIG_DELETE = 'field_config_delete',
  FIELD_CONFIG_REORDER = 'field_config_reorder',
  
  // Shipment Permissions
  SHIPMENT_VIEW = 'shipment_view',
  SHIPMENT_CREATE = 'shipment_create',
  SHIPMENT_EDIT = 'shipment_edit',
  SHIPMENT_DELETE = 'shipment_delete',
  
  // System Permissions
  USER_MANAGEMENT = 'user_management',
  SYSTEM_SETTINGS = 'system_settings'
}

export interface IUser extends Document {
  _id: string
  username: string
  email: string
  password: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  hasPermission(permission: Permission): boolean
  getAllPermissions(): Permission[]
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  permissions: [{
    type: String,
    enum: Object.values(Permission)
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Define role-based default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.FIELD_CONFIG_VIEW,
    Permission.FIELD_CONFIG_CREATE,
    Permission.FIELD_CONFIG_EDIT,
    Permission.FIELD_CONFIG_DELETE,
    Permission.FIELD_CONFIG_REORDER,
    Permission.SHIPMENT_VIEW,
    Permission.SHIPMENT_CREATE,
    Permission.SHIPMENT_EDIT,
    Permission.SHIPMENT_DELETE,
    Permission.SYSTEM_SETTINGS
  ],
  [UserRole.MANAGER]: [
    Permission.FIELD_CONFIG_VIEW,
    Permission.FIELD_CONFIG_EDIT,
    Permission.FIELD_CONFIG_REORDER,
    Permission.SHIPMENT_VIEW,
    Permission.SHIPMENT_CREATE,
    Permission.SHIPMENT_EDIT,
    Permission.SHIPMENT_DELETE
  ],
  [UserRole.USER]: [
    Permission.FIELD_CONFIG_VIEW,
    Permission.SHIPMENT_VIEW,
    Permission.SHIPMENT_CREATE,
    Permission.SHIPMENT_EDIT
  ]
}

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission: Permission): boolean {
  // Super admin has all permissions
  if (this.role === UserRole.SUPER_ADMIN) {
    return true
  }

  // Check explicit permissions
  if (this.permissions.includes(permission)) {
    return true
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[this.role as UserRole] || []
  return rolePermissions.includes(permission)
}

// Method to get all user permissions
userSchema.methods.getAllPermissions = function(): Permission[] {
  if (this.role === UserRole.SUPER_ADMIN) {
    return Object.values(Permission)
  }

  const rolePermissions = ROLE_PERMISSIONS[this.role as UserRole] || []
  const allPermissions = [...new Set([...rolePermissions, ...this.permissions])]
  return allPermissions
}

// Pre-save middleware to set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    const defaultPermissions = ROLE_PERMISSIONS[this.role] || []
    // Merge with existing permissions, avoiding duplicates
    this.permissions = [...new Set([...defaultPermissions, ...this.permissions])]
  }
  next()
})

// Index for performance (email and username already have unique: true)
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

const User = mongoose.model<IUser>('User', userSchema)

export default User
