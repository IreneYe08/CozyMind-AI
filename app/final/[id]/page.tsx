'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AmazonItem, ResultRecord, TodoItem } from '@/types/database'

interface UpgradeItem {
  id: string
  title: string
  description: string
  price: string
  image: string
  url?: string
}

export default function FinalPage() {
  const params = useParams()
  const router = useRouter()
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null)
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null)
  const [amazonItems, setAmazonItems] = useState<AmazonItem[]>([])
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [checkedTodos, setCheckedTodos] = useState<Set<number>>(new Set())
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const id = params.id as string
      
      // First try to load from sessionStorage (for new results)
      const before = sessionStorage.getItem('beforeImageUrl')
      const finalAfter = sessionStorage.getItem('finalAfterImageUrl')
      const items = sessionStorage.getItem('amazonItems')
      const todos = sessionStorage.getItem('todoList')
      
      if (before && finalAfter) {
        setBeforeImageUrl(before)
        setAfterImageUrl(finalAfter)
        
        if (items) {
          try {
            setAmazonItems(JSON.parse(items))
          } catch (e) {
            console.error('Failed to parse amazon items:', e)
          }
        }
        
        if (todos) {
          try {
            setTodoList(JSON.parse(todos))
          } catch (e) {
            console.error('Failed to parse todo list:', e)
          }
        }
        
        setLoading(false)
        return
      }

      // If not in sessionStorage, try to load from database (for saved results)
      if (id && !id.startsWith('result-')) {
        try {
          const response = await fetch(`/api/getResult?id=${id}`)
          if (response.ok) {
            const result: ResultRecord = await response.json()
            setBeforeImageUrl(result.before_image)
            setAfterImageUrl(result.after_image)
            if (result.items) {
              setAmazonItems(result.items as AmazonItem[])
            }
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error loading result:', error)
        }
      }

      // If neither works, redirect to upload
      router.push('/upload')
    }

    loadData()
  }, [params.id, router])

  // Convert Amazon items to upgrade items format
  const upgradeItems: UpgradeItem[] = amazonItems.slice(0, 4).map((item, index) => ({
    id: item.id || `item-${index}`,
    title: item.title || 'Product',
    description: getItemDescription(index),
    price: item.price || '$0.00',
    image: item.image_url || '/no-image.png',
    url: item.product_url,
  }))

  function getItemDescription(index: number): string {
    const descriptions = [
      'Add a warm desk lamp',
      'Use a tray to group small items',
      'Add a simple wall print',
      'Use a small bin for random tech gadgets',
    ]
    return descriptions[index] || 'Upgrade item'
  }

  const handleAddToCart = (itemId: string) => {
    const newCart = new Set(cartItems)
    if (newCart.has(itemId)) {
      newCart.delete(itemId)
    } else {
      newCart.add(itemId)
    }
    setCartItems(newCart)
  }

  const handleAddAllToCart = () => {
    const allIds = new Set(upgradeItems.map(item => item.id))
    setCartItems(allIds)
  }

  const handleVisitSite = (url?: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleTodoCheck = (index: number) => {
    const newChecked = new Set(checkedTodos)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedTodos(newChecked)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Use fallback images if URLs are missing
  const safeBeforeImageUrl = beforeImageUrl || '/no-image.png'
  const safeAfterImageUrl = afterImageUrl || '/no-image.png'

  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Newly Generated Stylish Image Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Stylish Upgrade</h1>
            <p className="text-gray-600">
              Based on your preferences, style choices, and budget, here&apos;s your personalized room transformation.
            </p>
          </div>
          <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={safeAfterImageUrl}
              alt="Your stylish room upgrade"
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src !== '/no-image.png') {
                  target.src = '/no-image.png'
                }
              }}
            />
          </div>
        </div>

        {/* Upgrade Plan Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Products</h2>
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 bg-[#8B6F47] text-white rounded-lg font-medium hover:bg-[#7a5f3a] transition-colors"
            >
              Add All to Cart
            </button>
          </div>

          <div className="space-y-6">
            {upgradeItems.map((item, index) => (
              <div key={item.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-500 mb-2">
                      {index + 1}. {item.description}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || '/no-image.png'}
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-lg font-bold text-[#8B6F47]">{item.price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <button
                      onClick={() => handleVisitSite(item.url)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Site
                    </button>
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        cartItems.has(item.id)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-[#8B6F47] text-white hover:bg-[#7a5f3a]'
                      }`}
                    >
                      {cartItems.has(item.id) ? 'Added' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TODO List Section */}
        {todoList.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cleaning Checklist</h2>
            <p className="text-sm text-gray-600 mb-4">
              Personalized desk cleaning tasks based on your setup.
            </p>
            <ul className="space-y-3">
              {todoList.map((todo, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => handleTodoCheck(index)}
                >
                  <input
                    type="checkbox"
                    checked={checkedTodos.has(index)}
                    onChange={() => handleTodoCheck(index)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-5 h-5 mt-0.5 text-[#8B6F47] border-gray-300 rounded focus:ring-[#8B6F47] cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`text-gray-700 font-medium ${checkedTodos.has(index) ? 'line-through text-gray-400' : ''}`}>
                      {todo.task}
                    </p>
                    {todo.reason && (
                      <p className="text-sm text-gray-500 mt-1">{todo.reason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Shopping Cart Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          </div>
          {cartItems.size === 0 ? (
            <p className="text-gray-500">No items yet. Add items from your upgrade plan.</p>
          ) : (
            <div className="space-y-2">
              {upgradeItems
                .filter(item => cartItems.has(item.id))
                .map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">{item.title}</span>
                    <span className="font-semibold text-[#8B6F47]">{item.price}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/preview')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Clean-Up Plan</span>
          </button>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg font-semibold hover:bg-[#7a5f3a] transition-colors"
          >
            Start Another Room
          </button>
        </div>
      </div>
    </div>
  )
}

