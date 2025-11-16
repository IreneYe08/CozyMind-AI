'use client'

import Image from 'next/image'
import { AmazonItem } from '@/types/database'

interface ProductCardProps {
  item: AmazonItem
}

export default function ProductCard({ item }: ProductCardProps) {
  return (
    <a
      href={item.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative w-full aspect-square">
        <Image
          src={item.image_url || '/no-image.png'}
          alt={item.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to no-image.png if image fails to load
            const target = e.target as HTMLImageElement
            if (target.src !== '/no-image.png') {
              target.src = '/no-image.png'
            }
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {item.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">{item.price}</p>
          {item.rating && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

