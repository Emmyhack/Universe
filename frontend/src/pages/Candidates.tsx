import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Users, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  FileText,
  Shield,
  Eye
} from 'lucide-react';
import { Candidate, UserRole } from '@/types';

const Candidates = () => {
  const { state, getContract, executeTransaction } = useWeb3();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    if (state.isConnected) {
      loadCandidates();
    }
  }, [state.isConnected]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      setCandidates([
        {
          address: '0x1234567890123456789012345678901234567890',
          ipfsHash: 'QmCandidate1InfoHash',
          isVerified: true,
          registrationTimestamp: Date.now() - 86400000,
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          ipfsHash: 'QmCandidate2InfoHash',
          isVerified: false,
          registrationTimestamp: Date.now() - 172800000,
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          ipfsHash: 'QmCandidate3InfoHash',
          isVerified: true,
          registrationTimestamp: Date.now() - 259200000,
        },
      ]);
      setUserRole(UserRole.CANDIDATE_MANAGER);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
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
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading candidates...</p>
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
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
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
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
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
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatAddress(candidate.address)}
                          </h3>
                          <p className="text-sm text-gray-600">Candidate Address</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {candidate.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">IPFS Hash:</span>
                      <span className="font-mono text-gray-900 text-xs">
                        {candidate.ipfsHash}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Registration Date:</span>
                      <span className="text-gray-900">
                        {new Date(candidate.registrationTimestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Verification Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {canVerifyCandidate() && (
                        <>
                          <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          {!candidate.isVerified && (
                            <button className="btn-primary text-sm px-3 py-1 inline-flex items-center space-x-1">
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
    </div>
  );
};

export default Candidates;