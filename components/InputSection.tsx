'use client'

import { ReactNode } from 'react'

interface InputSectionProps {
  children: ReactNode
  className?: string
}

export default function InputSection({ children, className = '' }: InputSectionProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {children}
    </div>
  )
}

