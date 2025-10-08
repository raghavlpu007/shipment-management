import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { shipmentsApi } from '../utils/api'
import { 
  ShipmentQueryParams, 
  CreateShipmentData, 
  UpdateShipmentData 
} from '../types'

// Query keys
export const SHIPMENTS_QUERY_KEY = 'shipments'
export const SHIPMENT_STATS_QUERY_KEY = 'shipment-stats'

// Custom hooks for shipments
export const useShipments = (params?: ShipmentQueryParams) => {
  return useQuery(
    [SHIPMENTS_QUERY_KEY, params],
    () => shipmentsApi.getAll(params),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  )
}

export const useShipment = (id: string) => {
  return useQuery(
    [SHIPMENTS_QUERY_KEY, id],
    () => shipmentsApi.getById(id),
    {
      enabled: !!id,
    }
  )
}

export const useShipmentStats = () => {
  return useQuery(
    SHIPMENT_STATS_QUERY_KEY,
    shipmentsApi.getStats,
    {
      staleTime: 60000, // 1 minute
    }
  )
}

export const useCreateShipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (data: CreateShipmentData) => shipmentsApi.create(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(SHIPMENTS_QUERY_KEY)
        queryClient.invalidateQueries(SHIPMENT_STATS_QUERY_KEY)
        toast.success(response.message || 'Shipment created successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to create shipment'
        toast.error(message)
      }
    }
  )
}

export const useUpdateShipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }: { id: string; data: UpdateShipmentData }) => 
      shipmentsApi.update(id, data),
    {
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries(SHIPMENTS_QUERY_KEY)
        queryClient.invalidateQueries(SHIPMENT_STATS_QUERY_KEY)
        queryClient.invalidateQueries([SHIPMENTS_QUERY_KEY, variables.id])
        toast.success(response.message || 'Shipment updated successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to update shipment'
        toast.error(message)
      }
    }
  )
}

export const useDeleteShipment = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (id: string) => shipmentsApi.delete(id),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(SHIPMENTS_QUERY_KEY)
        queryClient.invalidateQueries(SHIPMENT_STATS_QUERY_KEY)
        toast.success(response.message || 'Shipment deleted successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to delete shipment'
        toast.error(message)
      }
    }
  )
}

export const useExportShipments = () => {
  return useMutation(
    async ({ format, params }: { format: 'csv' | 'xlsx'; params?: ShipmentQueryParams }) => {
      const blob = format === 'csv' 
        ? await shipmentsApi.exportCsv(params)
        : await shipmentsApi.exportXlsx(params)
      
      const filename = `shipments-export-${new Date().toISOString().split('T')[0]}.${format}`
      
      // Download file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { filename, format }
    },
    {
      onSuccess: ({ filename, format }) => {
        toast.success(`Export completed: ${filename}`)
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Export failed'
        toast.error(message)
      }
    }
  )
}
