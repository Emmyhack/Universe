'use client'

import { useState, useRef } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function LogoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) return

    setUploading(true)
    try {
      // Store the base64 data in localStorage
      localStorage.setItem('universe-custom-logo', preview)
      toast.success('Logo uploaded successfully!')
      
      // Force a page refresh to update all logo instances
      window.location.reload()
    } catch (error) {
      toast.error('Failed to upload logo')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    localStorage.removeItem('universe-custom-logo')
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Logo removed')
    window.location.reload()
  }

  const currentLogo = localStorage.getItem('universe-custom-logo')

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Logo</h3>
        <p className="text-sm text-gray-600">
          Upload a custom logo to replace the default icon. Recommended size: 48x48px or larger.
        </p>
      </div>

      {/* Current Logo Preview */}
      {currentLogo && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img 
              src={currentLogo} 
              alt="Current Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-sm text-gray-600">Current logo</span>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          {preview ? (
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Logo Preview" 
                className="h-16 w-16 object-contain mx-auto"
              />
              <div className="flex justify-center space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary text-sm"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <button
                  onClick={() => {
                    setPreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 2MB
                </p>
              </div>
              <input
                id="logo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 