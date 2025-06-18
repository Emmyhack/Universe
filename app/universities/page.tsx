'use client'

import Navigation from '@/components/layout/Navigation'
import { useUniversityRegistry } from '@/components/contracts/hooks'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useUniversity } from '@/components/providers/UniversityProvider'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { 
  AcademicCapIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface University {
  name: string
  code: string
  adminWallet: string
  isActive: boolean
  registrationDate: number
}

// Pre-populated Nigerian universities
const NIGERIAN_UNIVERSITIES = [
  { name: "University of Lagos", code: "UNILAG", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Ibadan", code: "UI", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Obafemi Awolowo University", code: "OAU", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Nigeria, Nsukka", code: "UNN", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Ahmadu Bello University", code: "ABU", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Benin", code: "UNIBEN", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Ilorin", code: "UNILORIN", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Jos", code: "UNIJOS", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Calabar", code: "UNICAL", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "University of Port Harcourt", code: "UNIPORT", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Federal University of Technology, Akure", code: "FUTA", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Federal University of Technology, Minna", code: "FUTMINNA", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Federal University of Technology, Owerri", code: "FUTO", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Lagos State University", code: "LASU", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Covenant University", code: "CU", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Babcock University", code: "BU", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Bells University of Technology", code: "BELLS", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Crawford University", code: "CRAWFORD", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Redeemer's University", code: "RUN", adminWallet: "0x0000000000000000000000000000000000000000" },
  { name: "Bingham University", code: "BINGHAM", adminWallet: "0x0000000000000000000000000000000000000000" }
]

export default function UniversitiesPage() {
  const universityRegistry = useUniversityRegistry()
  const { address, isConnected } = useWeb3()
  const { selectedUniversity, isUniversityAdmin, userUniversities } = useUniversity()
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRegistrarRole, setHasRegistrarRole] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    code: '',
    adminWallet: '',
  })
  const [registering, setRegistering] = useState(false)

  // Check if user has registrar role
  useEffect(() => {
    if (!universityRegistry || !address) return
    async function checkRole() {
      try {
        const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"))
        const hasRole = await universityRegistry!.hasRole(REGISTRAR_ROLE, address)
        setHasRegistrarRole(hasRole)
      } catch (e) {
        console.error('Error checking role:', e)
      }
    }
    checkRole()
  }, [universityRegistry, address])

  // Fetch universities from contract events
  useEffect(() => {
    if (!universityRegistry) return
    setLoading(true)
    setError(null)
    async function fetchUniversities() {
      try {
        // Get all UniversityRegistered events
        const filter = universityRegistry!.filters.UniversityRegistered()
        const events = await universityRegistry!.queryFilter(filter)
        
        // Remove duplicates by code and get latest info
        const unique: Record<string, University> = {}
        for (const ev of events) {
          const { code, name, adminWallet, registrationDate } = (ev as any).args
          try {
            const info = await universityRegistry!.getUniversityInfo(code)
            unique[code] = {
              name: info.name,
              code: info.code,
              adminWallet: info.adminWallet,
              isActive: info.isActive,
              registrationDate: Number(info.registrationDate),
            }
          } catch (e) {
            // University might have been removed
          }
        }
        setUniversities(Object.values(unique).sort((a, b) => b.registrationDate - a.registrationDate))
      } catch (e: any) {
        setError('Failed to fetch universities: ' + e.message)
        console.error('Error fetching universities:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchUniversities()
  }, [universityRegistry, registering])

  // Register university
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!universityRegistry || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!hasRegistrarRole) {
      toast.error('You do not have permission to register universities')
      return
    }

    setRegistering(true)
    try {
      const tx = await universityRegistry.registerUniversity(
        form.name,
        form.code,
        form.adminWallet
      )
      toast.loading('Registering university...')
      await tx.wait()
      toast.success('University registered successfully!')
      setForm({ name: '', code: '', adminWallet: '' })
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to register university'
      toast.error(errorMessage)
      console.error('Registration error:', e)
    } finally {
      setRegistering(false)
    }
  }

  // Update university status (admin only)
  async function toggleUniversityStatus(code: string, currentStatus: boolean) {
    if (!universityRegistry || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      const tx = await universityRegistry.setUniversityStatus(code, !currentStatus)
      toast.loading('Updating university status...')
      await tx.wait()
      toast.success(`University ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      // Refresh the list
      setRegistering(true)
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to update university status'
      toast.error(errorMessage)
      console.error('Status update error:', e)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Universities</h1>
            <div className="text-sm text-gray-600">
              {isConnected ? (
                hasRegistrarRole ? (
                  <span className="text-green-600">✓ Registrar Role</span>
                ) : (
                  <span className="text-red-600">✗ No Registrar Role</span>
                )
              ) : (
                <span className="text-yellow-600">Please connect wallet</span>
              )}
            </div>
          </div>

          {/* Selected University Info */}
          {selectedUniversity && (
            <div className="card mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedUniversity.name}</h2>
                    <p className="text-sm text-gray-600">Code: {selectedUniversity.code}</p>
                    {isUniversityAdmin && (
                      <div className="flex items-center mt-1">
                        <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">University Administrator</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    <p>Admin: {selectedUniversity.adminWallet.slice(0, 6)}...{selectedUniversity.adminWallet.slice(-4)}</p>
                    <p>Registered: {new Date(selectedUniversity.registrationDate * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pre-populated Nigerian Universities */}
          {hasRegistrarRole && (
            <div className="card mb-8">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Quick Register Nigerian Universities</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Register pre-populated Nigerian universities with a single click. You can set the admin wallet address after registration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {NIGERIAN_UNIVERSITIES.slice(0, 9).map((uni, index) => {
                  const isRegistered = universities.some(u => u.code === uni.code)
                  return (
                    <div key={uni.code} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{uni.name}</h3>
                          <p className="text-xs text-gray-600 font-mono">{uni.code}</p>
                        </div>
                        {isRegistered ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" title="Already registered" />
                        ) : (
                          <button
                            onClick={async () => {
                              if (!universityRegistry || !isConnected) {
                                toast.error('Please connect your wallet first')
                                return
                              }
                              
                              setRegistering(true)
                              try {
                                const tx = await universityRegistry.registerUniversity(
                                  uni.name,
                                  uni.code,
                                  uni.adminWallet
                                )
                                toast.loading(`Registering ${uni.name}...`)
                                await tx.wait()
                                toast.success(`${uni.name} registered successfully!`)
                              } catch (e: any) {
                                const errorMessage = e.reason || e.message || 'Failed to register university'
                                toast.error(errorMessage)
                                console.error('Registration error:', e)
                              } finally {
                                setRegistering(false)
                              }
                            }}
                            disabled={registering}
                            className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {NIGERIAN_UNIVERSITIES.length > 9 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Showing first 9 universities. Use the manual registration form below for others.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Registration Form */}
          {hasRegistrarRole && (
            <div className="card mb-8">
              <div className="flex items-center mb-4">
                <PlusIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Register a University</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">University Name</label>
                    <input
                      className="input-field"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Massachusetts Institute of Technology"
                      required
                      disabled={registering}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">University Code</label>
                    <input
                      className="input-field"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., MIT"
                      required
                      disabled={registering}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Admin Wallet Address</label>
                    <input
                      className="input-field"
                      value={form.adminWallet}
                      onChange={e => setForm(f => ({ ...f, adminWallet: e.target.value }))}
                      placeholder="0x..."
                      required
                      disabled={registering}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary flex items-center" 
                  disabled={registering}
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Register University
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Universities List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Registered Universities</h2>
              <div className="text-sm text-gray-600">
                {universities.length} university{universities.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>
            
            {loading ? (
              <div className="card text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading universities...</p>
              </div>
            ) : error ? (
              <div className="card text-center">
                <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : universities.length === 0 ? (
              <div className="card text-center">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No universities registered yet.</p>
                {!hasRegistrarRole && (
                  <p className="text-sm text-gray-400 mt-2">Contact an administrator to register universities.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {universities.map(university => {
                  const isSelected = selectedUniversity?.code === university.code
                  const isUserAdmin = university.adminWallet.toLowerCase() === address?.toLowerCase()
                  
                  return (
                    <div key={university.code} className={`card ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{university.name}</h3>
                          <p className="text-sm text-gray-600 font-mono">{university.code}</p>
                          {isSelected && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {university.isActive ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          )}
                          {isUserAdmin && (
                            <ShieldCheckIcon className="h-4 w-4 text-green-600" title="You are the admin" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Admin:</span>
                          <span className="font-mono ml-1">{university.adminWallet.slice(0, 6)}...{university.adminWallet.slice(-4)}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Registered:</span>
                          <span className="ml-1">{new Date(university.registrationDate * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        {hasRegistrarRole && (
                          <button
                            onClick={() => toggleUniversityStatus(university.code, university.isActive)}
                            className={`text-sm px-3 py-1 rounded ${
                              university.isActive 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {university.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        
                        {isUserAdmin && (
                          <div className="flex items-center space-x-2">
                            <Link href="/elections" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                              <ChartBarIcon className="h-4 w-4 mr-1" />
                              Manage Elections
                            </Link>
                            <Link href="/candidates" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1" />
                              Manage Candidates
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
} 