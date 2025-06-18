"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useElection } from "@/components/contracts/hooks";
import { useWeb3 } from "@/components/providers/Web3Provider";
import toast from "react-hot-toast";
import { ZKProofGenerator, VoteData } from "@/components/zk/ProofGenerator";
import { ethers } from "ethers";
import { groth16 } from "snarkjs";
import Navigation from '@/components/layout/Navigation'
import Link from 'next/link'
import { 
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Placeholder: In production, fetch from contract or IPFS
const CANDIDATES = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

// Placeholder: In production, fetch from contract or backend
const ELIGIBLE_VOTERS = [
  "0x123...", // Replace with real addresses
];

interface ElectionDetails {
  address: string
  title: string
  universityCode: string
  startTime: number
  endTime: number
  isActive: boolean
  status: 'active' | 'pending' | 'ended'
  totalVotes: number
  candidates: string[]
}

export default function ElectionDetailsPage() {
  const params = useParams()
  const electionAddress = params.address as string
  const { address, isConnected, connect } = useWeb3()
  const [election, setElection] = useState<ElectionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ZK files
  const [wasm, setWasm] = useState<ArrayBuffer | null>(null);
  const [zkey, setZkey] = useState<ArrayBuffer | null>(null);

  // Load circuit files
  useEffect(() => {
    async function loadZKFiles() {
      try {
        const wasmResp = await fetch("/zk/vote_verification.wasm");
        const zkeyResp = await fetch("/zk/vote_verification.zkey");
        setWasm(await wasmResp.arrayBuffer());
        setZkey(await zkeyResp.arrayBuffer());
      } catch (e) {
        toast.error("Failed to load ZK circuit files");
      }
    }
    loadZKFiles();
  }, []);

  useEffect(() => {
    if (!electionAddress) return
    
    setLoading(true)
    setError(null)
    
    // For now, we'll use mock data since we don't have the actual election contract ABI
    // In a real implementation, you would load the election contract and fetch real data
    const mockElection: ElectionDetails = {
      address: electionAddress,
      title: `Election for University ${electionAddress.slice(0, 8)}`,
      universityCode: 'UNI001',
      startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
      isActive: true,
      status: 'active',
      totalVotes: 0,
      candidates: [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012'
      ]
    }
    
    setTimeout(() => {
      setElection(mockElection)
      setLoading(false)
    }, 1000)
  }, [electionAddress])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'ended':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'ended':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="lg:pl-64">
          <main className="py-10 px-4 max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading election details...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="lg:pl-64">
          <main className="py-10 px-4 max-w-4xl mx-auto">
            <div className="text-center py-12">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error || 'Election not found'}</p>
              <Link href="/elections" className="btn-primary mt-4 inline-flex items-center">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Elections
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/elections" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Elections
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
                <p className="text-gray-600">Election Details and Voting Interface</p>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election.status)}`}>
                {getStatusIcon(election.status)}
                <span className="ml-1">{getStatusText(election.status)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Election Details */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Election Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University Code</label>
                    <p className="text-gray-900">{election.universityCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
                    <p className="text-sm font-mono text-gray-900 break-all">{election.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {new Date(election.startTime * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {new Date(election.endTime * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidates */}
              <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidates</h2>
                
                {election.candidates.length === 0 ? (
                  <p className="text-gray-500">No candidates registered for this election.</p>
                ) : (
                  <div className="space-y-4">
                    {election.candidates.map((candidate, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <UserGroupIcon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Candidate {index + 1}</p>
                            <p className="text-sm text-gray-600 font-mono">{candidate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Votes: 0</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voting Interface */}
              {election.status === 'active' && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cast Your Vote</h2>
                  
                  {!isConnected ? (
                    <div className="text-center py-8">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Connect your wallet to vote</p>
                      <button onClick={connect} className="btn-primary">
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Select a candidate to vote for. Your vote will be encrypted and verified using zero-knowledge proofs.
                      </p>
                      
                      {election.candidates.map((candidate, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Candidate {index + 1}</p>
                                <p className="text-sm text-gray-600 font-mono">{candidate}</p>
                              </div>
                            </div>
                            <div className="text-primary-600">
                              <span className="text-sm">Vote</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Election Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Statistics</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Votes</span>
                    <span className="font-medium">{election.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Candidates</span>
                    <span className="font-medium">{election.candidates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${getStatusColor(election.status)}`}>
                      {getStatusText(election.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Link href="/candidates" className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="text-gray-900">View All Candidates</span>
                    </div>
                  </Link>
                  
                  <Link href="/universities" className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="text-gray-900">University Info</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 