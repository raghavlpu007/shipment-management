import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, FileImage, File } from 'lucide-react'

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // in MB
  onFileSelect: (file: File | null) => void
  currentFile?: string
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*",
  maxSize = 5,
  onFileSelect,
  currentFile,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set preview to currentFile URL when component mounts or currentFile changes
  useEffect(() => {
    if (currentFile && !selectedFile) {
      setPreview(currentFile)
    } else if (!selectedFile) {
      setPreview(null)
    }
  }, [currentFile, selectedFile])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFile || currentFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {selectedFile || currentFile ? (
          <div className="space-y-3">
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="mx-auto h-20 w-20 object-cover rounded-lg"
              />
            ) : (
              <div className="mx-auto h-12 w-12 flex items-center justify-center">
                {accept.includes('image') ? (
                  <FileImage className="h-8 w-8 text-gray-400" />
                ) : (
                  <File className="h-8 w-8 text-gray-400" />
                )}
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile?.name || (currentFile ? currentFile.split('/').pop() || 'Current file' : 'Current file')}
              </p>
              <p className="text-xs text-gray-500">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : (currentFile ? 'Existing file' : '')}
              </p>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveFile()
              }}
              className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept.includes('image') ? 'PNG, JPG, GIF' : 'All files'} up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
