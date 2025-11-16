'use client'

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Upload' },
    { number: 2, label: 'Clean Up' },
    { number: 3, label: 'Upgrade & Shop' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                currentStep === step.number
                  ? 'bg-[#8B6F47] text-white'
                  : 'bg-white text-gray-600'
              }
            `}
          >
            {step.number}. {step.label}
          </div>
          {index < steps.length - 1 && (
            <span className="mx-2 text-gray-400">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

