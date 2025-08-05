import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Vote, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Election, ElectionPhase, UserRole } from '@/types';
import CreateElectionModal from '@/components/CreateElectionModal';

const Elections = () => {
  const { state } = useWeb3();
  const [elections, setElections] = useState<Election[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'voting' | 'registration'>('all');

  useEffect(() => {
    if (state.isConnected) {
      loadElections();
    }
  }, [state.isConnected]);

  const loadElections = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      setElections([
        {
          address: '0x123...',
          config: {
            title: 'Student Union President 2024',
            startTime: Date.now() + 86400000,
            endTime: Date.now() + 604800000,
            eligibilityRoot: '0xabc...',
            isActive: true,
          },
          currentPhase: ElectionPhase.VOTING,
          candidates: ['0x456...', '0x789...'],
        },
        {
          address: '0x456...',
          config: {
            title: 'Faculty Council Election',
            startTime: Date.now() - 86400000,
            endTime: Date.now() + 259200000,
            eligibilityRoot: '0xdef...',
            isActive: true,
          },
          currentPhase: ElectionPhase.REGISTRATION,
          candidates: ['0xabc...'],
        },
        {
          address: '0x789...',
          config: {
            title: 'Department Head Election',
            startTime: Date.now() - 604800000,
            endTime: Date.now() - 259200000,
            eligibilityRoot: '0xghi...',
            isActive: true,
          },
          currentPhase: ElectionPhase.COMPLETED,
          candidates: ['0xdef...', '0x123...'],
          finalTallyResultHash: '0xresult...',
        },
      ]);
      setUserRole(UserRole.ELECTION_OFFICER);
    } catch (error) {
      console.error('Error loading elections:', error);
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

  const canCreateElection = () => {
    return userRole === UserRole.ELECTION_OFFICER || userRole === UserRole.UNIVERSITY_ADMIN;
  };

  const canManageElection = (_election: Election) => {
    return userRole === UserRole.ELECTION_OFFICER || userRole === UserRole.UNIVERSITY_ADMIN;
  };

  const filteredElections = elections.filter(election => {
    switch (filter) {
      case 'active':
        return election.currentPhase !== ElectionPhase.COMPLETED;
      case 'voting':
        return election.currentPhase === ElectionPhase.VOTING;
      case 'registration':
        return election.currentPhase === ElectionPhase.REGISTRATION;
      default:
        return true;
    }
  });

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Vote className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect to View Elections</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please connect your wallet to view and participate in elections.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading elections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
          <p className="text-gray-600">
            Manage and participate in university elections
          </p>
        </div>
        {canCreateElection() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Election</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Elections' },
          { key: 'active', label: 'Active' },
          { key: 'voting', label: 'Voting' },
          { key: 'registration', label: 'Registration' },
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

      {/* Elections List */}
      <div className="space-y-4">
        {filteredElections.length === 0 ? (
          <div className="card text-center py-12">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Elections Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No elections have been created yet.'
                : `No ${filter} elections found.`
              }
            </p>
            {canCreateElection() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Election</span>
              </button>
            )}
          </div>
        ) : (
          filteredElections.map((election, index) => {
            const phaseStatus = getPhaseStatus(election.currentPhase);
            const PhaseIcon = phaseStatus.icon;
            
            return (
              <div key={index} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {election.config.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${phaseStatus.color}`}>
                        <PhaseIcon className="w-3 h-3" />
                        <span>{phaseStatus.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {election.currentPhase === ElectionPhase.VOTING && (
                      <Link
                        to={`/voting/${election.address}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Vote Now
                      </Link>
                    )}
                    
                    <Link
                      to={`/voting/${election.address}`}
                      className="btn-secondary text-sm px-4 py-2 inline-flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>

                    {canManageElection(election) && (
                      <>
                        <button className="btn-secondary text-sm px-4 py-2 inline-flex items-center space-x-1">
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button className="btn-danger text-sm px-4 py-2 inline-flex items-center space-x-1">
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <CreateElectionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadElections();
          }}
        />
      )}
    </div>
  );
};

export default Elections;