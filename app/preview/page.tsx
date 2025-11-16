'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProgressIndicator from '@/components/ProgressIndicator'

// Desk-only cleaning tasks (no laundry, dishes, floor, etc.)
const TODO_ITEMS = [
  'Throw away food packaging and snack wrappers on desk',
  'Wipe the desk surface clean',
  'Organize cables into a tidy group with cable clips',
  'Stack notebooks and papers neatly',
  'Move loose small items into a storage tray',
  'Group pens and stationery together in a holder',
]

export default function PreviewPage() {
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null)
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const before = sessionStorage.getItem('beforeImageUrl')
    const after = sessionStorage.getItem('afterImageUrl')
    
    if (!before || !after) {
      router.push('/upload')
      return
    }

    setBeforeImageUrl(before)
    setAfterImageUrl(after)
  }, [router])

  const handleCheckboxChange = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)
  }

  const handleContinue = () => {
    router.push('/customize')
  }

  if (!beforeImageUrl || !afterImageUrl) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} />

        {/* Back to Upload Link */}
        <button
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Upload</span>
        </button>

        {/* Step 2 Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium">
            Step 2 - Clean Up
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Your AI Clean-Up Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Follow these steps to reset your room.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Card: Before & After */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Before & After</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={beforeImageUrl || '/no-image.png'}
                    alt="Before"
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
                <span className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  Before
                </span>
              </div>
              <div className="relative">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={afterImageUrl || '/no-image.png'}
                    alt="After (AI Generated)"
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
                <span className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  After (AI Generated)
                </span>
              </div>
            </div>
          </div>

          {/* Right Card: To-Do List */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Clean-Up To-Do List</h2>
            <p className="text-sm text-gray-600 mb-4">
              We&apos;ve broken your cleaning into simple, actionable steps.
            </p>
            <div className="space-y-3">
              {TODO_ITEMS.map((item, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(index)}
                    onChange={() => handleCheckboxChange(index)}
                    className="w-5 h-5 text-[#8B6F47] border-gray-300 rounded focus:ring-[#8B6F47]"
                  />
                  <span className={`text-gray-700 ${checkedItems.has(index) ? 'line-through text-gray-400' : ''}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/upload')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Upload</span>
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg font-semibold hover:bg-[#7a5f3a] transition-colors"
          >
            Let&apos;s add a little upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

