import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Vote, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Shield,
  Lock,
  Eye,
  Search,
  Filter,
  ExternalLink,
  User,
  Award,
  Mail,
  GraduationCap
} from 'lucide-react';
import { Election, ElectionPhase, UserRole, CandidateWithProfile } from '@/types';
import { fetchMultipleCandidateProfiles, getPlaceholderProfile } from '@/utils/ipfs';
import { VotingPageSkeleton } from '@/components/SkeletonLoader';
import { FormError } from '@/components/FormInput';
import toast from 'react-hot-toast';

const Voting = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { state } = useWeb3();
  const [election, setElection] = useState<Election | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [candidatesWithProfiles, setCandidatesWithProfiles] = useState<CandidateWithProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<CandidateWithProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [votingInProgress, setVotingInProgress] = useState(false);

  useEffect(() => {
    if (state.isConnected && electionId) {
      loadElectionData();
    }
  }, [state.isConnected, electionId]);

  const loadElectionData = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      const mockElection = {
        address: electionId || '0x123...',
        config: {
          title: 'Student Union President 2024',
          startTime: Date.now() - 86400000,
          endTime: Date.now() + 604800000,
          eligibilityRoot: '0xabc...',
          isActive: true,
        },
        currentPhase: ElectionPhase.VOTING,
        candidates: [
          '0x1234567890123456789012345678901234567890',
          '0x2345678901234567890123456789012345678901',
          '0x3456789012345678901234567890123456789012',
        ],
      };
      
      setElection(mockElection);
      setUserRole(UserRole.STUDENT);
      setHasVoted(false);
      
      // Load candidate profiles
      await loadCandidateProfiles(mockElection.candidates);
    } catch (error) {
      console.error('Error loading election data:', error);
      setError('Failed to load election data. Please try refreshing the page.');
      toast.error('Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateProfiles = async (_candidateAddresses: string[]) => {
    try {
      setProfilesLoading(true);
      
      // Mock candidate data with IPFS hashes - in real app, fetch from CandidateRegistry
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
          isVerified: true,
          registrationTimestamp: Date.now() - 172800000,
          profileLoaded: false
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          ipfsHash: 'QmCandidate3InfoHash',
          isVerified: true,
          registrationTimestamp: Date.now() - 259200000,
          profileLoaded: false
        }
      ];
      
      setCandidatesWithProfiles(candidatesData);
      
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
      
      setCandidatesWithProfiles(updatedCandidates);
    } catch (error) {
      console.error('Error loading candidate profiles:', error);
      toast.error('Failed to load some candidate profiles');
    } finally {
      setProfilesLoading(false);
    }
  };

  const getPhaseStatus = (phase: ElectionPhase) => {
    switch (phase) {
      case ElectionPhase.REGISTRATION:
        return { text: 'Registration', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case ElectionPhase.VOTING:
        return { text: 'Voting', color: 'bg-green-100 text-green-800', icon: Vote };
      case ElectionPhase.TALLY:
        return { text: 'Tallying', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case ElectionPhase.RESULTS:
        return { text: 'Results', color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
      case ElectionPhase.COMPLETED:
        return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const canVote = () => {
    return election?.currentPhase === ElectionPhase.VOTING && 
           userRole === UserRole.STUDENT && 
           !hasVoted;
  };

  const handleVote = async () => {
    if (!selectedCandidate || !canVote()) return;

    try {
      setVotingInProgress(true);
      
      // In a real app, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      console.log('Casting vote for:', selectedCandidate);
      setHasVoted(true);
      toast.success('Vote cast successfully! Your vote has been recorded.');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setVotingInProgress(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredCandidates = candidatesWithProfiles.filter(candidate => {
    const matchesSearch = candidate.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.profile?.platform.some(item => 
                           item.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPlatform = platformFilter === 'all' || 
                           candidate.profile?.platform.some(item =>
                             item.toLowerCase().includes(platformFilter.toLowerCase())
                           );
    
    return matchesSearch && matchesPlatform;
  });

  const openCandidateModal = (candidate: CandidateWithProfile) => {
    setSelectedCandidateProfile(candidate);
    setShowCandidateModal(true);
  };

  const getPlatformKeywords = () => {
    const keywords = new Set<string>();
    candidatesWithProfiles.forEach(candidate => {
      candidate.profile?.platform.forEach(item => {
        const words = item.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 3) keywords.add(word);
        });
      });
    });
    return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
  };

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Vote className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect to Vote</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please connect your wallet to participate in this election.
        </p>
      </div>
    );
  }

  if (loading) {
    return <VotingPageSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FormError
          title="Failed to Load Election"
          message={error}
        />
        <div className="text-center">
          <button
            onClick={() => {
              setError(null);
              loadElectionData();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Election Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          The requested election could not be found.
        </p>
      </div>
    );
  }

  const phaseStatus = getPhaseStatus(election.currentPhase);
  const PhaseIcon = phaseStatus.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{election.config.title}</h1>
            <p className="text-gray-600">
              Cast your vote securely and anonymously
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${phaseStatus.color}`}>
            <PhaseIcon className="w-4 h-4" />
            <span>{phaseStatus.text}</span>
          </div>
        </div>

        {/* Election Info */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Election Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Start: {new Date(election.config.startTime).toLocaleDateString()}</p>
                <p>End: {new Date(election.config.endTime).toLocaleDateString()}</p>
                <p>Candidates: {election.candidates.length}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Your Status</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Role: {userRole}</p>
                <p>Vote Status: {hasVoted ? 'Voted' : 'Not Voted'}</p>
                <p>Eligibility: Eligible</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Security</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>ZK-Proof Enabled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Vote Encryption</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span>Anonymous Voting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      {election.currentPhase === ElectionPhase.VOTING && (
        <div className="space-y-6">
          {hasVoted ? (
            <div className="card text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Vote Cast Successfully</h3>
              <p className="text-gray-600">
                Your vote has been recorded securely. Thank you for participating!
              </p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Candidate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or platform..."
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="input pl-10 appearance-none"
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                    >
                      <option value="all">All Platform Issues</option>
                      {getPlatformKeywords().map(keyword => (
                        <option key={keyword} value={keyword}>
                          {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Candidate Selection */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Candidate</h2>
                
                {profilesLoading ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600">Loading candidate profiles...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCandidates.map((candidate) => (
                      <div
                        key={candidate.address}
                        className={`border-2 rounded-lg transition-all duration-200 ${
                          selectedCandidate === candidate.address
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Candidate Photo */}
                            <div className="flex-shrink-0">
                              {candidate.profile?.photo ? (
                                <img
                                  src={candidate.profile.photo}
                                  alt={candidate.profile.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-8 h-8 text-primary-600" />
                                </div>
                              )}
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {candidate.profile?.name || 'Unknown Candidate'}
                                    </h3>
                                    {candidate.isVerified && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                                    {candidate.profile?.university && (
                                      <div className="flex items-center space-x-1">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{candidate.profile.university}</span>
                                      </div>
                                    )}
                                    {candidate.profile?.experience && (
                                      <div className="flex items-center space-x-1">
                                        <Award className="w-4 h-4" />
                                        <span>{candidate.profile.experience}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Platform Preview */}
                                  <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Key Platform Points:</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {candidate.profile?.platform.slice(0, 3).map((point, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                        >
                                          {point}
                                        </span>
                                      ))}
                                      {candidate.profile && candidate.profile.platform.length > 3 && (
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                          +{candidate.profile.platform.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Manifesto Preview */}
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {candidate.profile?.manifesto || 'No manifesto available.'}
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col space-y-2 ml-4">
                                  <button
                                    onClick={() => openCandidateModal(candidate)}
                                    className="btn-secondary text-sm px-3 py-2 inline-flex items-center space-x-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>View Full Profile</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedCandidate(
                                      selectedCandidate === candidate.address ? null : candidate.address
                                    )}
                                    className={`text-sm px-3 py-2 inline-flex items-center space-x-1 ${
                                      selectedCandidate === candidate.address
                                        ? 'btn-secondary bg-primary-600 text-white border-primary-600'
                                        : 'btn-primary'
                                    }`}
                                  >
                                    <Vote className="w-4 h-4" />
                                    <span>
                                      {selectedCandidate === candidate.address ? 'Selected' : 'Select'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCandidates.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
                        <p className="text-gray-600">
                          Try adjusting your search terms or filters.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vote Button */}
                {selectedCandidate && !profilesLoading && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Security Notice</h4>
                      <p className="text-sm text-blue-800">
                        Your vote will be encrypted and processed using zero-knowledge proofs to ensure privacy and integrity.
                        Once cast, your vote cannot be changed or traced back to you.
                      </p>
                    </div>

                    <button
                      onClick={handleVote}
                      disabled={!canVote() || votingInProgress}
                      className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {votingInProgress ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Casting Vote...
                        </>
                      ) : (
                        <>
                          <Vote className="w-5 h-5 mr-2" />
                          Cast Vote for {candidatesWithProfiles.find(c => c.address === selectedCandidate)?.profile?.name || 'Selected Candidate'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {election.currentPhase === ElectionPhase.COMPLETED && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Election Results</h2>
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Election Completed</h3>
            <p className="text-gray-600">
              Results have been published and verified. Check the results page for details.
            </p>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {showCandidateModal && selectedCandidateProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Candidate Profile</h2>
              <button
                onClick={() => setShowCandidateModal(false)}
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
                  {selectedCandidateProfile.profile?.photo ? (
                    <img
                      src={selectedCandidateProfile.profile.photo}
                      alt={selectedCandidateProfile.profile.name}
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
                      {selectedCandidateProfile.profile?.name || 'Unknown Candidate'}
                    </h3>
                    {selectedCandidateProfile.isVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified Candidate
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedCandidateProfile.profile?.university && (
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{selectedCandidateProfile.profile.university}</span>
                      </div>
                    )}
                    {selectedCandidateProfile.profile?.contact && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{selectedCandidateProfile.profile.contact}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-mono text-xs">{formatAddress(selectedCandidateProfile.address)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Campaign Manifesto</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedCandidateProfile.profile?.manifesto || 'No manifesto available.'}
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Platform & Policies</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCandidateProfile.profile?.platform.map((point, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 italic">No platform information available.</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              {selectedCandidateProfile.profile?.experience && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{selectedCandidateProfile.profile.experience}</span>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {selectedCandidateProfile.profile?.achievements && selectedCandidateProfile.profile.achievements.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCandidateProfile.profile.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {selectedCandidateProfile.profile?.socialMedia && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Connect with Candidate</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidateProfile.profile.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${selectedCandidateProfile.profile.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {selectedCandidateProfile.profile.socialMedia.instagram && (
                      <a
                        href={`https://instagram.com/${selectedCandidateProfile.profile.socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {selectedCandidateProfile.profile.socialMedia.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${selectedCandidateProfile.profile.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedCandidate(selectedCandidateProfile.address);
                    setShowCandidateModal(false);
                  }}
                  className="flex-1 btn-primary py-3 inline-flex items-center justify-center space-x-2"
                >
                  <Vote className="w-5 h-5" />
                  <span>Select for Voting</span>
                </button>
                <button
                  onClick={() => setShowCandidateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;