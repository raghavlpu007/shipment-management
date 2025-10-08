import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { fieldsConfigApi } from '../utils/api'
import { 
  CreateFieldsConfigData, 
  UpdateFieldsConfigData 
} from '../types'

// Query keys
export const FIELDS_CONFIG_QUERY_KEY = 'fields-config'
export const VISIBLE_FIELDS_QUERY_KEY = 'visible-fields'

// Custom hooks for fields configuration
export const useFieldsConfig = () => {
  return useQuery(
    FIELDS_CONFIG_QUERY_KEY,
    fieldsConfigApi.getAll,
    {
      staleTime: 300000, // 5 minutes
    }
  )
}

export const useVisibleFields = () => {
  return useQuery(
    VISIBLE_FIELDS_QUERY_KEY,
    fieldsConfigApi.getVisible,
    {
      staleTime: 300000, // 5 minutes
    }
  )
}

export const useFieldConfig = (key: string) => {
  return useQuery(
    [FIELDS_CONFIG_QUERY_KEY, key],
    () => fieldsConfigApi.getByKey(key),
    {
      enabled: !!key,
    }
  )
}

export const useCreateFieldConfig = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (data: CreateFieldsConfigData) => fieldsConfigApi.create(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(FIELDS_CONFIG_QUERY_KEY)
        queryClient.invalidateQueries(VISIBLE_FIELDS_QUERY_KEY)
        toast.success(response.message || 'Field configuration created successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to create field configuration'
        toast.error(message)
      }
    }
  )
}

export const useUpdateFieldConfig = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ key, data }: { key: string; data: UpdateFieldsConfigData }) => 
      fieldsConfigApi.update(key, data),
    {
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries(FIELDS_CONFIG_QUERY_KEY)
        queryClient.invalidateQueries(VISIBLE_FIELDS_QUERY_KEY)
        queryClient.invalidateQueries([FIELDS_CONFIG_QUERY_KEY, variables.key])
        toast.success(response.message || 'Field configuration updated successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to update field configuration'
        toast.error(message)
      }
    }
  )
}

export const useBulkUpdateFieldsConfig = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (fields: Array<{ key: string; [key: string]: any }>) => 
      fieldsConfigApi.bulkUpdate(fields),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(FIELDS_CONFIG_QUERY_KEY)
        queryClient.invalidateQueries(VISIBLE_FIELDS_QUERY_KEY)
        toast.success(response.message || 'Field configurations updated successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to update field configurations'
        toast.error(message)
      }
    }
  )
}

export const useDeleteFieldConfig = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (key: string) => fieldsConfigApi.delete(key),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(FIELDS_CONFIG_QUERY_KEY)
        queryClient.invalidateQueries(VISIBLE_FIELDS_QUERY_KEY)
        toast.success(response.message || 'Field configuration deleted successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to delete field configuration'
        toast.error(message)
      }
    }
  )
}

export const useInitializeFieldsConfig = () => {
  const queryClient = useQueryClient()

  return useMutation(
    fieldsConfigApi.initialize,
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(FIELDS_CONFIG_QUERY_KEY)
        queryClient.invalidateQueries(VISIBLE_FIELDS_QUERY_KEY)
        toast.success(response.message || 'Field configurations initialized successfully')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to initialize field configurations'
        toast.error(message)
      }
    }
  )
}
