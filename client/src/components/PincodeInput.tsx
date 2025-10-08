import React, { useEffect, useState } from 'react'
import { MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Input from './Input'
import { usePincodeAPI } from '../hooks/usePincodeAPI'
import { useDebounce } from '../hooks/useDebounce'
import { PincodeData } from '../types'

interface PincodeInputProps {
  value: string
  onChange: (value: string) => void
  onPincodeData: (data: PincodeData | null) => void
  error?: string
  disabled?: boolean
  className?: string
}

const PincodeInput: React.FC<PincodeInputProps> = ({
  value,
  onChange,
  onPincodeData,
  error: externalError,
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value)
  const { loading, error, pincodeData, fetchPincodeData, clearData } = usePincodeAPI()
  const debouncedPincode = useDebounce(inputValue, 800) // 800ms delay

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Fetch pincode data when debounced value changes
  useEffect(() => {
    if (debouncedPincode && debouncedPincode.length === 6) {
      fetchPincodeData(debouncedPincode)
    } else if (debouncedPincode.length === 0) {
      clearData()
      onPincodeData(null)
    }
  }, [debouncedPincode, fetchPincodeData, clearData, onPincodeData])

  // Notify parent component when pincode data changes
  useEffect(() => {
    onPincodeData(pincodeData)
  }, [pincodeData, onPincodeData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6) // Only allow digits, max 6
    setInputValue(newValue)
    onChange(newValue)
  }

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
    
    if (error || externalError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    if (pincodeData && inputValue.length === 6) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    return <MapPin className="h-4 w-4 text-gray-400" />
  }

  const getStatusMessage = () => {
    if (loading) {
      return (
        <div className="flex items-center text-sm text-blue-600 mt-1">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Fetching location data...
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="flex items-center text-sm text-red-600 mt-1">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )
    }
    
    if (pincodeData && inputValue.length === 6) {
      return (
        <div className="flex items-center text-sm text-green-600 mt-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          Found: {pincodeData.city}, {pincodeData.state}
        </div>
      )
    }
    
    if (inputValue.length > 0 && inputValue.length < 6) {
      return (
        <div className="text-sm text-gray-500 mt-1">
          Enter 6-digit pincode for auto-fill
        </div>
      )
    }
    
    return null
  }

  return (
    <div className={className}>
      <div className="relative">
        <Input
          label="Pincode"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          disabled={disabled}
          error={externalError}
          className="font-mono tracking-wider pr-10"
        />
        <div className="absolute right-3 top-9 flex items-center">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusMessage()}
    </div>
  )
}

export default PincodeInput
