import React from 'react'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Truck,
  Package,
  RotateCcw,
  DollarSign
} from 'lucide-react'
import { PaymentStatus, ShipmentStatus } from '../types'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'secondary', 
  size = 'md', 
  children, 
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

// Specialized badge components
interface PaymentStatusBadgeProps {
  status: PaymentStatus
  size?: 'sm' | 'md' | 'lg'
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getVariant = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'success'
      case PaymentStatus.PARTIAL:
        return 'warning'
      case PaymentStatus.REFUNDED:
        return 'danger'
      case PaymentStatus.PENDING:
      default:
        return 'secondary'
    }
  }

  const getIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <CheckCircle className="h-3 w-3 mr-1" />
      case PaymentStatus.PARTIAL:
        return <DollarSign className="h-3 w-3 mr-1" />
      case PaymentStatus.REFUNDED:
        return <RotateCcw className="h-3 w-3 mr-1" />
      case PaymentStatus.PENDING:
      default:
        return <Clock className="h-3 w-3 mr-1" />
    }
  }

  return (
    <Badge variant={getVariant(status)} size={size}>
      {getIcon(status)}
      {status}
    </Badge>
  )
}

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus
  size?: 'sm' | 'md' | 'lg'
}

export const ShipmentStatusBadge: React.FC<ShipmentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getVariant = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.DELIVERED:
        return 'success'
      case ShipmentStatus.IN_TRANSIT:
      case ShipmentStatus.PICKED:
        return 'primary'
      case ShipmentStatus.RTS:
      case ShipmentStatus.CANCELLED:
        return 'danger'
      case ShipmentStatus.CREATED:
      default:
        return 'secondary'
    }
  }

  const getIcon = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.DELIVERED:
        return <CheckCircle className="h-3 w-3 mr-1" />
      case ShipmentStatus.IN_TRANSIT:
        return <Truck className="h-3 w-3 mr-1" />
      case ShipmentStatus.PICKED:
        return <Package className="h-3 w-3 mr-1" />
      case ShipmentStatus.RTS:
        return <RotateCcw className="h-3 w-3 mr-1" />
      case ShipmentStatus.CANCELLED:
        return <XCircle className="h-3 w-3 mr-1" />
      case ShipmentStatus.CREATED:
      default:
        return <Clock className="h-3 w-3 mr-1" />
    }
  }

  const getDisplayText = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.IN_TRANSIT:
        return 'In Transit'
      case ShipmentStatus.RTS:
        return 'RTS'
      default:
        return status
    }
  }

  return (
    <Badge variant={getVariant(status)} size={size}>
      {getIcon(status)}
      {getDisplayText(status)}
    </Badge>
  )
}

export default Badge
