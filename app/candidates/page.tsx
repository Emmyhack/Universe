'use client'

import Navigation from '@/components/layout/Navigation'
import { useCandidateRegistry } from '@/components/contracts/hooks'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Candidate {
  candidateAddress: string
  ipfsHash: string
  isVerified: boolean
  registrationTimestamp: number
}

export default function CandidatesPage() {
  const candidateRegistry = useCandidateRegistry()
  const { address, isConnected } = useWeb3()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCandidateManagerRole, setHasCandidateManagerRole] = useState(false)
  const [hasCandidateRole, setHasCandidateRole] = useState(false)

  // Form state
  const [form, setForm] = useState({
    candidateAddress: '',
    ipfsHash: '',
  })
  const [registering, setRegistering] = useState(false)

  // Check user roles
  useEffect(() => {
    if (!candidateRegistry || !address) return
    async function checkRoles() {
      try {
        const CANDIDATE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CANDIDATE_MANAGER_ROLE"))
        const CANDIDATE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CANDIDATE_ROLE"))
        
        const [hasManagerRole, hasCandidate] = await Promise.all([
          candidateRegistry.hasRole(CANDIDATE_MANAGER_ROLE, address),
          candidateRegistry.hasRole(CANDIDATE_ROLE, address)
        ])
        
        setHasCandidateManagerRole(hasManagerRole)
        setHasCandidateRole(hasCandidate)
      } catch (e) {
        console.error('Error checking roles:', e)
      }
    }
    checkRoles()
  }, [candidateRegistry, address])

  // Fetch candidates from contract events
  useEffect(() => {
    if (!candidateRegistry) return
    setLoading(true)
    setError(null)
    async function fetchCandidates() {
      try {
        // Get all CandidateRegistered events
        const filter = candidateRegistry.filters.CandidateRegistered()
        const events = await candidateRegistry.queryFilter(filter)
        
        // Get latest info for each candidate
        const candidatesData: Candidate[] = []
        for (const ev of events) {
          const { candidateAddress, ipfsHash, registrationTimestamp } = ev.args
          try {
            const info = await candidateRegistry.getCandidateInfo(candidateAddress)
            candidatesData.push({
              candidateAddress: info.candidateAddress,
              ipfsHash: info.ipfsHash,
              isVerified: info.isVerified,
              registrationTimestamp: Number(info.registrationTimestamp),
            })
          } catch (e) {
            // Candidate might have been removed
          }
        }
        
        setCandidates(candidatesData.sort((a, b) => b.registrationTimestamp - a.registrationTimestamp))
      } catch (e: any) {
        setError('Failed to fetch candidates: ' + e.message)
        console.error('Error fetching candidates:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [candidateRegistry, registering])

  // Register candidate
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!candidateRegistry || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!hasCandidateManagerRole) {
      toast.error('You do not have permission to register candidates')
      return
    }

    setRegistering(true)
    try {
      const tx = await candidateRegistry.registerCandidate(
        form.candidateAddress,
        form.ipfsHash
      )
      toast.loading('Registering candidate...')
      await tx.wait()
      toast.success('Candidate registered successfully!')
      setForm({ candidateAddress: '', ipfsHash: '' })
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to register candidate'
      toast.error(errorMessage)
      console.error('Registration error:', e)
    } finally {
      setRegistering(false)
    }
  }

  // Update candidate verification status
  async function toggleVerification(candidateAddress: string, currentStatus: boolean) {
    if (!candidateRegistry || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!hasCandidateManagerRole) {
      toast.error('You do not have permission to verify candidates')
      return
    }

    try {
      const tx = await candidateRegistry.verifyCandidateEligibility(candidateAddress, !currentStatus)
      toast.loading('Updating verification status...')
      await tx.wait()
      toast.success(`Candidate ${!currentStatus ? 'verified' : 'unverified'} successfully!`)
      setRegistering(true) // Refresh the list
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to update verification status'
      toast.error(errorMessage)
      console.error('Verification error:', e)
    }
  }

  // Update candidate info (for candidates themselves)
  async function updateCandidateInfo(newIpfsHash: string) {
    if (!candidateRegistry || !isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!hasCandidateRole) {
      toast.error('You are not a registered candidate')
      return
    }

    try {
      const tx = await candidateRegistry.updateCandidateInfo(address, newIpfsHash)
      toast.loading('Updating candidate info...')
      await tx.wait()
      toast.success('Candidate info updated successfully!')
      setRegistering(true) // Refresh the list
    } catch (e: any) {
      const errorMessage = e.reason || e.message || 'Failed to update candidate info'
      toast.error(errorMessage)
      console.error('Update error:', e)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Candidates</h1>
            <div className="text-sm text-gray-600">
              {isConnected ? (
                <div className="flex space-x-4">
                  {hasCandidateManagerRole && <span className="text-green-600">✓ Candidate Manager</span>}
                  {hasCandidateRole && <span className="text-blue-600">✓ Registered Candidate</span>}
                  {!hasCandidateManagerRole && !hasCandidateRole && <span className="text-red-600">✗ No Permissions</span>}
                </div>
              ) : (
                <span className="text-yellow-600">Please connect wallet</span>
              )}
            </div>
          </div>

          {/* Registration Form */}
          {hasCandidateManagerRole && (
            <div className="card mb-8">
              <div className="flex items-center mb-4">
                <PlusIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Register a Candidate</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Candidate Wallet Address</label>
                    <input
                      className="input-field"
                      value={form.candidateAddress}
                      onChange={e => setForm(f => ({ ...f, candidateAddress: e.target.value }))}
                      placeholder="0x..."
                      required
                      disabled={registering}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IPFS Hash (Manifesto/Info)</label>
                    <input
                      className="input-field"
                      value={form.ipfsHash}
                      onChange={e => setForm(f => ({ ...f, ipfsHash: e.target.value }))}
                      placeholder="Qm..."
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
                      Register Candidate
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Update Own Info (for candidates) */}
          {hasCandidateRole && (
            <div className="card mb-8">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Update Your Candidate Info</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New IPFS Hash</label>
                  <input
                    className="input-field"
                    placeholder="Qm..."
                    id="updateIpfsHash"
                  />
                </div>
                <button 
                  onClick={() => {
                    const input = document.getElementById('updateIpfsHash') as HTMLInputElement
                    if (input.value) {
                      updateCandidateInfo(input.value)
                      input.value = ''
                    } else {
                      toast.error('Please enter an IPFS hash')
                    }
                  }}
                  className="btn-secondary"
                >
                  Update Info
                </button>
              </div>
            </div>
          )}

          {/* Candidates List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Registered Candidates</h2>
              <div className="text-sm text-gray-600">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {loading ? (
              <div className="card text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            ) : error ? (
              <div className="card text-center">
                <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="card text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No candidates registered yet.</p>
                {!hasCandidateManagerRole && (
                  <p className="text-sm text-gray-400 mt-2">Contact a candidate manager to register candidates.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {candidates.map(candidate => (
                  <div key={candidate.candidateAddress} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.candidateAddress.slice(0, 6)}...{candidate.candidateAddress.slice(-4)}
                        </h3>
                        <p className="text-sm text-gray-600 font-mono">{candidate.candidateAddress}</p>
                      </div>
                      <div className="flex items-center">
                        {candidate.isVerified ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">IPFS Hash:</span>
                        <span className="font-mono ml-1">{candidate.ipfsHash.slice(0, 10)}...</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Registered:</span>
                        <span className="ml-1">{new Date(candidate.registrationTimestamp * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-1 ${candidate.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {candidate.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <button className="btn-secondary text-sm px-3 py-1">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      {hasCandidateManagerRole && (
                        <button
                          onClick={() => toggleVerification(candidate.candidateAddress, candidate.isVerified)}
                          className={`text-sm px-3 py-1 rounded ${
                            candidate.isVerified 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {candidate.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      )}
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