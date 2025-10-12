import { useState, useCallback } from 'react'
import { PincodeData } from '../types'
import api from '../utils/api'

interface UsePincodeAPIReturn {
  loading: boolean
  error: string | null
  pincodeData: PincodeData | null
  fetchPincodeData: (pincode: string) => Promise<PincodeData | null>
  clearData: () => void
}

// Cache for storing pincode data to reduce API calls
const pincodeCache = new Map<string, PincodeData>()

export const usePincodeAPI = (): UsePincodeAPIReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null)

  const validatePincode = (pincode: string): boolean => {
    // Check if pincode is exactly 6 digits
    const pincodeRegex = /^\d{6}$/
    return pincodeRegex.test(pincode)
  }

  const fetchPincodeData = useCallback(async (pincode: string): Promise<PincodeData | null> => {
    // Clear previous error
    setError(null)

    // Validate pincode format
    if (!validatePincode(pincode)) {
      setError('Please enter a valid 6-digit pincode')
      return null
    }

    // Check cache first
    if (pincodeCache.has(pincode)) {
      const cachedData = pincodeCache.get(pincode)!
      setPincodeData(cachedData)
      return cachedData
    }

    setLoading(true)

    try {
      // Call backend API proxy using configured api instance
      const response = await api.get(`/pincode/${pincode}`)

      if (!response.data.success || !response.data.data) {
        setError('No data found for this pincode. Please check and try again.')
        return null
      }

      const transformedData: PincodeData = response.data.data

      // Cache the result
      pincodeCache.set(pincode, transformedData)
      setPincodeData(transformedData)

      return transformedData
    } catch (err: any) {
      console.error('Pincode API Error:', err)

      if (err.response) {
        // Server responded with error
        const message = err.response.data?.error || err.response.data?.message
        if (err.response.status === 404) {
          setError('No data found for this pincode. Please check and try again.')
        } else if (err.response.status === 429) {
          setError('Too many requests. Please wait a moment and try again.')
        } else {
          setError(message || 'Failed to fetch pincode data. Please try again.')
        }
      } else if (err.request) {
        // Request made but no response
        setError('Network error. Please check your internet connection and try again.')
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.')
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setPincodeData(null)
    setError(null)
  }, [])

  return {
    loading,
    error,
    pincodeData,
    fetchPincodeData,
    clearData,
  }
}

export default usePincodeAPI
