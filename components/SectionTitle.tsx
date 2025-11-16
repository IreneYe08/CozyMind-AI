'use client'

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${className}`}>
      {children}
    </h2>
  )
}

