import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  CreditCard,
  Hash,
  DollarSign,
  Weight,
  FileText,
  Building,
  Clock,
  Link as LinkIcon,
  Lock,
  Palette,
  Sliders
} from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import PincodeInput from './PincodeInput'
import { useCreateShipment, useUpdateShipment } from '../hooks/useShipments'
import { useVisibleFields } from '../hooks/useFieldsConfig'
import {
  Shipment,
  CreateShipmentData,
  PaymentStatus,
  ShipmentStatus,
  FieldType,
  PincodeData,
  FieldsConfig
} from '../types'

interface ShipmentFormProps {
  shipment?: Shipment
  onSuccess: () => void
  onCancel: () => void
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({
  shipment,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!shipment
  const [calculatedTotals, setCalculatedTotals] = useState({
    totalBeforeGst: 0,
    totalAfterGst: 0,
    grandTotal: 0
  })

  // Get icon for field based on key or type
  const getFieldIcon = (key: string, type: string) => {
    const iconMap: Record<string, any> = {
      // Name fields
      'customerName': User,
      'pickupCustomerName': User,
      'name': User,
      // Phone fields
      'customerMoNo': Phone,
      'pickupCustomerMoNo': Phone,
      'phone': Phone,
      // Email
      'email': Mail,
      // Location
      'city': Building,
      'state': MapPin,
      'pinCode': MapPin,
      'address': MapPin,
      // Date/Time
      'date': Calendar,
      'time': Clock,
      // Package/Shipment
      'awb': Hash,
      'courierPartner': Truck,
      'weight': Weight,
      'bookingCode': Package,
      'pickupRef': FileText,
      // Money
      'baseAmount': DollarSign,
      'royaltyMargin': DollarSign,
      'gst': DollarSign,
      'saleCost': DollarSign,
      'totalBeforeGst': DollarSign,
      'totalAfterGst': DollarSign,
      'grandTotal': DollarSign,
      // Status
      'paymentStatus': CreditCard,
      'shipmentStatus': Package,
    }

    // Return icon from map or based on type
    if (iconMap[key]) return iconMap[key]
    
    // Fallback to type-based icons
    switch (type) {
      case 'email': return Mail
      case 'phone': return Phone
      case 'date': return Calendar
      case 'time': return Clock
      case 'url': return LinkIcon
      case 'password': return Lock
      case 'color': return Palette
      case 'number': return Hash
      case 'range': return Sliders
      default: return FileText
    }
  }

  // Pincode handling state
  const [pincodeValue, setPincodeValue] = useState('')

  // Hooks
  const { data: fieldsConfigData } = useVisibleFields()
  const createMutation = useCreateShipment()
  const updateMutation = useUpdateShipment()

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<CreateShipmentData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      paymentStatus: PaymentStatus.PENDING,
      shipmentStatus: ShipmentStatus.CREATED,
      createdBy: 'user',
      updatedBy: 'user'
    }
  })

  // Reset form when shipment prop changes (for editing)
  useEffect(() => {
    if (shipment) {
      const formattedShipment = {
        ...shipment,
        date: shipment.date ? new Date(shipment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }
      reset(formattedShipment)
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        paymentStatus: PaymentStatus.PENDING,
        shipmentStatus: ShipmentStatus.CREATED,
        createdBy: 'user',
        updatedBy: 'user'
      })
    }
  }, [shipment, reset])

  // Handle pincode data auto-fill
  const handlePincodeData = (data: PincodeData | null) => {
    if (data) {
      setValue('city', data.city)
      setValue('state', data.state)
    }
  }

  // Initialize pincode value from form data
  useEffect(() => {
    if (shipment?.pinCode) {
      setPincodeValue(shipment.pinCode)
    }
  }, [shipment])


  // Watch for amount changes to calculate totals
  const baseAmount = watch('baseAmount') || 0
  const royaltyMargin = watch('royaltyMargin') || 0
  const gst = watch('gst') || 0

  useEffect(() => {
    const totalBeforeGst = Number(baseAmount) + Number(royaltyMargin)
    const totalAfterGst = totalBeforeGst + Number(gst)
    const grandTotal = totalAfterGst

    setCalculatedTotals({
      totalBeforeGst,
      totalAfterGst,
      grandTotal
    })
  }, [baseAmount, royaltyMargin, gst])

  // Submit handler
  const onSubmit = async (data: CreateShipmentData) => {
    try {
      console.log('Submission data:', data)

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: shipment._id,
          data: {
            ...data,
            updatedBy: 'user'
          }
        })
      } else {
        await createMutation.mutateAsync({
          ...data,
          createdBy: 'user',
          updatedBy: 'user'
        })
      }
      onSuccess()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const fieldsConfig = fieldsConfigData?.data || []
  const isLoading = createMutation.isLoading || updateMutation.isLoading

  // Render field based on configuration
  const renderField = (fieldConfig: FieldsConfig) => {
    const { key, label, type, required, placeholder, enumValues, validation, dependencies, width, helpText, defaultValue, readonly } = fieldConfig

    // Check field dependencies
    if (dependencies && dependencies.length > 0) {
      const shouldShow = dependencies.every(dep => {
        const fieldValue = watch(dep.field)
        switch (dep.operator) {
          case 'equals':
            return fieldValue === dep.value
          case 'not_equals':
            return fieldValue !== dep.value
          case 'contains':
            return String(fieldValue).includes(String(dep.value))
          case 'not_contains':
            return !String(fieldValue).includes(String(dep.value))
          case 'greater_than':
            return Number(fieldValue) > Number(dep.value)
          case 'less_than':
            return Number(fieldValue) < Number(dep.value)
          default:
            return true
        }
      })

      if (!shouldShow) {
        return null
      }
    }

    const commonProps = {
      label,
      required,
      placeholder,
      error: errors[key as keyof CreateShipmentData]?.message,
      disabled: isLoading || readonly,
      ...register(key as keyof CreateShipmentData, {
        required: required ? `${label} is required` : false,
        ...(validation && {
          ...(validation.min !== undefined && {
            min: { value: validation.min, message: `${label} must be at least ${validation.min}` }
          }),
          ...(validation.max !== undefined && {
            max: { value: validation.max, message: `${label} must be at most ${validation.max}` }
          }),
          ...(validation.minLength && {
            minLength: { value: validation.minLength, message: `${label} must be at least ${validation.minLength} characters` }
          }),
          ...(validation.maxLength && {
            maxLength: { value: validation.maxLength, message: `${label} must be at most ${validation.maxLength} characters` }
          }),
          ...(validation.pattern && {
            pattern: {
              value: new RegExp(validation.pattern),
              message: validation.message || `${label} format is invalid`
            }
          })
        }),
        // Legacy validation for specific fields
        ...(type === FieldType.NUMBER && !validation?.min && {
          valueAsNumber: true,
          min: { value: 0, message: `${label} must be greater than or equal to 0` }
        }),
        ...(key === 'pickupCustomerMoNo' || key === 'customerMoNo') && !validation?.pattern && {
          pattern: {
            value: /^[+]?[\d\s\-\(\)]{10,15}$/,
            message: 'Please provide a valid phone number'
          }
        },
        ...(key === 'pinCode') && !validation?.pattern && {
          pattern: {
            value: /^\d{6}$/,
            message: 'Pin code must be exactly 6 digits'
          }
        }
      })
    }

    const getFieldWidth = () => {
      // If width is explicitly set, use it
      if (width === 'full') return 'col-span-1 md:col-span-3'
      if (width === 'half') return 'col-span-1 md:col-span-2'
      if (width === 'third') return 'col-span-1 md:col-span-1'
      if (width === 'quarter') return 'col-span-1 md:col-span-1'
      
      // Auto-calculate based on field type and content
      // Short fields (like date, status, numbers) = 1 column
      if (type === FieldType.DATE || type === FieldType.TIME || 
          type === FieldType.BOOLEAN || type === FieldType.ENUM ||
          type === FieldType.NUMBER || type === FieldType.COLOR) {
        return 'col-span-1 md:col-span-1'
      }
      
      // Medium fields (names, phone, etc) = 1 column
      if (type === FieldType.TEXT || type === FieldType.EMAIL || 
          type === FieldType.PHONE || type === FieldType.URL) {
        return 'col-span-1 md:col-span-1'
      }
      
      // Long fields (textarea) = full width
      if (type === FieldType.TEXTAREA) {
        return 'col-span-1 md:col-span-3'
      }
      
      // Default = 1 column
      return 'col-span-1 md:col-span-1'
    }

    // Get icon component
    const FieldIcon = getFieldIcon(key, type)
    const iconElement = <FieldIcon className="h-4 w-4" />

    const fieldWrapper = (content: React.ReactNode) => (
      <div key={key} className={`col-span-1 ${getFieldWidth()}`}>
        {helpText && (
          <p className="text-xs text-gray-500 mb-1">{helpText}</p>
        )}
        {content}
      </div>
    )

    // Special handling for pincode field
    if (key === 'pinCode') {
      return fieldWrapper(
        <PincodeInput
          value={pincodeValue}
          onChange={(value) => {
            setPincodeValue(value)
            setValue('pinCode', value)
          }}
          onPincodeData={handlePincodeData}
          error={errors[key as keyof CreateShipmentData]?.message}
          disabled={isLoading || readonly}
        />
      )
    }

    switch (type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.PHONE:
      case FieldType.URL:
        return fieldWrapper(
          <Input
            type={type === FieldType.EMAIL ? 'email' : type === FieldType.URL ? 'url' : 'text'}
            defaultValue={defaultValue}
            leftIcon={iconElement}
            {...commonProps}
          />
        )

      case FieldType.PASSWORD:
        return fieldWrapper(
          <Input 
            type="password" 
            leftIcon={iconElement}
            {...commonProps} 
          />
        )

      case FieldType.DATE:
        return fieldWrapper(
          <Input
            type="date"
            defaultValue={defaultValue}
            leftIcon={iconElement}
            {...commonProps}
          />
        )

      case FieldType.TIME:
        return fieldWrapper(
          <Input
            type="time"
            defaultValue={defaultValue}
            leftIcon={iconElement}
            {...commonProps}
          />
        )

      case FieldType.DATETIME:
        return fieldWrapper(
          <Input
            type="datetime-local"
            defaultValue={defaultValue}
            leftIcon={iconElement}
            {...commonProps}
          />
        )

      case FieldType.NUMBER:
        return fieldWrapper(
          <Input
            type="number"
            step={validation?.step || "0.01"}
            defaultValue={defaultValue}
            leftIcon={iconElement}
            {...commonProps}
          />
        )

      case FieldType.RANGE:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="range"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={validation?.min || 0}
              max={validation?.max || 100}
              step={validation?.step || 1}
              defaultValue={defaultValue}
              disabled={isLoading || readonly}
              {...register(key as keyof CreateShipmentData, {
                required: required ? `${label} is required` : false
              })}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{validation?.min || 0}</span>
              <span>{validation?.max || 100}</span>
            </div>
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">{errors[key as keyof CreateShipmentData]?.message}</p>
            )}
          </div>
        )

      case FieldType.COLOR:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="color"
              className="form-input h-12 w-full"
              defaultValue={defaultValue || '#000000'}
              disabled={isLoading || readonly}
              {...register(key as keyof CreateShipmentData, {
                required: required ? `${label} is required` : false
              })}
            />
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">{errors[key as keyof CreateShipmentData]?.message}</p>
            )}
          </div>
        )

      case FieldType.ENUM:
        return fieldWrapper(
          <Select
            options={enumValues?.map((value: string) => ({
              value,
              label: value === 'InTransit' ? 'In Transit' : value
            })) || []}
            defaultValue={defaultValue}
            {...commonProps}
          />
        )

      case FieldType.RADIO:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {enumValues?.map((value: string) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    value={value}
                    className="form-radio"
                    disabled={isLoading || readonly}
                    {...register(key as keyof CreateShipmentData, {
                      required: required ? `${label} is required` : false
                    })}
                  />
                  <span className="ml-2 text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">{errors[key as keyof CreateShipmentData]?.message}</p>
            )}
          </div>
        )

      case FieldType.CHECKBOX:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {enumValues?.map((value: string) => (
                <label key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={value}
                    className="form-checkbox"
                    disabled={isLoading || readonly}
                    {...register(key as keyof CreateShipmentData)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">{errors[key as keyof CreateShipmentData]?.message}</p>
            )}
          </div>
        )

      case FieldType.BOOLEAN:
        return fieldWrapper(
          <div className="flex items-center">
            <input
              type="checkbox"
              id={key}
              className="form-checkbox"
              defaultChecked={defaultValue}
              disabled={isLoading || readonly}
              {...register(key as keyof CreateShipmentData)}
            />
            <label htmlFor={key} className="ml-2 text-sm text-gray-700">
              {label}
            </label>
          </div>
        )
      
      case FieldType.TEXTAREA:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className="form-input"
              rows={4}
              placeholder={placeholder}
              defaultValue={defaultValue}
              disabled={isLoading || readonly}
              {...register(key as keyof CreateShipmentData, {
                required: required ? `${label} is required` : false,
                ...(validation?.minLength && {
                  minLength: {
                    value: validation.minLength,
                    message: `${label} must be at least ${validation.minLength} characters`
                  }
                }),
                ...(validation?.maxLength && {
                  maxLength: {
                    value: validation.maxLength,
                    message: `${label} must be at most ${validation.maxLength} characters`
                  }
                })
              })}
            />
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">
                {errors[key as keyof CreateShipmentData]?.message}
              </p>
            )}
          </div>
        )

      case FieldType.FILE:
        return fieldWrapper(
          <div>
            <label className="form-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              className="form-input"
              accept={validation?.accept}
              multiple={validation?.multiple}
              disabled={isLoading || readonly}
              {...register(key as keyof CreateShipmentData, {
                required: required ? `${label} is required` : false
              })}
            />
            {errors[key as keyof CreateShipmentData] && (
              <p className="form-error">
                {errors[key as keyof CreateShipmentData]?.message}
              </p>
            )}
          </div>
        )

      default:
        return fieldWrapper(
          <Input
            type="text"
            defaultValue={defaultValue}
            {...commonProps}
          />
        )
    }
  }

  // Group fields by group property
  const groupedFields = useMemo(() => {
    const nonFileFields = fieldsConfig
      .filter(field => field.type !== FieldType.FILE && field.visible)
      .sort((a, b) => a.order - b.order)

    const groups: { [key: string]: FieldsConfig[] } = {}
    const ungroupedFields: FieldsConfig[] = []

    nonFileFields.forEach(field => {
      if (field.group) {
        if (!groups[field.group]) {
          groups[field.group] = []
        }
        groups[field.group].push(field)
      } else {
        ungroupedFields.push(field)
      }
    })

    return { groups, ungroupedFields }
  }, [fieldsConfig])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Ungrouped Fields */}
      {groupedFields.ungroupedFields.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groupedFields.ungroupedFields.map(renderField)}
          </div>
        </div>
      )}

      {/* Grouped Fields */}
      {Object.entries(groupedFields.groups).map(([groupName, fields]) => (
        <div key={groupName} className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-6 bg-primary-500 rounded-full mr-3"></div>
            {groupName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fields.map(renderField)}
          </div>
        </div>
      ))}

      {/* Calculated totals display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Calculated Totals
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="text-xs text-gray-500 mb-1">Total Before GST</div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{calculatedTotals.totalBeforeGst.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="text-xs text-gray-500 mb-1">Total After GST</div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{calculatedTotals.totalAfterGst.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg shadow-md">
            <div className="text-xs text-green-100 mb-1">Grand Total</div>
            <div className="text-2xl font-bold text-white">
              ₹{calculatedTotals.grandTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="min-w-[160px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
          leftIcon={<Package className="h-4 w-4" />}
        >
          {isEditing ? 'Update Shipment' : 'Create Shipment'}
        </Button>
      </div>
    </form>
  )
}

export default ShipmentForm
