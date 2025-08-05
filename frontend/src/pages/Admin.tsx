import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Settings, 
  Users, 
  Shield, 
  Key, 
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { UserRole } from '@/types';

const Admin = () => {
  const { state } = useWeb3();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemStats] = useState({
    totalElections: 12,
    activeElections: 3,
    totalUniversities: 5,
    totalCandidates: 24,
    totalVotes: 156,
  });

  useEffect(() => {
    if (state.isConnected) {
      loadAdminData();
    }
  }, [state.isConnected]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      setUserRole(UserRole.DEFAULT_ADMIN);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessAdmin = () => {
    return userRole === UserRole.DEFAULT_ADMIN || 
           userRole === UserRole.REGISTRAR ||
           userRole === UserRole.UNIVERSITY_ADMIN;
  };

  const adminActions = [
    {
      title: 'Role Management',
      description: 'Manage user roles and permissions',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      href: '#',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and parameters',
      icon: Settings,
      color: 'bg-green-100 text-green-600',
      href: '#',
    },
    {
      title: 'Security Audit',
      description: 'View security logs and audit trails',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
      href: '#',
    },
    {
      title: 'Contract Management',
      description: 'Manage smart contract addresses and upgrades',
      icon: Database,
      color: 'bg-orange-100 text-orange-600',
      href: '#',
    },
    {
      title: 'Access Control',
      description: 'Manage access keys and permissions',
      icon: Key,
      color: 'bg-red-100 text-red-600',
      href: '#',
    },
    {
      title: 'System Monitor',
      description: 'Monitor system health and performance',
      icon: Activity,
      color: 'bg-indigo-100 text-indigo-600',
      href: '#',
    },
  ];

  const recentActivities = [
    {
      action: 'Election Created',
      description: 'Student Union President 2024',
      timestamp: Date.now() - 3600000,
      type: 'success',
    },
    {
      action: 'Candidate Registered',
      description: 'New candidate added to registry',
      timestamp: Date.now() - 7200000,
      type: 'info',
    },
    {
      action: 'University Registered',
      description: 'State University added to platform',
      timestamp: Date.now() - 86400000,
      type: 'success',
    },
    {
      action: 'Security Alert',
      description: 'Unusual activity detected',
      timestamp: Date.now() - 172800000,
      type: 'warning',
    },
  ];

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect to Access Admin</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please connect your wallet to access the admin panel.
        </p>
      </div>
    );
  }

  if (!canAccessAdmin()) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You don't have permission to access the admin panel. Contact your administrator.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">
          Manage system settings, roles, and monitor platform activity
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {systemStats.totalElections}
          </h3>
          <p className="text-gray-600">Total Elections</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {systemStats.activeElections}
          </h3>
          <p className="text-gray-600">Active Elections</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {systemStats.totalUniversities}
          </h3>
          <p className="text-gray-600">Universities</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {systemStats.totalCandidates}
          </h3>
          <p className="text-gray-600">Candidates</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {systemStats.totalVotes}
          </h3>
          <p className="text-gray-600">Total Votes</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Administrative Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 text-left"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const getActivityIcon = () => {
              switch (activity.type) {
                case 'success':
                  return <CheckCircle className="w-4 h-4 text-green-600" />;
                case 'warning':
                  return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
                default:
                  return <Clock className="w-4 h-4 text-blue-600" />;
              }
            };

            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon()}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.action}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Smart Contracts</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Services</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Healthy
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Security Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Secure
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">
                {new Date(Date.now() - 86400000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="text-sm text-gray-900">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;