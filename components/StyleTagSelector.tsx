'use client'

import { useState } from 'react'

interface StyleTagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

const AVAILABLE_STYLES = [
  'Modern',
  'Minimalist',
  'Scandinavian',
  'Industrial',
  'Bohemian',
  'Rustic',
  'Contemporary',
  'Traditional',
  'Coastal',
  'Mid-Century',
  'Farmhouse',
  'Art Deco',
]

export default function StyleTagSelector({ selectedTags, onTagsChange }: StyleTagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Style Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => toggleTag(style)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${selectedTags.includes(style)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            #{style}
          </button>
        ))}
      </div>
    </div>
  )
}

