import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import {
  ApiResponse,
  Shipment,
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentsResponse,
  ShipmentQueryParams,
  ShipmentStatsResponse,
  FieldsConfig,
  CreateFieldsConfigData,
  UpdateFieldsConfigData,
  UploadResponse,
  ImportPreviewResponse,
  ImportExecuteData,
  ImportExecuteResponse
} from '../types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors and authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    const message = error.response?.data?.error || error.message || 'An error occurred'
    
    // Don't show toast for certain errors (like validation errors that are handled by forms)
    if (error.response?.status !== 400 && error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Shipments API
export const shipmentsApi = {
  // Get all shipments with filters and pagination
  getAll: async (params?: ShipmentQueryParams): Promise<ShipmentsResponse> => {
    const response: AxiosResponse<ShipmentsResponse> = await api.get('/shipments', { params })
    return response.data
  },

  // Get single shipment by ID
  getById: async (id: string): Promise<ApiResponse<Shipment>> => {
    const response: AxiosResponse<ApiResponse<Shipment>> = await api.get(`/shipments/${id}`)
    return response.data
  },

  // Create new shipment
  create: async (data: CreateShipmentData): Promise<ApiResponse<Shipment>> => {
    const response: AxiosResponse<ApiResponse<Shipment>> = await api.post('/shipments', data)
    return response.data
  },

  // Update shipment
  update: async (id: string, data: UpdateShipmentData): Promise<ApiResponse<Shipment>> => {
    const response: AxiosResponse<ApiResponse<Shipment>> = await api.put(`/shipments/${id}`, data)
    return response.data
  },

  // Delete shipment
  delete: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/shipments/${id}`)
    return response.data
  },

  // Get shipment statistics
  getStats: async (): Promise<ShipmentStatsResponse> => {
    const response: AxiosResponse<ShipmentStatsResponse> = await api.get('/shipments/stats/summary')
    return response.data
  },

  // Export to CSV
  exportCsv: async (params?: ShipmentQueryParams): Promise<Blob> => {
    const response = await api.get('/shipments/export/csv', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Export to XLSX
  exportXlsx: async (params?: ShipmentQueryParams): Promise<Blob> => {
    const response = await api.get('/shipments/export/xlsx', {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

// Fields Configuration API
export const fieldsConfigApi = {
  // Get all field configurations
  getAll: async (): Promise<ApiResponse<FieldsConfig[]>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig[]>> = await api.get('/fields-config')
    return response.data
  },

  // Get visible field configurations
  getVisible: async (): Promise<ApiResponse<FieldsConfig[]>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig[]>> = await api.get('/fields-config/visible/list')
    return response.data
  },

  // Get single field configuration
  getByKey: async (key: string): Promise<ApiResponse<FieldsConfig>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig>> = await api.get(`/fields-config/${key}`)
    return response.data
  },

  // Create new field configuration
  create: async (data: CreateFieldsConfigData): Promise<ApiResponse<FieldsConfig>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig>> = await api.post('/fields-config', data)
    return response.data
  },

  // Update field configuration
  update: async (key: string, data: UpdateFieldsConfigData): Promise<ApiResponse<FieldsConfig>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig>> = await api.put(`/fields-config/${key}`, data)
    return response.data
  },

  // Bulk update field configurations
  bulkUpdate: async (fields: Array<{ key: string; [key: string]: any }>): Promise<ApiResponse<FieldsConfig[]>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig[]>> = await api.put('/fields-config/bulk/update', { fields })
    return response.data
  },

  // Delete field configuration
  delete: async (key: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/fields-config/${key}`)
    return response.data
  },

  // Initialize default field configurations
  initialize: async (): Promise<ApiResponse<FieldsConfig[]>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig[]>> = await api.post('/fields-config/initialize')
    return response.data
  },

  // Duplicate field configuration
  duplicate: async (key: string, newKey: string, newLabel: string): Promise<ApiResponse<FieldsConfig>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig>> = await api.post(`/fields-config/duplicate/${key}`, {
      newKey,
      newLabel
    })
    return response.data
  },

  // Reorder field configurations
  reorder: async (fieldOrders: Array<{ key: string; order: number }>): Promise<ApiResponse<FieldsConfig[]>> => {
    const response: AxiosResponse<ApiResponse<FieldsConfig[]>> = await api.post('/fields-config/reorder', {
      fieldOrders
    })
    return response.data
  },

  // Get field groups
  getGroups: async (): Promise<ApiResponse<string[]>> => {
    const response: AxiosResponse<ApiResponse<string[]>> = await api.get('/fields-config/groups')
    return response.data
  },

  // Get field types
  getTypes: async (): Promise<ApiResponse<Array<{ value: string; label: string; description: string }>>> => {
    const response: AxiosResponse<ApiResponse<Array<{ value: string; label: string; description: string }>>> = await api.get('/fields-config/types')
    return response.data
  }
}

// Upload API
export const uploadApi = {
  // Upload single file
  uploadSingle: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response: AxiosResponse<UploadResponse> = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload multiple files
  uploadMultiple: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response: AxiosResponse<UploadResponse> = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete file
  deleteFile: async (filename: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/upload/${filename}`)
    return response.data
  },

  // List uploaded files
  listFiles: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get('/upload/list')
    return response.data
  }
}

// Import API
export const importApi = {
  // Preview import file
  preview: async (file: File): Promise<ImportPreviewResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response: AxiosResponse<ImportPreviewResponse> = await api.post('/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Execute import
  execute: async (data: ImportExecuteData): Promise<ImportExecuteResponse> => {
    const response: AxiosResponse<ImportExecuteResponse> = await api.post('/import/execute', data)
    return response.data
  }
}

// Utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default api
