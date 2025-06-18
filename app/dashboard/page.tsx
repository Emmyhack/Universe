'use client'

import Navigation from '@/components/layout/Navigation'
import { useElectionFactory, useUniversityRegistry, useCandidateRegistry } from '@/components/contracts/hooks'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  totalUniversities: number
  totalElections: number
  totalCandidates: number
  activeElections: number
  pendingElections: number
  userRole: string
}

interface RecentElection {
  address: string
  title: string
  universityCode: string
  startTime: number
  endTime: number
  isActive: boolean
  status: 'active' | 'pending' | 'ended'
}

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
  bgColor: string
  requiresConnection: boolean
  requiresRole?: string
}

async function connectKaiOrMetaMask() {
  if (typeof window === 'undefined') return
  // Prefer KaiWallet
  if (typeof window.kaiwallet !== 'undefined') {
    try {
      await window.kaiwallet.request({ method: 'eth_requestAccounts' })
      alert('Connected to KaiWallet!')
      return
    } catch (err) {
      alert('KaiWallet connection failed: ' + (err.message || err))
      return
    }
  }
  // Fallback to MetaMask
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      alert('Connected to MetaMask!')
      return
    } catch (err) {
      alert('MetaMask connection failed: ' + (err.message || err))
      return
    }
  }
  alert('No KaiWallet or MetaMask detected. Please install a wallet extension.')
}

