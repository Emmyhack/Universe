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
  Eye
} from 'lucide-react';
import { Election, ElectionPhase, UserRole } from '@/types';

const Voting = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { state } = useWeb3();
  const [election, setElection] = useState<Election | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    if (state.isConnected && electionId) {
      loadElectionData();
    }
  }, [state.isConnected, electionId]);

  const loadElectionData = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      setElection({
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
      });
      setUserRole(UserRole.STUDENT);
      setHasVoted(false);
    } catch (error) {
      console.error('Error loading election data:', error);
    } finally {
      setLoading(false);
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
      // In a real app, this would call the smart contract
      console.log('Casting vote for:', selectedCandidate);
      setHasVoted(true);
      // Show success message
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading election...</p>
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
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cast Your Vote</h2>
          
          {hasVoted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Vote Cast Successfully</h3>
              <p className="text-gray-600">
                Your vote has been recorded securely. Thank you for participating!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Select a Candidate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {election.candidates.map((candidate, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 border-2 rounded-lg transition-colors duration-200 ${
                        selectedCandidate === candidate
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">
                            Candidate {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatAddress(candidate)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCandidate && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Security Notice</h4>
                    <p className="text-sm text-blue-800">
                      Your vote will be encrypted and processed using zero-knowledge proofs to ensure privacy and integrity.
                      Once cast, your vote cannot be changed or traced back to you.
                    </p>
                  </div>

                  <button
                    onClick={handleVote}
                    disabled={!canVote()}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Vote className="w-5 h-5 mr-2" />
                    Cast Vote
                  </button>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default Voting;