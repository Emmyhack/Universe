'use client'

import { AcademicCapIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  // Load custom logo from localStorage (if uploaded)
  useEffect(() => {
    const savedLogo = localStorage.getItem('universe-custom-logo')
    if (savedLogo) {
      setCustomLogo(savedLogo)
    }
  }, [])

  const sizePx = size === 'sm' ? 24 : size === 'md' ? 32 : 48
  const sizeClasses = size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'

  if (customLogo && !logoError) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={{verticalAlign:'middle'}}>
        <Image
          src={customLogo}
          alt="University Logo"
          width={sizePx}
          height={sizePx}
          style={{ maxWidth: sizePx, maxHeight: sizePx }}
          className={`object-contain ${sizeClasses}`}
          onError={() => setLogoError(true)}
        />
      </span>
    )
  }

  // Default AcademicCapIcon logo
  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{verticalAlign:'middle'}}>
      <AcademicCapIcon className={`text-primary-600 ${sizeClasses}`} />
    </span>
  )
} 