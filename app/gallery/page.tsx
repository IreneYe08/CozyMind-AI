'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { ResultRecord } from '@/types/database'
import LoadingSpinner from '@/components/LoadingSpinner'
import SectionTitle from '@/components/SectionTitle'

export default function GalleryPage() {
  const [results, setResults] = useState<ResultRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setUser(session.user)
    fetchResults(session.user.id)
  }

  const fetchResults = async (userId: string) => {
    try {
      const response = await fetch(`/api/getResults?user_id=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <SectionTitle>My Gallery</SectionTitle>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No saved designs yet.</p>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => router.push(`/final/${result.id}`)}
                className="relative aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
              >
                <Image
                  src={result.after_image || '/no-image.png'}
                  alt="Design result"
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

