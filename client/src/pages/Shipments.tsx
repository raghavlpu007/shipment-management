import React, { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Package,
  Truck
} from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { PaymentStatusBadge, ShipmentStatusBadge } from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal, { ConfirmModal } from '../components/Modal'
import { useShipments, useDeleteShipment, useExportShipments } from '../hooks/useShipments'
import { 
  Shipment, 
  ShipmentQueryParams, 
  PaymentStatus, 
  ShipmentStatus 
} from '../types'
import ShipmentForm from '../components/ShipmentForm'

const Shipments: React.FC = () => {
  // State for filters and pagination
  const [queryParams, setQueryParams] = useState<ShipmentQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  // Hooks
  const { data: shipmentsData, isLoading, refetch } = useShipments(queryParams)
  const deleteShipmentMutation = useDeleteShipment()
  const exportMutation = useExportShipments()

  // Handle filter changes
  const handleFilterChange = (key: keyof ShipmentQueryParams, value: any) => {
    setQueryParams(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }))
  }

  // Handle sorting
  const handleSort = (column: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle actions
  const handleView = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setShowViewModal(true)
  }

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setShowEditModal(true)
  }

  const handleDelete = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (selectedShipment) {
      await deleteShipmentMutation.mutateAsync(selectedShipment._id)
      setShowDeleteModal(false)
      setSelectedShipment(null)
    }
  }

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportMutation.mutate({ format, params: queryParams })
  }

  // Clear filters
  const clearFilters = () => {
    setQueryParams({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const shipments = shipmentsData?.data || []
  const pagination = shipmentsData?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Truck className="h-8 w-8 mr-3 text-blue-600" />
              Shipment Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your shipment records efficiently
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => refetch()}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Add Shipment
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search shipments..."
              leftIcon={<Search className="h-4 w-4" />}
              value={queryParams.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <Select
              placeholder="Payment Status"
              options={[
                { value: '', label: 'All Payment Status' },
                ...Object.values(PaymentStatus).map(status => ({
                  value: status,
                  label: status
                }))
              ]}
              value={queryParams.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            />
            
            <Select
              placeholder="Shipment Status"
              options={[
                { value: '', label: 'All Shipment Status' },
                ...Object.values(ShipmentStatus).map(status => ({
                  value: status,
                  label: status === ShipmentStatus.IN_TRANSIT ? 'In Transit' : status
                }))
              ]}
              value={queryParams.shipmentStatus || ''}
              onChange={(e) => handleFilterChange('shipmentStatus', e.target.value)}
            />
            
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('csv')}
                loading={exportMutation.isLoading}
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('xlsx')}
                loading={exportMutation.isLoading}
              >
                XLSX
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Shipment Records</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination?.totalItems || 0} total shipments
          </p>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <LoadingSpinner size="lg" text="Loading shipments..." />
            </div>
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first shipment</p>
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddModal(true)}
              >
                Add First Shipment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </th>
                    <th
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('awb')}
                    >
                      AWB
                    </th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('grandTotal')}
                    >
                      Amount
                    </th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {shipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100">
                      <td>
                        {shipment.date ? new Date(shipment.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="font-medium">
                        {shipment.awb}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{shipment.customerName}</div>
                          <div className="text-sm text-gray-500">{shipment.customerMoNo}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{shipment.city}</div>
                          <div className="text-sm text-gray-500">{shipment.state}</div>
                        </div>
                      </td>
                      <td className="font-semibold text-green-600">
                        ₹{(shipment.grandTotal || 0).toLocaleString()}
                      </td>
                      <td>
                        <PaymentStatusBadge status={shipment.paymentStatus} />
                      </td>
                      <td>
                        <ShipmentStatusBadge status={shipment.shipmentStatus} />
                      </td>
                      <td>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(shipment)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Edit Shipment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Shipment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Shipment"
        size="xl"
      >
        <ShipmentForm
          onSuccess={() => {
            setShowAddModal(false)
            refetch()
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Shipment Details"
        size="lg"
      >
        {selectedShipment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">AWB Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.awb}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedShipment.date ? new Date(selectedShipment.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Mobile</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.customerMoNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.city}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.state}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">₹{(selectedShipment.grandTotal || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight</label>
                <p className="mt-1 text-sm text-gray-900">{selectedShipment.weight} kg</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Shipment"
        size="xl"
      >
        {selectedShipment && (
          <ShipmentForm
            shipment={selectedShipment}
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedShipment(null)
              refetch()
            }}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedShipment(null)
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Shipment"
        message={`Are you sure you want to delete shipment ${selectedShipment?.awb}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteShipmentMutation.isLoading}
      />
    </div>
  )
}

export default Shipments
