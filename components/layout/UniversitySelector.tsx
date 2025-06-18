'use client'

import { useState } from 'react'
import { useUniversity } from '../providers/UniversityProvider'
import { useUniversityRegistry } from '../contracts/hooks'
import { useWeb3 } from '../providers/Web3Provider'
import { 
  AcademicCapIcon, 
  ChevronDownIcon, 
  CheckIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { ethers } from 'ethers'

interface University {
  code: string
  name: string
  adminWallet: string
  isActive: boolean
  registrationDate: number
}

export default function UniversitySelector() {
  const { selectedUniversity, selectUniversity, clearUniversity, userUniversities } = useUniversity()
  const { address, isConnected } = useWeb3()
  const universityRegistry = useUniversityRegistry()
  const [isOpen, setIsOpen] = useState(false)
  const [allUniversities, setAllUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all universities for selection
  const fetchAllUniversities = async () => {
    if (!universityRegistry) return
    
    setLoading(true)
    try {
      const filter = universityRegistry.filters.UniversityRegistered()
      const events = await universityRegistry.queryFilter(filter)
      
      const universities: University[] = []
      for (const ev of events) {
        const { code, name, adminWallet, registrationDate } = (ev as any).args
        try {
          const info = await universityRegistry.getUniversityInfo(code)
          if (info.isActive) {
            universities.push({
              code: info.code,
              name: info.name,
              adminWallet: info.adminWallet,
              isActive: info.isActive,
              registrationDate: Number(info.registrationDate)
            })
          }
        } catch (e) {
          console.warn(`Could not fetch info for university ${code}:`, e)
        }
      }
      setAllUniversities(universities)
    } catch (e) {
      console.error('Error fetching universities:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      fetchAllUniversities()
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (university: University) => {
    selectUniversity(university)
    setIsOpen(false)
  }

  const handleClear = () => {
    clearUniversity()
    setIsOpen(false)
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {selectedUniversity ? (
          <>
            <AcademicCapIcon className="h-4 w-4 text-primary-600" />
            <span className="truncate max-w-32">{selectedUniversity.name}</span>
            <span className="text-xs text-gray-500">({selectedUniversity.code})</span>
          </>
        ) : (
          <>
            <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
            <span>Select University</span>
          </>
        )}
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Select Your University</h3>
            <p className="text-xs text-gray-500 mt-1">
              Choose your university to access university-specific features
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading universities...</p>
              </div>
            ) : allUniversities.length === 0 ? (
              <div className="p-4 text-center">
                <AcademicCapIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No universities available</p>
              </div>
            ) : (
              <div className="py-2">
                {allUniversities.map((university) => {
                  const isSelected = selectedUniversity?.code === university.code
                  const isUserAdmin = university.adminWallet.toLowerCase() === address?.toLowerCase()
                  
                  return (
                    <button
                      key={university.code}
                      onClick={() => handleSelect(university)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                        isSelected ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <AcademicCapIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {university.name}
                              </p>
                              <p className="text-xs text-gray-500">{university.code}</p>
                            </div>
                          </div>
                          {isUserAdmin && (
                            <div className="flex items-center mt-1">
                              <UserIcon className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-xs text-green-600">Admin</span>
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {selectedUniversity && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 