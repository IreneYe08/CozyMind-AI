import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CozyMind AI - Room Design Assistant',
  description: 'AI-powered room design assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

