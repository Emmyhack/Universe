'use client'

import Navigation from '@/components/layout/Navigation'
import { useElectionFactory, useUniversityRegistry } from '@/components/contracts/hooks'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useUniversity } from '@/components/providers/UniversityProvider'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Election {
  address: string
  title: string
  universityCode: string
  startTime: number
  endTime: number
  isActive: boolean
  status: 'active' | 'pending' | 'ended'
}

interface University {
  code: string
  name: string
}

export default function ElectionsPage() {
  const electionFactory = useElectionFactory()
  const universityRegistry = useUniversityRegistry()
  const { address, isConnected } = useWeb3()
  const { selectedUniversity, isUniversityAdmin } = useUniversity()
  const [elections, setElections] = useState<Election[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasElectionOfficerRole, setHasElectionOfficerRole] = useState(false)

  // Form state
  const [form, setForm] = useState({
    universityCode: '',
    title: '',
    startTime: '',
    endTime: '',
  })
  const [proposing, setProposing] = useState(false)

  // Check if user has election officer role
  useEffect(() => {
    if (!electionFactory || !address) return
    async function checkRole() {
      try {
        const ELECTION_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ELECTION_OFFICER_ROLE"))
        const hasRole = await electionFactory!.hasRole(ELECTION_OFFICER_ROLE, address)
        setHasElectionOfficerRole(hasRole)
      } catch (e) {
        console.error('Error checking role:', e)
      }
    }
    checkRole()
  }, [electionFactory, address])

  // Fetch universities for dropdown
  useEffect(() => {
    if (!universityRegistry) return
    async function fetchUniversities() {
      try {
        const filter = universityRegistry!.filters.UniversityRegistered()
        const events = await universityRegistry!.queryFilter(filter)
        const unique: Record<string, {code: string, name: string}> = {}
        for (const ev of events) {
          const { code, name } = (ev as any).args
          try {
            const info = await universityRegistry!.getUniversityInfo(code)
            if (info.isActive) {
              unique[code] = { code, name: info.name }
            }
          } catch (e) {
            // University might have been removed
          }
        }
        setUniversities(Object.values(unique))
      } catch (e) {
        console.error('Error fetching universities:', e)
      }
    }
    fetchUniversities()
  }, [universityRegistry])

  // Fetch elections
  useEffect(() => {
    if (!electionFactory) return
    setLoading(true)
    setError(null)
    async function fetchElections() {
      try {
        // Get all ElectionApproved events
        const filter = electionFactory!.filters.ElectionApproved()
        const events = await electionFactory!.queryFilter(filter)
        
        const electionList: Election[] = []
        const now = Math.floor(Date.now() / 1000)
        
        for (const ev of events) {
          const { universityCode, electionAddress } = (ev as any).args
          
          // Filter by selected university if one is selected
          if (selectedUniversity && universityCode !== selectedUniversity.code) {
            continue
          }
          
          // For now, use placeholder times since we don't have them in the event
          const startTime = now + 86400 // 24 hours from now
          const endTime = now + 604800 // 7 days from now
          
          electionList.push({
            address: electionAddress,
            title: `Election for ${universityCode}`,
            universityCode,
            startTime,
            endTime,
            isActive: now >= startTime && now <= endTime,
            status: now < startTime ? 'pending' : now > endTime ? 'ended' : 'active'
          })
        }
        
        setElections(electionList.sort((a, b) => b.startTime - a.startTime))
      } catch (e: any) {
        setError('Failed to fetch elections: ' + e.message)
        console.error('Error fetching elections:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchElections()
  }, [electionFactory, selectedUniversity, proposing])

  // Propose election
  async function handlePropose(e: React.FormEvent) {
    e.preventDefault()
    if (!electionFactory || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!hasElectionOfficerRole) {
      toast.error('You do not have permission to propose elections')
      return
    }

    if (!selectedUniversity && !form.universityCode) {
      toast.error('Please select a university')
      return
    }

    const universityCode = selectedUniversity?.code || form.universityCode
    const startTime = Math.floor(new Date(form.startTime).getTime() / 1000)
    const endTime = Math.floor(new Date(form.endTime).getTime() / 1000)

    if (startTime >= endTime) {
      toast.error('End time must be after start time')
      return
    }

    setProposing(true)
    try {
      // For now, use placeholder values for required parameters
      const eligibilityRoot = ethers.keccak256(ethers.toUtf8Bytes("placeholder_root"))
      const verificationMerkleAddress = "0x0000000000000000000000000000000000000000" // Placeholder
      const candidateRegistryAddress = "0x0000000000000000000000000000000000000000" // Placeholder
      const zkVerifierAddress = "0x0000000000000000000000000000000000000000" // Placeholder

      const tx = await electionFactory.createElection(
        universityCode,
        form.title,
        startTime,
        endTime,
        eligibilityRoot,
        verificationMerkleAddress,
        candidateRegistryAddress,
        zkVerifierAddress
      )
      toast.loading('Proposing election...')
      await tx.wait()
      toast.success('Election proposed successfully!')
      setForm({ universityCode: '', title: '', startTime: '', endTime: '' })
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to propose election'
      toast.error(errorMessage)
      console.error('Proposal error:', e)
    } finally {
      setProposing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'ended':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'pending':
        return 'Pending'
      case 'ended':
        return 'Ended'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Elections</h1>
            <div className="text-sm text-gray-600">
              {isConnected ? (
                hasElectionOfficerRole ? (
                  <span className="text-green-600">✓ Election Officer Role</span>
                ) : (
                  <span className="text-red-600">✗ No Election Officer Role</span>
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
                        <span className="text-sm text-green-600 font-medium">✓ University Administrator</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Showing elections for {selectedUniversity.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Propose Election Form */}
          {hasElectionOfficerRole && (
            <div className="card mb-8">
              <div className="flex items-center mb-4">
                <PlusIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Propose a New Election</h2>
              </div>
              <form onSubmit={handlePropose} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!selectedUniversity && (
                    <div>
                      <label className="block text-sm font-medium mb-1">University</label>
                      <select
                        className="input-field"
                        value={form.universityCode}
                        onChange={e => setForm(f => ({ ...f, universityCode: e.target.value }))}
                        required
                        disabled={proposing}
                      >
                        <option value="">Select University</option>
                        {universities.map(uni => (
                          <option key={uni.code} value={uni.code}>{uni.name} ({uni.code})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Election Title</label>
                    <input
                      className="input-field"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g., Student Council Election 2024"
                      required
                      disabled={proposing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={form.startTime}
                      onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                      required
                      disabled={proposing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={form.endTime}
                      onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                      required
                      disabled={proposing}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary flex items-center" 
                  disabled={proposing}
                >
                  {proposing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Proposing...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Propose Election
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Elections List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {selectedUniversity ? `${selectedUniversity.name} Elections` : 'All Elections'}
              </h2>
              <div className="text-sm text-gray-600">
                {elections.length} election{elections.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {loading ? (
              <div className="card text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading elections...</p>
              </div>
            ) : error ? (
              <div className="card text-center">
                <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : elections.length === 0 ? (
              <div className="card text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedUniversity 
                    ? `No elections found for ${selectedUniversity.name}.`
                    : 'No elections found.'
                  }
                </p>
                {hasElectionOfficerRole && (
                  <p className="text-sm text-gray-400 mt-2">Propose an election to get started.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {elections.map((election, index) => (
                  <div key={index} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                        <p className="text-sm text-gray-600">{election.universityCode}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(election.startTime * 1000).toLocaleDateString()} - {new Date(election.endTime * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {getStatusIcon(election.status)}
                        <span className="ml-1 text-sm text-gray-600">
                          {getStatusText(election.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link 
                        href={`/elections/${election.address}`}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
} 