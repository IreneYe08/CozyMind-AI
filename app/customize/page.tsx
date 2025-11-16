'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProgressIndicator from '@/components/ProgressIndicator'
import LoadingSpinner from '@/components/LoadingSpinner'

const STYLE_TAGS = [
  { id: 'warm', label: '#warm' },
  { id: 'minimalist', label: '#minimalist' },
  { id: 'cozy', label: '#cozy' },
  { id: 'natural', label: '#natural' },
  { id: 'organized', label: '#organized' },
  { id: 'japandi', label: '#japandi' },
  { id: 'modern', label: '#modern' },
  { id: 'scandinavian', label: '#scandinavian' },
  { id: 'industrial', label: '#industrial' },
  { id: 'bohemian', label: '#bohemian' },
]

const BUDGET_OPTIONS = ['$20', '$200', '$500', 'Custom']

const PREP_STEPS = [
  'Clear the desk surface completely',
  'Wipe down the desk and surrounding area',
  'Organize cables and hide them',
]

export default function CustomizePage() {
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null)
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null)
  const [userMessage, setUserMessage] = useState('I use this desk for work and study, and I like warm cozy vibe')
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hi! I'm your AI stylist. Let me help you upgrade this space. Is this your bedroom, living room, or desk?", isAI: true },
    { id: 2, text: 'Do you prefer cozy, minimal, or colorful vibes?', isAI: true },
  ])
  const [selectedBudget, setSelectedBudget] = useState<string>('$200')
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [checkedPrepSteps, setCheckedPrepSteps] = useState<Set<number>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
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

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    // Add user message
    const newUserMessage = { id: Date.now(), text: userMessage, isAI: false }
    setChatMessages(prev => [...prev, newUserMessage])
    setUserMessage('')

    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, text: 'Great! Based on your preferences, I\'ve created a moodboard with warm, cozy items that would work well for your desk setup.', isAI: true }
      setChatMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleQuickReply = (reply: string) => {
    setUserMessage(reply)
  }

  const handlePrepStepCheck = (index: number) => {
    const newChecked = new Set(checkedPrepSteps)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedPrepSteps(newChecked)
  }

  const handleToggleStyle = (styleId: string) => {
    const newStyles = new Set(selectedStyles)
    if (newStyles.has(styleId)) {
      newStyles.delete(styleId)
    } else {
      newStyles.add(styleId)
    }
    setSelectedStyles(newStyles)
  }

  const handleGenerate = async () => {
    if (!beforeImageUrl) return

    setIsGenerating(true)
    try {
      // Extract user messages from chat (only user messages, not AI)
      // Also include the current input message if it exists
      const allUserMessages = [
        ...chatMessages.filter(msg => !msg.isAI).map(msg => msg.text),
        ...(userMessage.trim() ? [userMessage] : [])
      ]
      
      // Combine all user interactions into a comprehensive prompt
      const chatContext = allUserMessages.join('. ')
      const styleContext = Array.from(selectedStyles).join(', ')
      
      // Build comprehensive prompt from chat interactions
      const combinedPrompt = chatContext || 'upgrade this space'
      
      const response = await fetch('/api/generateAfterProductList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          before_image_url: beforeImageUrl,
          prompt: combinedPrompt,
          style: styleContext || 'modern',
          budget: selectedBudget === 'Custom' ? undefined : parseInt(selectedBudget.replace('$', '')),
          chat_messages: allUserMessages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate final result')
      }

      const { final_after_image_url, amazon_items, todo_list } = await response.json()

      const resultId = `result-${Date.now()}`
      sessionStorage.setItem('finalAfterImageUrl', final_after_image_url)
      sessionStorage.setItem('amazonItems', JSON.stringify(amazon_items))
      sessionStorage.setItem('todoList', JSON.stringify(todo_list || []))
      sessionStorage.setItem('resultId', resultId)
      sessionStorage.setItem('customizePrompt', combinedPrompt)
      sessionStorage.setItem('customizeStyle', styleContext || 'modern')
      sessionStorage.setItem('customizeBudget', selectedBudget)

      router.push(`/final/${resultId}`)
    } catch (error) {
      console.error('Error generating final result:', error)
      alert('Failed to generate final result. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!beforeImageUrl || !afterImageUrl) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} />

        {/* Back Button */}
        <button
          onClick={() => router.push('/preview')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Let&apos;s add a little upgrade ✨
          </h1>
          <p className="text-gray-600 text-lg">
            Answer a few quick questions and get a simple upgrade plan with items to buy.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel: Chat */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Chat with your AI stylist</h2>
            <p className="text-sm text-gray-600 mb-4">
              Tell me what vibe you like, or what&apos;s missing in this room.
            </p>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-4 h-64 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.isAI
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-[#8B6F47] text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['Warm desk lamp', 'Tray + candle', 'Wall print above the desk'].map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7a5f3a] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Panel: Style Tags & Budget */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Style preferences</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select style tags that match your vision.
            </p>
            
            {/* Style Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleToggleStyle(style.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedStyles.has(style.id)
                        ? 'bg-[#8B6F47] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Adjust Budget</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(budget)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedBudget === budget
                        ? 'bg-[#8B6F47] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Before You Shop */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Before You Shop</h2>
          <p className="text-sm text-gray-600 mb-4">
            Quick prep steps to get your space ready for upgrades.
          </p>
          <div className="space-y-3">
            {PREP_STEPS.map((step, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedPrepSteps.has(index)}
                  onChange={() => handlePrepStepCheck(index)}
                  className="w-5 h-5 text-[#8B6F47] border-gray-300 rounded focus:ring-[#8B6F47]"
                />
                <span className={`text-gray-700 ${checkedPrepSteps.has(index) ? 'line-through text-gray-400' : ''}`}>
                  {step}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedStyles.size === 0}
            className={`
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-colors duration-200
              ${isGenerating || selectedStyles.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#8B6F47] hover:bg-[#7a5f3a]'
              }
            `}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Generating Stylish Upgrade Plan...
              </span>
            ) : (
              'Generate Upgrade Plan'
            )}
          </button>
          {selectedStyles.size === 0 && (
            <p className="text-sm text-gray-500 mt-2">Please select at least one style tag</p>
          )}
        </div>
      </div>
    </div>
  )
}

