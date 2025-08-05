import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Vote, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Calendar,
  Shield,
  Lock,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Election, ElectionPhase, UserRole } from '@/types';

const Voting = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { state, getContract, executeTransaction } = useWeb3();
  const [election, setElection] = useState<Election | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
        address: electionId!,
        config: {
          title: 'Student Union President 2024',
          startTime: Date.now() - 86400000, // Started 24 hours ago
          endTime: Date.now() + 604800000, // Ends in 7 days
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
        return { text: 'Voting Active', color: 'bg-green-100 text-green-800', icon: Vote };
      case ElectionPhase.TALLY:
        return { text: 'Tallying', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case ElectionPhase.RESULTS:
        return { text: 'Results Available', color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
      case ElectionPhase.COMPLETED:
        return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const canVote = () => {
    return userRole === UserRole.STUDENT && 
           election?.currentPhase === ElectionPhase.VOTING && 
           !hasVoted;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;

    try {
      // In a real app, this would involve:
      // 1. Creating encrypted vote
      // 2. Generating ZK proof
      // 3. Submitting to contract
      
      // Mock vote submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasVoted(true);
    } catch (error) {
      console.error('Error casting vote:', error);
    }
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
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Election Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          The election you're looking for doesn't exist or you don't have access to it.
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{election.config.title}</h1>
            <p className="text-gray-600">Cast your vote securely and privately</p>
          </div>
        </div>

        {/* Election Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${phaseStatus.color}`}>
                  <PhaseIcon className="w-4 h-4" />
                  <span>{phaseStatus.text}</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{election.candidates.length} candidates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Ends {new Date(election.config.endTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {hasVoted && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Vote Cast</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      {election.currentPhase === ElectionPhase.VOTING && (
        <div className="card">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Cast Your Vote</h2>
              <p className="text-gray-600">
                Select your preferred candidate. Your vote is encrypted and private.
              </p>
            </div>

            {/* Candidates */}
            <div className="space-y-4">
              {election.candidates.map((candidate, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedCandidate === candidate
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCandidate === candidate
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCandidate === candidate && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Candidate {index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {formatAddress(candidate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vote Button */}
            <div className="text-center pt-6 border-t border-gray-200">
              {hasVoted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Your vote has been cast successfully!</span>
                  </div>
                  <button
                    onClick={() => setShowResults(true)}
                    className="btn-secondary inline-flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Results</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleVote}
                  disabled={!selectedCandidate || !canVote()}
                  className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  <span>Cast Vote Securely</span>
                </button>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Your Vote is Secure</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your vote is encrypted and cannot be traced back to you</li>
                    <li>• Zero-knowledge proofs ensure vote validity without revealing your choice</li>
                    <li>• The blockchain provides transparency and prevents tampering</li>
                    <li>• You can only vote once per election</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {showResults && (
        <div className="card">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Election Results</h2>
              <p className="text-gray-600">
                Final results will be available after the election ends and votes are tallied.
              </p>
            </div>
            
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Results will be published after the election ends on{' '}
                {new Date(election.config.endTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;