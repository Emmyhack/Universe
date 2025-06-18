'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useWeb3 } from './Web3Provider'
import { useUniversityRegistry } from '../contracts/hooks'
import { ethers } from 'ethers'

interface University {
  code: string
  name: string
  adminWallet: string
  isActive: boolean
  registrationDate: number
}

interface UniversityContextType {
  selectedUniversity: University | null
  userUniversities: University[]
  isUniversityAdmin: boolean
  isStudentVerified: boolean
  selectUniversity: (university: University) => void
  clearUniversity: () => void
  refreshUserUniversities: () => Promise<void>
  loading: boolean
  error: string | null
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined)

export function UniversityProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWeb3()
  const universityRegistry = useUniversityRegistry()
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [userUniversities, setUserUniversities] = useState<University[]>([])
  const [isUniversityAdmin, setIsUniversityAdmin] = useState(false)
  const [isStudentVerified, setIsStudentVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch universities where the user has roles
  const refreshUserUniversities = async () => {
    if (!universityRegistry || !address) {
      setUserUniversities([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all registered universities
      const filter = universityRegistry.filters.UniversityRegistered()
      const events = await universityRegistry.queryFilter(filter)
      
      const universities: University[] = []
      const UNIVERSITY_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNIVERSITY_ADMIN_ROLE"))

      for (const ev of events) {
        const { code, name, adminWallet, registrationDate } = (ev as any).args
        try {
          const info = await universityRegistry.getUniversityInfo(code)
          if (info.isActive) {
            const university: University = {
              code: info.code,
              name: info.name,
              adminWallet: info.adminWallet,
              isActive: info.isActive,
              registrationDate: Number(info.registrationDate)
            }
            
            // Check if user is admin of this university
            const isAdmin = await universityRegistry.hasRole(UNIVERSITY_ADMIN_ROLE, address)
            if (isAdmin) {
              universities.push(university)
            }
          }
        } catch (e) {
          console.warn(`Could not fetch info for university ${code}:`, e)
        }
      }

      setUserUniversities(universities)
      
      // If user has only one university, auto-select it
      if (universities.length === 1 && !selectedUniversity) {
        setSelectedUniversity(universities[0])
      }
    } catch (e: any) {
      console.error('Error fetching user universities:', e)
      setError('Failed to fetch universities')
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin of selected university
  useEffect(() => {
    if (!selectedUniversity || !address) {
      setIsUniversityAdmin(false)
      return
    }

    setIsUniversityAdmin(selectedUniversity.adminWallet.toLowerCase() === address.toLowerCase())
  }, [selectedUniversity, address])

  // Refresh universities when wallet connects/disconnects
  useEffect(() => {
    if (isConnected) {
      refreshUserUniversities()
    } else {
      setUserUniversities([])
      setSelectedUniversity(null)
      setIsUniversityAdmin(false)
      setIsStudentVerified(false)
    }
  }, [isConnected, address])

  const selectUniversity = (university: University) => {
    setSelectedUniversity(university)
    // Store in localStorage for persistence
    localStorage.setItem('selectedUniversity', JSON.stringify(university))
  }

  const clearUniversity = () => {
    setSelectedUniversity(null)
    localStorage.removeItem('selectedUniversity')
  }

  // Load selected university from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedUniversity')
    if (stored) {
      try {
        const university = JSON.parse(stored)
        setSelectedUniversity(university)
      } catch (e) {
        console.warn('Failed to parse stored university:', e)
        localStorage.removeItem('selectedUniversity')
      }
    }
  }, [])

  const value: UniversityContextType = {
    selectedUniversity,
    userUniversities,
    isUniversityAdmin,
    isStudentVerified,
    selectUniversity,
    clearUniversity,
    refreshUserUniversities,
    loading,
    error
  }

  return (
    <UniversityContext.Provider value={value}>
      {children}
    </UniversityContext.Provider>
  )
}

export function useUniversity() {
  const context = useContext(UniversityContext)
  if (context === undefined) {
    throw new Error('useUniversity must be used within a UniversityProvider')
  }
  return context
} 