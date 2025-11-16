'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProgressIndicator from '@/components/ProgressIndicator'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleImageSelect = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile) return

    setIsGenerating(true)
    try {
      // Upload image to Supabase storage
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url: imageUrl } = await uploadResponse.json()

      // Generate initial after image
      const generateResponse = await fetch('/api/generateInitialAfter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ before_image_url: imageUrl }),
      })

      if (!generateResponse.ok) {
        throw new Error('Failed to generate image')
      }

      const { after_image_url } = await generateResponse.json()

      // Store in sessionStorage and redirect
      sessionStorage.setItem('beforeImageUrl', imageUrl)
      sessionStorage.setItem('afterImageUrl', after_image_url)

      router.push('/preview')
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            Let&apos;s clean your room together
            <svg className="w-8 h-8 text-[#8B6F47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a photo of your messy space and I&apos;ll create a cleaning plan for you.
          </p>
        </div>

        {/* Image Preview Section */}
        <div className="mb-6">
          {previewUrl ? (
            <>
              {/* Large rectangular preview */}
              <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden mb-4 bg-white shadow-md">
                <Image
                  src={previewUrl || '/no-image.png'}
                  alt="Uploaded room"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.src !== '/no-image.png') {
                      target.src = '/no-image.png'
                    }
                  }}
                />
              </div>
              {/* Small square thumbnail */}
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white shadow-md">
                <Image
                  src={previewUrl || '/no-image.png'}
                  alt="Uploaded room thumbnail"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.src !== '/no-image.png') {
                      target.src = '/no-image.png'
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div
              className="relative w-full h-96 md:h-[500px] rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-[#8B6F47] transition-colors"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 font-medium">Click to upload your room photo</p>
              </div>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || isGenerating}
            className={`
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-colors duration-200
              ${!selectedFile || isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#8B6F47] hover:bg-[#7a5f3a]'
              }
            `}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Generating Clean-Up Plan...
              </span>
            ) : (
              'Generate Clean-Up Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

