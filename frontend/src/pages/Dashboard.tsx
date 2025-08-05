import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Vote, 
  Users, 
  GraduationCap, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { UserRole, Election, University } from '@/types';

const Dashboard = () => {
  const { state, getContract } = useWeb3();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.isConnected) {
      loadDashboardData();
    }
  }, [state.isConnected]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch user roles and data from contracts
      // For now, we'll simulate the data
      setUserRole(UserRole.STUDENT);
      
      // Mock data
      setElections([
        {
          address: '0x123...',
          config: {
            title: 'Student Union President 2024',
            startTime: Date.now() + 86400000, // 24 hours from now
            endTime: Date.now() + 604800000, // 7 days from now
            eligibilityRoot: '0xabc...',
            isActive: true,
          },
          currentPhase: 1, // VOTING
          candidates: ['0x456...', '0x789...'],
        },
        {
          address: '0x456...',
          config: {
            title: 'Faculty Council Election',
            startTime: Date.now() - 86400000, // 24 hours ago
            endTime: Date.now() + 259200000, // 3 days from now
            eligibilityRoot: '0xdef...',
            isActive: true,
          },
          currentPhase: 0, // REGISTRATION
          candidates: ['0xabc...'],
        },
      ]);

      setUniversities([
        {
          name: 'University of Technology',
          code: 'UTECH',
          adminWallet: '0x123...',
          isActive: true,
          registrationDate: Date.now() - 86400000,
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleActions = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return [
          { name: 'Vote in Elections', href: '/elections', icon: Vote, color: 'primary' },
          { name: 'View Results', href: '/elections', icon: Eye, color: 'secondary' },
        ];
      case UserRole.CANDIDATE:
        return [
          { name: 'View My Candidacy', href: '/candidates', icon: Users, color: 'primary' },
          { name: 'Vote in Elections', href: '/elections', icon: Vote, color: 'secondary' },
        ];
      case UserRole.ELECTION_OFFICER:
        return [
          { name: 'Create Election', href: '/elections', icon: Plus, color: 'primary' },
          { name: 'Manage Elections', href: '/elections', icon: Settings, color: 'secondary' },
          { name: 'View Results', href: '/elections', icon: Eye, color: 'secondary' },
        ];
      case UserRole.UNIVERSITY_ADMIN:
        return [
          { name: 'Manage University', href: '/universities', icon: GraduationCap, color: 'primary' },
          { name: 'Create Election', href: '/elections', icon: Plus, color: 'secondary' },
          { name: 'Admin Panel', href: '/admin', icon: Settings, color: 'secondary' },
        ];
      default:
        return [
          { name: 'Connect Wallet', href: '#', icon: Settings, color: 'primary' },
        ];
    }
  };

  const getPhaseStatus = (phase: number) => {
    switch (phase) {
      case 0:
        return { text: 'Registration', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 1:
        return { text: 'Voting', color: 'bg-green-100 text-green-800', icon: Vote };
      case 2:
        return { text: 'Tallying', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 3:
        return { text: 'Results', color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
      case 4:
        return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Vote className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to UniVote</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Connect your wallet to access the dashboard and participate in university elections.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your elections and quick actions.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getRoleActions().map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className={`p-4 rounded-lg border transition-colors duration-200 hover:shadow-md ${
                  action.color === 'primary'
                    ? 'border-primary-200 bg-primary-50 hover:bg-primary-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${
                    action.color === 'primary' ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <span className="font-medium text-gray-900">{action.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Elections */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Elections</h2>
          <Link to="/elections" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        
        {elections.length === 0 ? (
          <div className="text-center py-8">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active elections found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {elections.map((election, index) => {
              const phaseStatus = getPhaseStatus(election.currentPhase);
              const PhaseIcon = phaseStatus.icon;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{election.config.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{election.candidates.length} candidates</span>
                        <span>•</span>
                        <span>Ends {new Date(election.config.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${phaseStatus.color}`}>
                        <PhaseIcon className="w-3 h-3" />
                        <span>{phaseStatus.text}</span>
                      </div>
                      <Link
                        to={`/voting/${election.address}`}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        {election.currentPhase === 1 ? 'Vote Now' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* University Info */}
      {universities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your University</h2>
          <div className="space-y-4">
            {universities.map((university, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{university.name}</h3>
                  <p className="text-sm text-gray-600">Code: {university.code}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                  <Link to="/universities" className="text-primary-600 hover:text-primary-700">
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;