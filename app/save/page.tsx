'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ImageCard from '@/components/ImageCard'
import ProductCard from '@/components/ProductCard'
import SectionTitle from '@/components/SectionTitle'
import { AmazonItem } from '@/types/database'

export default function SavePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null)
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null)
  const [amazonItems, setAmazonItems] = useState<AmazonItem[]>([])

  useEffect(() => {
    const before = sessionStorage.getItem('beforeImageUrl')
    const finalAfter = sessionStorage.getItem('finalAfterImageUrl')
    const items = sessionStorage.getItem('amazonItems')
    
    if (!before || !finalAfter) {
      router.push('/upload')
      return
    }

    setBeforeImageUrl(before)
    setAfterImageUrl(finalAfter)
    
    if (items) {
      try {
        setAmazonItems(JSON.parse(items))
      } catch (e) {
        console.error('Failed to parse amazon items:', e)
      }
    }
  }, [router])

  const handleContinue = () => {
    // Clear session storage
    sessionStorage.clear()
    router.push('/gallery')
  }

  if (!beforeImageUrl || !afterImageUrl) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle>Saved Successfully!</SectionTitle>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">
            ✓ Your design has been saved to your gallery
          </p>
        </div>

        {/* Images Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/2">
            <ImageCard
              src={beforeImageUrl}
              alt="Before"
              label="Before"
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <ImageCard
              src={afterImageUrl}
              alt="After"
              label="After"
            />
          </div>
        </div>

        {/* Product List Section */}
        {amazonItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amazonItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Gallery
          </button>
        </div>
      </div>
    </div>
  )
}

