import React, { useState, useMemo } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  Copy,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload
} from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal, { ConfirmModal } from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import FieldConfigForm from '../components/FieldConfigForm'
import {
  useFieldsConfig,
  useBulkUpdateFieldsConfig,
  useCreateFieldConfig,
  useUpdateFieldConfig,
  useDeleteFieldConfig,
  useInitializeFieldsConfig
} from '../hooks/useFieldsConfig'
import { FieldsConfig, FieldType, CreateFieldsConfigData } from '../types'

const ItemType = 'FIELD_CONFIG'

interface DraggableFieldProps {
  field: FieldsConfig
  index: number
  moveField: (dragIndex: number, hoverIndex: number) => void
  onToggleVisibility: (key: string, visible: boolean) => void
  onEdit: (field: FieldsConfig) => void
  onDelete: (field: FieldsConfig) => void
  onDuplicate: (field: FieldsConfig) => void
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  moveField,
  onToggleVisibility,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveField(item.index, index)
        item.index = index
      }
    },
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 cursor-move
        ${isDragging ? 'opacity-50' : ''}
        hover:shadow-md transition-shadow
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">{field.label}</h3>
            <p className="text-sm text-gray-500">
              {field.key} • {field.type} {field.required && '• Required'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleVisibility(field.key, !field.visible)}
            className={`
              p-2 rounded-md transition-colors
              ${field.visible 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-50'
              }
            `}
            title={field.visible ? 'Hide field' : 'Show field'}
          >
            {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onDuplicate(field)}
            className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Duplicate field"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            onClick={() => onEdit(field)}
            className="p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit field"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(field)}
            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete field"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const FieldSettings: React.FC = () => {
  const [fields, setFields] = useState<FieldsConfig[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedField, setSelectedField] = useState<FieldsConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Hooks
  const { data: fieldsData, isLoading, refetch } = useFieldsConfig()
  const bulkUpdateMutation = useBulkUpdateFieldsConfig()
  const createMutation = useCreateFieldConfig()
  const updateMutation = useUpdateFieldConfig()
  const deleteMutation = useDeleteFieldConfig()
  const initializeMutation = useInitializeFieldsConfig()

  // Filtered and searched fields
  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.key.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || field.type === filterType
      const matchesGroup = filterGroup === 'all' || field.group === filterGroup
      return matchesSearch && matchesType && matchesGroup
    })
  }, [fields, searchTerm, filterType, filterGroup])

  // Get unique field types and groups for filters
  const fieldTypes = useMemo(() => {
    const types = [...new Set(fields.map(f => f.type))]
    return types.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
  }, [fields])

  const fieldGroups = useMemo(() => {
    const groups = [...new Set(fields.map(f => f.group).filter(Boolean))]
    return groups.map(group => ({ value: group, label: group }))
  }, [fields])

  // Initialize fields when data loads
  React.useEffect(() => {
    if (fieldsData?.data) {
      setFields([...fieldsData.data].sort((a, b) => a.order - b.order))
      setHasChanges(false)
    }
  }, [fieldsData])

  // Move field (drag and drop)
  const moveField = (dragIndex: number, hoverIndex: number) => {
    const draggedField = fields[dragIndex]
    const newFields = [...fields]
    newFields.splice(dragIndex, 1)
    newFields.splice(hoverIndex, 0, draggedField)
    
    // Update order values
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))
    
    setFields(updatedFields)
    setHasChanges(true)
  }

  // Toggle field visibility
  const handleToggleVisibility = (key: string, visible: boolean) => {
    const updatedFields = fields.map(field =>
      field.key === key ? { ...field, visible } : field
    )
    setFields(updatedFields)
    setHasChanges(true)
  }

  // Save changes
  const handleSaveChanges = async () => {
    const updates = fields.map(field => ({
      key: field.key,
      visible: field.visible,
      order: field.order
    }))
    
    await bulkUpdateMutation.mutateAsync(updates)
    setHasChanges(false)
    refetch()
  }

  // Reset changes
  const handleResetChanges = () => {
    if (fieldsData?.data) {
      setFields([...fieldsData.data].sort((a, b) => a.order - b.order))
      setHasChanges(false)
    }
  }

  // Handle actions
  const handleEdit = (field: FieldsConfig) => {
    setSelectedField(field)
    setShowEditModal(true)
  }

  const handleDelete = (field: FieldsConfig) => {
    setSelectedField(field)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (selectedField) {
      await deleteMutation.mutateAsync(selectedField.key)
      setShowDeleteModal(false)
      setSelectedField(null)
      refetch()
    }
  }

  const handleInitialize = async () => {
    await initializeMutation.mutateAsync()
    refetch()
  }

  // Handle form submissions
  const handleCreateField = async (data: CreateFieldsConfigData) => {
    await createMutation.mutateAsync(data)
    setShowAddModal(false)
    refetch()
  }

  const handleUpdateField = async (data: CreateFieldsConfigData) => {
    if (selectedField) {
      await updateMutation.mutateAsync({ key: selectedField.key, data })
      setShowEditModal(false)
      setSelectedField(null)
      refetch()
    }
  }

  // Handle duplicate field
  const handleDuplicateField = async (field: FieldsConfig) => {
    const newKey = `${field.key}_copy`
    const newLabel = `${field.label} (Copy)`

    const duplicateData: CreateFieldsConfigData = {
      key: newKey,
      label: newLabel,
      type: field.type,
      enumValues: field.enumValues,
      visible: field.visible,
      required: field.required,
      placeholder: field.placeholder,
      helpText: field.helpText,
      defaultValue: field.defaultValue,
      validation: field.validation,
      dependencies: field.dependencies,
      width: field.width,
      group: field.group,
      icon: field.icon,
      readonly: field.readonly
    }

    await createMutation.mutateAsync(duplicateData)
    refetch()
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading field configurations..." />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Field Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage field types, validation, visibility, and ordering for your forms
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {fields.length === 0 && (
              <Button
                variant="secondary"
                onClick={handleInitialize}
                loading={initializeMutation.isLoading}
              >
                Initialize Default Fields
              </Button>
            )}
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Field
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            <Select
              label=""
              placeholder="Filter by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...fieldTypes
              ]}
            />

            <Select
              label=""
              placeholder="Filter by group"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              options={[
                { value: 'all', label: 'All Groups' },
                ...fieldGroups
              ]}
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <span className="text-sm text-gray-500">
                {filteredFields.length} of {fields.length} fields
              </span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You have unsaved changes
                </span>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleResetChanges}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSaveChanges}
                  loading={bulkUpdateMutation.isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Fields list */}
        <div className="space-y-3">
          {filteredFields.map((field, index) => (
            <DraggableField
              key={field.key}
              field={field}
              index={index}
              moveField={moveField}
              onToggleVisibility={handleToggleVisibility}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={() => handleDuplicateField(field)}
            />
          ))}

          {fields.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No field configurations</h3>
              <p className="text-gray-500 mb-4">
                Get started by initializing default field configurations
              </p>
              <Button onClick={handleInitialize} loading={initializeMutation.isLoading}>
                Initialize Default Fields
              </Button>
            </div>
          )}

          {fields.length > 0 && filteredFields.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No fields match your filters</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search term or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterGroup('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Field Configuration Forms */}
        <FieldConfigForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateField}
          isLoading={createMutation.isLoading}
          existingFields={fields}
        />

        <FieldConfigForm
          field={selectedField || undefined}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedField(null)
          }}
          onSubmit={handleUpdateField}
          isLoading={updateMutation.isLoading}
          existingFields={fields}
        />

        {/* Delete confirmation modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Field Configuration"
          message={`Are you sure you want to delete the field "${selectedField?.label}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleteMutation.isLoading}
        />
      </div>
    </DndProvider>
  )
}

export default FieldSettings
