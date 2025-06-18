'use client'

import Navigation from '@/components/layout/Navigation'
import { useUniversity } from '@/components/providers/UniversityProvider'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useUniversityRegistry } from '@/components/contracts/hooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { 
  AcademicCapIcon, 
  UserIcon, 
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface StudentRegistration {
  studentId: string
  fullName: string
  email: string
  department: string
  graduationYear: string
  walletAddress: string
}

export default function UniversityAuthPage() {
  const { selectedUniversity, isUniversityAdmin } = useUniversity()
  const { address, isConnected } = useWeb3()
  const universityRegistry = useUniversityRegistry()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStudentVerified, setIsStudentVerified] = useState(false)
  const [studentInfo, setStudentInfo] = useState<StudentRegistration | null>(null)

  // Form state for student registration
  const [form, setForm] = useState<StudentRegistration>({
    studentId: '',
    fullName: '',
    email: '',
    department: '',
    graduationYear: '',
    walletAddress: ''
  })
  const [registering, setRegistering] = useState(false)

  // Check if student is verified
  useEffect(() => {
    if (!selectedUniversity || !address) {
      setIsStudentVerified(false)
      setStudentInfo(null)
      return
    }

    // For now, we'll simulate checking if the student is verified
    // In a real implementation, this would check against the VerificationMerkle contract
    const checkStudentVerification = async () => {
      setLoading(true)
      try {
        // Simulate API call to check student verification
        // This would typically involve checking the Merkle tree
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // For demo purposes, assume students with addresses ending in even numbers are verified
        const isVerified = parseInt(address.slice(-1), 16) % 2 === 0
        setIsStudentVerified(isVerified)
        
        if (isVerified) {
          setStudentInfo({
            studentId: 'STU' + address.slice(-6),
            fullName: 'Demo Student',
            email: 'demo.student@university.edu',
            department: 'Computer Science',
            graduationYear: '2025',
            walletAddress: address
          })
        }
      } catch (e) {
        console.error('Error checking student verification:', e)
        setIsStudentVerified(false)
      } finally {
        setLoading(false)
      }
    }

    checkStudentVerification()
  }, [selectedUniversity, address])

  // Handle student registration
  const handleStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUniversity || !isConnected) {
      toast.error('Please connect your wallet and select a university')
      return
    }

    if (!isUniversityAdmin) {
      toast.error('Only university administrators can register students')
      return
    }

    setRegistering(true)
    try {
      // In a real implementation, this would:
      // 1. Validate the student information
      // 2. Add the student to the university's database
      // 3. Update the Merkle tree with the new student
      // 4. Update the VerificationMerkle contract

      // Simulate the registration process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Student registered successfully!')
      setForm({
        studentId: '',
        fullName: '',
        email: '',
        department: '',
        graduationYear: '',
        walletAddress: ''
      })
    } catch (e: any) {
      const errorMessage = e.message || 'Failed to register student'
      toast.error(errorMessage)
      console.error('Registration error:', e)
    } finally {
      setRegistering(false)
    }
  }

  // Handle student verification request
  const handleVerificationRequest = async () => {
    if (!selectedUniversity || !address) {
      toast.error('Please connect your wallet and select a university')
      return
    }

    setLoading(true)
    try {
      // In a real implementation, this would:
      // 1. Submit a verification request to the university
      // 2. The university admin would review and approve
      // 3. The student would be added to the Merkle tree
      // 4. The student would receive verification status

      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Verification request submitted! Please wait for university approval.')
    } catch (e: any) {
      const errorMessage = e.message || 'Failed to submit verification request'
      toast.error(errorMessage)
      console.error('Verification request error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="lg:pl-64">
          <main className="py-10 px-4 max-w-4xl mx-auto">
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">University Authentication</h1>
              <p className="text-gray-600">Please connect your wallet to access university authentication.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!selectedUniversity) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="lg:pl-64">
          <main className="py-10 px-4 max-w-4xl mx-auto">
            <div className="text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">University Authentication</h1>
              <p className="text-gray-600">Please select a university to access authentication features.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">University Authentication</h1>
            <p className="text-gray-600">
              Manage student verification and authentication for {selectedUniversity.name}
            </p>
          </div>

          {/* Selected University Info */}
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
                <p className="text-sm text-gray-600">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Verification Status */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Verification Status</h2>
              
              {loading ? (
                <div className="card text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Checking verification status...</p>
                </div>
              ) : isStudentVerified ? (
                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Verified Student</h3>
                      <p className="text-sm text-green-700">You are verified and can participate in elections</p>
                    </div>
                  </div>
                  
                  {studentInfo && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student ID:</span>
                          <span className="font-medium">{studentInfo.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{studentInfo.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{studentInfo.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Graduation Year:</span>
                          <span className="font-medium">{studentInfo.graduationYear}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card bg-yellow-50 border-yellow-200">
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900">Not Verified</h3>
                      <p className="text-sm text-yellow-700">You need to be verified to participate in elections</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleVerificationRequest}
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Request...
                      </>
                    ) : (
                      'Request Verification'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Student Registration (Admin Only) */}
            {isUniversityAdmin && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Register New Student</h2>
                <div className="card">
                  <form onSubmit={handleStudentRegistration} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student ID</label>
                      <input
                        className="input-field"
                        value={form.studentId}
                        onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                        placeholder="e.g., 2024001"
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        className="input-field"
                        value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="e.g., John Doe"
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="e.g., john.doe@university.edu"
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Department</label>
                      <input
                        className="input-field"
                        value={form.department}
                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        placeholder="e.g., Computer Science"
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Graduation Year</label>
                      <input
                        className="input-field"
                        value={form.graduationYear}
                        onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))}
                        placeholder="e.g., 2025"
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Wallet Address</label>
                      <input
                        className="input-field"
                        value={form.walletAddress}
                        onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                        placeholder="0x..."
                        required
                        disabled={registering}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn-primary w-full" 
                      disabled={registering}
                    >
                      {registering ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registering Student...
                        </>
                      ) : (
                        'Register Student'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <IdentificationIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Student Registration</h3>
                  <p className="text-sm text-gray-600">
                    University administrators register students with their wallet addresses
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">2. Verification</h3>
                  <p className="text-sm text-gray-600">
                    Students are verified through Merkle tree proofs for privacy
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">3. Voting</h3>
                  <p className="text-sm text-gray-600">
                    Verified students can participate in university elections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 