export default function DashboardPage() {
  const electionFactory = useElectionFactory()
  const universityRegistry = useUniversityRegistry()
  const candidateRegistry = useCandidateRegistry()
  const { address, isConnected, connect, networkName, balance, isCorrectChain, setShowWalletModal } = useWeb3()
  const [stats, setStats] = useState<DashboardStats>({
    totalUniversities: 0,
    totalElections: 0,
    totalCandidates: 0,
    activeElections: 0,
    pendingElections: 0,
    userRole: 'None'
  })
  const [recentElections, setRecentElections] = useState<RecentElection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])

  // Fetch dashboard data
  useEffect(() => {
    if (!electionFactory || !universityRegistry || !candidateRegistry) {
      setLoading(false)
      setError('Contracts not loaded. Please ensure you are connected to the correct network and contracts are deployed.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    async function fetchDashboardData() {
      try {
        // Fetch universities
        let activeUniversities = 0
        try {
          const universityFilter = universityRegistry!.filters.UniversityRegistered()
          const universityEvents = await universityRegistry!.queryFilter(universityFilter)
          activeUniversities = universityEvents.length
        } catch (e) {
          console.warn('Could not fetch universities:', e)
        }

        // Fetch elections
        const proposalFilter = electionFactory!.filters.ElectionProposalSubmitted()
        const approvalFilter = electionFactory!.filters.ElectionApproved()
        
        let proposalEvents: any[] = []
        let approvalEvents: any[] = []
        
        try {
          [proposalEvents, approvalEvents] = await Promise.all([
            electionFactory!.queryFilter(proposalFilter),
            electionFactory!.queryFilter(approvalFilter)
          ])
        } catch (e) {
          console.warn('Could not fetch election events:', e)
        }

        const totalProposals = proposalEvents.length
        const totalApproved = approvalEvents.length

        const pendingElections = totalProposals - totalApproved

        // Fetch candidates
        let totalCandidates = 0
        try {
          const candidateFilter = candidateRegistry!.filters.CandidateRegistered()
          const candidateEvents = await candidateRegistry!.queryFilter(candidateFilter)
          totalCandidates = candidateEvents.length
        } catch (e) {
          console.warn('Could not fetch candidates:', e)
        }

        // Check user roles
        const roles: string[] = []
        if (address) {
          try {
            const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"))
            const ELECTION_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ELECTION_OFFICER_ROLE"))
            const DAO_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DAO_ROLE"))
            const CANDIDATE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CANDIDATE_MANAGER_ROLE"))
            const CANDIDATE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CANDIDATE_ROLE"))

            const [hasRegistrar, hasOfficer, hasDao, hasManager, hasCandidate] = await Promise.all([
              universityRegistry!.hasRole(REGISTRAR_ROLE, address).catch(() => false),
              electionFactory!.hasRole(ELECTION_OFFICER_ROLE, address).catch(() => false),
              electionFactory!.hasRole(DAO_ROLE, address).catch(() => false),
              candidateRegistry!.hasRole(CANDIDATE_MANAGER_ROLE, address).catch(() => false),
              candidateRegistry!.hasRole(CANDIDATE_ROLE, address).catch(() => false)
            ])

            if (hasRegistrar) roles.push('Registrar')
            if (hasOfficer) roles.push('Election Officer')
            if (hasDao) roles.push('DAO')
            if (hasManager) roles.push('Candidate Manager')
            if (hasCandidate) roles.push('Candidate')
          } catch (e) {
            console.warn('Could not check user roles:', e)
          }
        }

        // Process recent elections
        const recent: RecentElection[] = []
        try {
          const approvalFilter = electionFactory!.filters.ElectionApproved()
          const approvalEvents = await electionFactory!.queryFilter(approvalFilter)
          
          for (const ev of approvalEvents.slice(-5)) { // Last 5 elections
            const eventLog = ev as ethers.EventLog
            const { universityCode, electionAddress } = eventLog.args
            const now = Math.floor(Date.now() / 1000)
            const startTime = now + 86400 // 24 hours from now
            const endTime = now + 604800 // 7 days from now
            
            recent.push({
              address: electionAddress,
              title: `Election for ${universityCode}`,
              universityCode,
              startTime,
              endTime,
              isActive: now >= startTime && now <= endTime,
              status: now < startTime ? 'pending' : now > endTime ? 'ended' : 'active'
            })
          }
        } catch (e) {
          console.warn('Could not fetch recent elections:', e)
        }

        setStats({
          totalUniversities: activeUniversities,
          totalElections: totalApproved,
          totalCandidates,
          activeElections: totalApproved,
          pendingElections,
          userRole: roles.length > 0 ? roles.join(', ') : 'None'
        })
        setUserRoles(roles)
        setRecentElections(recent.reverse())
      } catch (e: any) {
        console.error('Dashboard data error:', e)
        setError('Failed to load dashboard data. Please check your network connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [electionFactory, universityRegistry, candidateRegistry, address])

  const statCards = [
    {
      title: 'Universities',
      value: stats.totalUniversities,
      icon: AcademicCapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/universities'
    },
    {
      title: 'Active Elections',
      value: stats.activeElections,
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/elections'
    },
    {
      title: 'Pending Elections',
      value: stats.pendingElections,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/elections'
    },
    {
      title: 'Candidates',
      value: stats.totalCandidates,
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/candidates'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: 'Register University',
      description: 'Add a new university to the system',
      icon: AcademicCapIcon,
      href: '/universities',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      requiresConnection: true,
      requiresRole: 'Registrar'
    },
    {
      title: 'Propose Election',
      description: 'Create a new election proposal',
      icon: ChartBarIcon,
      href: '/elections',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      requiresConnection: true,
      requiresRole: 'Election Officer'
    },
    {
      title: 'Register Candidate',
      description: 'Add a new candidate to the registry',
      icon: UserGroupIcon,
      href: '/candidates',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      requiresConnection: true,
      requiresRole: 'Candidate Manager'
    },
    {
      title: 'View Settings',
      description: 'Manage system configuration',
      icon: EyeIcon,
      href: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      requiresConnection: false
    }
  ]

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

  const filteredQuickActions = quickActions.filter(action => {
    if (!action.requiresConnection) return true
    if (!isConnected) return false
    if (!action.requiresRole) return true
    return userRoles.includes(action.requiresRole)
  })

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome to Universe - Decentralized University Voting System
                </p>
              </div>
              {!isConnected && (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            
            {/* Connection Status */}
            {isConnected && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Connected</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Balance: {balance ? `${parseFloat(balance).toFixed(4)} KAI` : 'Loading...'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{networkName}</span>
                    {!isCorrectChain && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                {userRoles.length > 0 && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Roles:</span>
                    <div className="flex space-x-2">
                      {userRoles.map((role, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              {error.includes('Contracts not loaded') && (
                <div className="max-w-md mx-auto text-left bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">To get started:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Connect your wallet to KaiChain or localhost</li>
                    <li>• Ensure the smart contracts are deployed</li>
                    <li>• Check that you're on the correct network</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <Link key={index} href={stat.href} className="group">
                    <div className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-105 transition-transform`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-4">
                    {filteredQuickActions.map((action, index) => (
                      <Link key={index} href={action.href} className="group">
                        <div className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-105 transition-transform`}>
                              <action.icon className={`h-5 w-5 ${action.color}`} />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {filteredQuickActions.length === 0 && (
                      <div className="card text-center py-8">
                        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No actions available</p>
                        <p className="text-sm text-gray-400">
                          {!isConnected 
                            ? 'Connect your wallet to see available actions'
                            : 'You need specific roles to perform actions'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Elections */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Elections</h2>
                    <Link href="/elections" className="text-sm text-primary-600 hover:text-primary-700">
                      View All
                    </Link>
                  </div>
                  
                  {recentElections.length === 0 ? (
                    <div className="card text-center py-8">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No elections yet.</p>
                      <Link href="/elections" className="btn-primary mt-4 inline-flex items-center">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Propose Election
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentElections.map((election, index) => (
                        <div key={index} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900">{election.title}</h3>
                              <p className="text-xs text-gray-600">{election.universityCode}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>
                                  {new Date(election.startTime * 1000).toLocaleDateString()} - {new Date(election.endTime * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              {getStatusIcon(election.status)}
                              <span className="ml-1 text-xs text-gray-600">
                                {getStatusText(election.status)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Link 
                              href={`/elections/${election.address}`}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
                <div className="card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                      <p className="text-sm font-medium text-gray-900">Smart Contracts</p>
                      <p className="text-xs text-gray-600">All contracts deployed and operational</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                      <p className="text-sm font-medium text-gray-900">Blockchain Network</p>
                      <p className="text-xs text-gray-600">Connected and synced</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                      <p className="text-sm font-medium text-gray-900">Frontend</p>
                      <p className="text-xs text-gray-600">All systems operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
} 