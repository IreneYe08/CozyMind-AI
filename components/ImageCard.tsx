'use client'

import Image from 'next/image'

interface ImageCardProps {
  src: string
  alt: string
  label?: string
  className?: string
}

export default function ImageCard({ src, alt, label, className = '' }: ImageCardProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
      )}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
        <Image
          src={src || '/no-image.png'}
          alt={alt}
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
    </div>
  )
}

