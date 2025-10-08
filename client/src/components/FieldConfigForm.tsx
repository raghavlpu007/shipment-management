import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, Trash2, Info } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import Modal from './Modal'
import { FieldsConfig, FieldType, CreateFieldsConfigData, ValidationRule, FieldDependency } from '../types'

interface FieldConfigFormProps {
  field?: FieldsConfig
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateFieldsConfigData) => void
  isLoading?: boolean
  existingFields?: FieldsConfig[]
}

const FIELD_TYPE_OPTIONS = [
  { value: FieldType.TEXT, label: 'Text', description: 'Single line text input' },
  { value: FieldType.NUMBER, label: 'Number', description: 'Numeric input with validation' },
  { value: FieldType.DATE, label: 'Date', description: 'Date picker' },
  { value: FieldType.TIME, label: 'Time', description: 'Time picker' },
  { value: FieldType.DATETIME, label: 'Date & Time', description: 'Date and time picker' },
  { value: FieldType.ENUM, label: 'Dropdown', description: 'Dropdown selection from predefined options' },
  { value: FieldType.BOOLEAN, label: 'Boolean', description: 'True/false checkbox' },
  { value: FieldType.CHECKBOX, label: 'Checkbox', description: 'Multiple selection checkboxes' },
  { value: FieldType.RADIO, label: 'Radio', description: 'Single selection from radio buttons' },
  { value: FieldType.EMAIL, label: 'Email', description: 'Email address input with validation' },
  { value: FieldType.PHONE, label: 'Phone', description: 'Phone number input with formatting' },
  { value: FieldType.URL, label: 'URL', description: 'URL input with validation' },
  { value: FieldType.TEXTAREA, label: 'Textarea', description: 'Multi-line text input' },
  { value: FieldType.FILE, label: 'File', description: 'File upload' },
  { value: FieldType.PASSWORD, label: 'Password', description: 'Password input (hidden text)' },
  { value: FieldType.COLOR, label: 'Color', description: 'Color picker' },
  { value: FieldType.RANGE, label: 'Range', description: 'Range slider input' }
]

const WIDTH_OPTIONS = [
  { value: 'full', label: 'Full Width' },
  { value: 'half', label: 'Half Width' },
  { value: 'third', label: 'Third Width' },
  { value: 'quarter', label: 'Quarter Width' }
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' }
]

const FieldConfigForm: React.FC<FieldConfigFormProps> = ({
  field,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  existingFields = []
}) => {
  const isEditing = !!field
  const [enumValues, setEnumValues] = useState<string[]>(field?.enumValues || [''])
  const [dependencies, setDependencies] = useState<FieldDependency[]>(field?.dependencies || [])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateFieldsConfigData>({
    defaultValues: field ? {
      key: field.key,
      label: field.label,
      type: field.type,
      visible: field.visible,
      required: field.required,
      placeholder: field.placeholder,
      helpText: field.helpText,
      defaultValue: field.defaultValue,
      validation: field.validation,
      width: field.width || 'full',
      group: field.group,
      icon: field.icon,
      readonly: field.readonly
    } : {
      visible: true,
      required: false,
      width: 'full',
      readonly: false
    }
  })

  const watchedType = watch('type')
  const needsEnumValues = watchedType === FieldType.ENUM || watchedType === FieldType.RADIO || watchedType === FieldType.CHECKBOX

  useEffect(() => {
    if (field) {
      reset({
        key: field.key,
        label: field.label,
        type: field.type,
        visible: field.visible,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        defaultValue: field.defaultValue,
        validation: field.validation,
        width: field.width || 'full',
        group: field.group,
        icon: field.icon,
        readonly: field.readonly
      })
      setEnumValues(field.enumValues || [''])
      setDependencies(field.dependencies || [])
    } else {
      reset({
        visible: true,
        required: false,
        width: 'full',
        readonly: false
      })
      setEnumValues([''])
      setDependencies([])
    }
  }, [field, reset])

  const handleFormSubmit = (data: CreateFieldsConfigData) => {
    const formData = {
      ...data,
      enumValues: needsEnumValues ? enumValues.filter(val => val.trim()) : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined
    }
    onSubmit(formData)
  }

  const addEnumValue = () => {
    setEnumValues([...enumValues, ''])
  }

  const updateEnumValue = (index: number, value: string) => {
    const newValues = [...enumValues]
    newValues[index] = value
    setEnumValues(newValues)
  }

  const removeEnumValue = (index: number) => {
    if (enumValues.length > 1) {
      setEnumValues(enumValues.filter((_, i) => i !== index))
    }
  }

  const addDependency = () => {
    setDependencies([...dependencies, { field: '', value: '', operator: 'equals' }])
  }

  const updateDependency = (index: number, updates: Partial<FieldDependency>) => {
    const newDependencies = [...dependencies]
    newDependencies[index] = { ...newDependencies[index], ...updates }
    setDependencies(newDependencies)
  }

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    reset()
    setEnumValues([''])
    setDependencies([])
    setShowAdvanced(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Field Configuration' : 'Add New Field Configuration'}
      size="large"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Field Key"
            placeholder="e.g., customerName"
            error={errors.key?.message}
            disabled={isEditing}
            {...register('key', {
              required: 'Field key is required',
              pattern: {
                value: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: 'Key must start with a letter and contain only letters, numbers, and underscores'
              }
            })}
          />

          <Input
            label="Field Label"
            placeholder="e.g., Customer Name"
            error={errors.label?.message}
            {...register('label', {
              required: 'Field label is required',
              maxLength: { value: 100, message: 'Label cannot exceed 100 characters' }
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Field Type"
            options={FIELD_TYPE_OPTIONS}
            error={errors.type?.message}
            {...register('type', { required: 'Field type is required' })}
          />

          <Select
            label="Width"
            options={WIDTH_OPTIONS}
            {...register('width')}
          />
        </div>

        {/* Enum Values */}
        {needsEnumValues && (
          <div>
            <label className="form-label">
              Options
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-2">
              {enumValues.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateEnumValue(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="form-input flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEnumValue(index)}
                    disabled={enumValues.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnumValue}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Placeholder"
            placeholder="Enter placeholder text"
            {...register('placeholder', {
              maxLength: { value: 200, message: 'Placeholder cannot exceed 200 characters' }
            })}
          />

          <Input
            label="Group"
            placeholder="e.g., Customer Info"
            {...register('group', {
              maxLength: { value: 50, message: 'Group name cannot exceed 50 characters' }
            })}
          />
        </div>

        <div>
          <label className="form-label">Help Text</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Additional help text for users"
            {...register('helpText', {
              maxLength: { value: 500, message: 'Help text cannot exceed 500 characters' }
            })}
          />
          {errors.helpText && (
            <p className="form-error">{errors.helpText.message}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('visible')}
            />
            <span className="ml-2">Visible</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('required')}
            />
            <span className="ml-2">Required</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('readonly')}
            />
            <span className="ml-2">Read Only</span>
          </label>
        </div>

        {/* Advanced Settings Toggle */}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Info className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            {isEditing ? 'Update Field' : 'Create Field'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default FieldConfigForm
