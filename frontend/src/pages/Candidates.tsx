import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Users, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle,
  User,
  Shield,
  Eye,
  GraduationCap,
  Award,
  Mail
} from 'lucide-react';
import { Candidate, UserRole, CandidateWithProfile } from '@/types';
import { fetchMultipleCandidateProfiles, getPlaceholderProfile } from '@/utils/ipfs';
import { CandidateListSkeleton } from '@/components/SkeletonLoader';
import { FormError } from '@/components/FormInput';
import toast from 'react-hot-toast';

const Candidates = () => {
  const { state } = useWeb3();
  const [candidates, setCandidates] = useState<CandidateWithProfile[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({ address: '', ipfsHash: '' });
  const [registerError, setRegisterError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ address: '', ipfsHash: '', index: -1 });
  const [editError, setEditError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyIndex, setVerifyIndex] = useState(-1);
  const [viewCandidate, setViewCandidate] = useState<CandidateWithProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.isConnected) {
      loadCandidates();
    }
  }, [state.isConnected]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      const candidatesData: CandidateWithProfile[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          ipfsHash: 'QmCandidate1InfoHash',
          isVerified: true,
          registrationTimestamp: Date.now() - 86400000,
          profileLoaded: false
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          ipfsHash: 'QmCandidate2InfoHash',
          isVerified: false,
          registrationTimestamp: Date.now() - 172800000,
          profileLoaded: false
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          ipfsHash: 'QmCandidate3InfoHash',
          isVerified: true,
          registrationTimestamp: Date.now() - 259200000,
          profileLoaded: false
        },
      ];
      
      setCandidates(candidatesData);
      setUserRole(UserRole.CANDIDATE_MANAGER);
      
      // Load candidate profiles
      await loadCandidateProfiles(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setError('Failed to load candidates. Please try refreshing the page.');
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateProfiles = async (candidatesData: CandidateWithProfile[]) => {
    try {
      setProfilesLoading(true);
      
      // Fetch profiles from IPFS
      const ipfsHashes = candidatesData.map(c => c.ipfsHash);
      const profiles = await fetchMultipleCandidateProfiles(ipfsHashes);
      
      // Update candidates with loaded profiles
      const updatedCandidates = candidatesData.map(candidate => ({
        ...candidate,
        profile: profiles[candidate.ipfsHash] || getPlaceholderProfile(candidate.address),
        profileLoaded: true,
        profileError: profiles[candidate.ipfsHash] ? undefined : 'Failed to load profile'
      }));
      
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error loading candidate profiles:', error);
    } finally {
      setProfilesLoading(false);
    }
  };

  const canRegisterCandidate = () => {
    return userRole === UserRole.CANDIDATE_MANAGER || userRole === UserRole.DEFAULT_ADMIN;
  };

  const canVerifyCandidate = () => {
    return userRole === UserRole.CANDIDATE_MANAGER || userRole === UserRole.DEFAULT_ADMIN;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredCandidates = candidates.filter(candidate => {
    switch (filter) {
      case 'verified':
        return candidate.isVerified;
      case 'unverified':
        return !candidate.isVerified;
      default:
        return true;
    }
  });

  // Registration handler
  const handleRegisterCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerForm.address || !registerForm.ipfsHash) {
      setRegisterError('All fields are required.');
      return;
    }
    setCandidates([
      ...candidates,
      {
        address: registerForm.address,
        ipfsHash: registerForm.ipfsHash,
        isVerified: false,
        registrationTimestamp: Date.now(),
      },
    ]);
    setShowRegisterModal(false);
    setRegisterForm({ address: '', ipfsHash: '' });
  };

  // View handler
  const openViewModal = (candidate: CandidateWithProfile) => {
    setViewCandidate(candidate);
    setShowViewModal(true);
  };
  // Edit handler
  const openEditModal = (candidate: Candidate, index: number) => {
    setEditForm({ address: candidate.address, ipfsHash: candidate.ipfsHash, index });
    setEditError('');
    setShowEditModal(true);
  };
  const handleEditCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.address || !editForm.ipfsHash) {
      setEditError('All fields are required.');
      return;
    }
    const updated = [...candidates];
    updated[editForm.index] = {
      ...updated[editForm.index],
      address: editForm.address,
      ipfsHash: editForm.ipfsHash,
    };
    setCandidates(updated);
    setShowEditModal(false);
  };
  // Verify handler
  const openVerifyModal = (index: number) => {
    setVerifyIndex(index);
    setShowVerifyModal(true);
  };
  const handleVerifyCandidate = () => {
    const updated = [...candidates];
    updated[verifyIndex] = {
      ...updated[verifyIndex],
      isVerified: true,
    };
    setCandidates(updated);
    setShowVerifyModal(false);
  };

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Users className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect to View Candidates</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please connect your wallet to view and manage candidates.
        </p>
      </div>
    );
  }

  if (loading) {
    return <CandidateListSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FormError
          title="Failed to Load Candidates"
          message={error}
        />
        <div className="text-center">
          <button
            onClick={() => {
              setError(null);
              loadCandidates();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">
            Manage candidate registrations and verifications
          </p>
        </div>
        {canRegisterCandidate() && (
          <button
            className="btn-primary inline-flex items-center space-x-2"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Register Candidate</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Candidates' },
          { key: 'verified', label: 'Verified' },
          { key: 'unverified', label: 'Unverified' },
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === filterOption.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No candidates have been registered yet.'
                : `No ${filter} candidates found.`
              }
            </p>
            {canRegisterCandidate() && (
              <button
                className="btn-primary inline-flex items-center space-x-2"
                onClick={() => setShowRegisterModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Register First Candidate</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCandidates.map((candidate, index) => (
              <div key={index} className="card">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Candidate Photo */}
                      <div className="flex-shrink-0">
                        {candidate.profile?.photo ? (
                          <img
                            src={candidate.profile.photo}
                            alt={candidate.profile.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {candidate.profile?.name || formatAddress(candidate.address)}
                          </h3>
                          {candidate.isVerified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {candidate.profile?.university && (
                            <div className="flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3" />
                              <span className="truncate">{candidate.profile?.university}</span>
                            </div>
                          )}
                          {candidate.profile?.experience && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-3 h-3" />
                              <span className="truncate">{candidate.profile?.experience}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="font-mono text-xs">{formatAddress(candidate.address)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!candidate.isVerified && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center space-x-1 ml-2">
                        <XCircle className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Platform Preview */}
                  {candidate.profile?.platform && candidate.profile.platform.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Platform Highlights:</h4>
                      <div className="flex flex-wrap gap-1">
                        {candidate.profile?.platform?.slice(0, 2).map((point: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {point.length > 30 ? `${point.substring(0, 30)}...` : point}
                          </span>
                        ))}
                        {candidate.profile?.platform && candidate.profile.platform.length > 2 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{candidate.profile.platform.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manifesto Preview */}
                  {candidate.profile?.manifesto && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Manifesto:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {candidate.profile?.manifesto}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>IPFS Hash:</span>
                      <span className="font-mono">{candidate.ipfsHash}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Registration Date:</span>
                      <span>{new Date(candidate.registrationTimestamp).toLocaleDateString()}</span>
                    </div>
                    {profilesLoading && !candidate.profileLoaded && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                        <span>Loading profile...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1" onClick={() => openViewModal(candidate)}>
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {canVerifyCandidate() && (
                        <>
                          <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1" onClick={() => openEditModal(candidate, index)}>
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          {!candidate.isVerified && (
                            <button className="btn-primary text-sm px-3 py-1 inline-flex items-center space-x-1" onClick={() => openVerifyModal(index)}>
                              <CheckCircle className="w-4 h-4" />
                              <span>Verify</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {candidates.length}
          </h3>
          <p className="text-gray-600">Total Candidates</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {candidates.filter(c => c.isVerified).length}
          </h3>
          <p className="text-gray-600">Verified Candidates</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {candidates.filter(c => !c.isVerified).length}
          </h3>
          <p className="text-gray-600">Pending Verification</p>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowRegisterModal(false)}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-2xl font-bold mb-4">Register Candidate</h2>
            <form onSubmit={handleRegisterCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" className="input font-mono" value={registerForm.address} onChange={e => setRegisterForm(f => ({ ...f, address: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IPFS Hash</label>
                <input type="text" className="input font-mono" value={registerForm.ipfsHash} onChange={e => setRegisterForm(f => ({ ...f, ipfsHash: e.target.value }))} required />
              </div>
              {registerError && <div className="text-red-600 text-sm">{registerError}</div>}
              <button type="submit" className="btn-primary w-full">Register</button>
            </form>
          </div>
        </div>
      )}
      {showViewModal && viewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Candidate Profile</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {viewCandidate.profile?.photo ? (
                    <img
                      src={viewCandidate.profile.photo}
                      alt={viewCandidate.profile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {viewCandidate.profile?.name || 'Unknown Candidate'}
                    </h3>
                    {viewCandidate.isVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified Candidate
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {viewCandidate.profile?.university && (
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{viewCandidate.profile.university}</span>
                      </div>
                    )}
                    {viewCandidate.profile?.contact && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{viewCandidate.profile.contact}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-mono text-xs">{formatAddress(viewCandidate.address)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              {viewCandidate.profile?.manifesto && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Campaign Manifesto</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {viewCandidate.profile.manifesto}
                  </p>
                </div>
              )}

              {/* Platform */}
              {viewCandidate.profile?.platform && viewCandidate.profile.platform.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Platform & Policies</h4>
                  <div className="grid grid-cols-1 gap-2">
                                           {viewCandidate.profile.platform.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {viewCandidate.profile?.experience && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{viewCandidate.profile.experience}</span>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {viewCandidate.profile?.achievements && viewCandidate.profile.achievements.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h4>
                  <div className="grid grid-cols-1 gap-2">
                                         {viewCandidate.profile.achievements.map((achievement: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h4>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-mono">{viewCandidate.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IPFS Hash:</span>
                    <span className="font-mono">{viewCandidate.ipfsHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span>{viewCandidate.isVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Date:</span>
                    <span>{new Date(viewCandidate.registrationTimestamp).toLocaleDateString()}</span>
                  </div>
                  {viewCandidate.profile?.studentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-mono">{viewCandidate.profile.studentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowEditModal(false)}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Candidate</h2>
            <form onSubmit={handleEditCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" className="input font-mono" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IPFS Hash</label>
                <input type="text" className="input font-mono" value={editForm.ipfsHash} onChange={e => setEditForm(f => ({ ...f, ipfsHash: e.target.value }))} required />
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <button type="submit" className="btn-primary w-full">Save Changes</button>
            </form>
          </div>
        </div>
      )}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowVerifyModal(false)}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-2xl font-bold mb-4">Verify Candidate</h2>
            <div className="mb-4">Are you sure you want to verify this candidate?</div>
            <button className="btn-primary w-full" onClick={handleVerifyCandidate}>Verify</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;