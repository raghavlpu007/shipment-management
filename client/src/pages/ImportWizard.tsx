import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download
} from 'lucide-react'
import Button from '../components/Button'
import Select from '../components/Select'
import LoadingSpinner from '../components/LoadingSpinner'
import { importApi } from '../utils/api'
import { ImportPreviewData, ImportResult } from '../types'
import toast from 'react-hot-toast'

interface ImportWizardProps {}

const ImportWizard: React.FC<ImportWizardProps> = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // File upload with dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0])
      }
    }
  })

  // Step 1: File Upload
  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      const response = await importApi.preview(selectedFile)
      setPreviewData(response.data)
      setMappings(response.data.suggestedMappings)
      setCurrentStep(2)
    } catch (error) {
      toast.error('Failed to process file')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Column Mapping
  const handleMappingChange = (csvColumn: string, shipmentField: string) => {
    setMappings(prev => ({
      ...prev,
      [csvColumn]: shipmentField
    }))
  }

  // Step 3: Execute Import
  const handleExecuteImport = async () => {
    if (!previewData) return

    setIsLoading(true)
    try {
      const response = await importApi.execute({
        filename: previewData.filename,
        mappings,
        defaultValues: {
          createdBy: 'import',
          updatedBy: 'import'
        }
      })
      setImportResult(response.data)
      setCurrentStep(3)
    } catch (error) {
      toast.error('Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset wizard
  const handleReset = () => {
    setCurrentStep(1)
    setSelectedFile(null)
    setPreviewData(null)
    setMappings({})
    setImportResult(null)
  }

  // Download template
  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`/api/template/download?format=${format}`)
      if (!response.ok) {
        throw new Error('Failed to download template')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `import-template-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Template downloaded as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  const steps = [
    { number: 1, title: 'Upload File', description: 'Select CSV or XLSX file' },
    { number: 2, title: 'Map Columns', description: 'Map CSV columns to fields' },
    { number: 3, title: 'Import Results', description: 'Review import results' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Import Data</h1>
          <p className="mt-1 text-sm text-gray-500">
            Import shipment data from CSV or XLSX files
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleDownloadTemplate('csv')}
          >
            Download CSV Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleDownloadTemplate('xlsx')}
          >
            Download XLSX Template
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.number
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-gray-400 mx-6" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File</h3>
            
            {/* Template Info Box */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Need a template?
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Download a pre-formatted template based on your current field configuration. 
                    The template automatically updates when you modify fields in Field Settings.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                      Download CSV Template
                    </button>
                    <span className="text-blue-400">|</span>
                    <button
                      onClick={() => handleDownloadTemplate('xlsx')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                      Download XLSX Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {isDragActive
                      ? 'Drop the file here...'
                      : 'Drag and drop a file here, or click to select'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports CSV, XLS, and XLSX files up to 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile}
                loading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Next: Map Columns
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {currentStep === 2 && previewData && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Map Columns</h3>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      File: {selectedFile?.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      {previewData.totalRows} rows found
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Column Mappings</h4>
              
              {previewData.headers.map((header) => (
                <div key={header} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      CSV Column: <span className="font-mono text-primary-600">{header}</span>
                    </label>
                  </div>
                  
                  <div>
                    <Select
                      options={[
                        { value: '', label: 'Skip this column' },
                        ...previewData.availableFields.map(field => ({
                          value: field.key,
                          label: field.label
                        }))
                      ]}
                      value={mappings[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Sample: {previewData.sampleData[0]?.[header] || 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <Button
                onClick={handleExecuteImport}
                loading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Import Data
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Import Results */}
        {currentStep === 3 && importResult && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-lg font-semibold text-green-900">
                      {importResult.successful}
                    </p>
                    <p className="text-sm text-green-700">Successfully imported</p>
                  </div>
                </div>
              </div>
              
              {importResult.failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-lg font-semibold text-red-900">
                        {importResult.failed}
                      </p>
                      <p className="text-sm text-red-700">Failed to import</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Import Errors</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                Import Another File
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View Shipments
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportWizard
