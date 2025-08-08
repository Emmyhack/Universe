import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Users, 
  CheckCircle,
  XCircle,
  Settings,
  Globe
} from 'lucide-react';
import { University, UserRole } from '@/types';

const Universities = () => {
  const { state } = useWeb3();
  const [universities, setUniversities] = useState<University[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', code: '', adminWallet: '' });
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    if (state.isConnected) {
      loadUniversities();
    }
  }, [state.isConnected]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from contracts
      setUniversities([
        {
          name: 'University of Technology',
          code: 'UTECH',
          adminWallet: '0x1234567890123456789012345678901234567890',
          isActive: true,
          registrationDate: Date.now() - 86400000,
        },
        {
          name: 'State University',
          code: 'SU',
          adminWallet: '0x2345678901234567890123456789012345678901',
          isActive: true,
          registrationDate: Date.now() - 172800000,
        },
        {
          name: 'Private College',
          code: 'PC',
          adminWallet: '0x3456789012345678901234567890123456789012',
          isActive: false,
          registrationDate: Date.now() - 259200000,
        },
      ]);
      setUserRole(UserRole.REGISTRAR);
    } catch (error) {
      console.error('Error loading universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const canRegisterUniversity = () => {
    return userRole === UserRole.REGISTRAR || userRole === UserRole.DEFAULT_ADMIN;
  };

  const canManageUniversity = (university: University) => {
    return userRole === UserRole.REGISTRAR || 
           userRole === UserRole.DEFAULT_ADMIN ||
           (userRole === UserRole.UNIVERSITY_ADMIN && university.adminWallet === state.account);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Registration handler
  const handleRegisterUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerForm.name || !registerForm.code || !registerForm.adminWallet) {
      setRegisterError('All fields are required.');
      return;
    }
    // Mock registration (append to state)
    setUniversities([
      ...universities,
      {
        name: registerForm.name,
        code: registerForm.code,
        adminWallet: registerForm.adminWallet,
        isActive: true,
        registrationDate: Date.now(),
      },
    ]);
    setShowRegisterModal(false);
    setRegisterForm({ name: '', code: '', adminWallet: '' });
  };

  if (!state.isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect to View Universities</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please connect your wallet to view and manage universities.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Loading universities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Register University Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowRegisterModal(false)}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-2xl font-bold mb-4">Register University</h2>
            <form onSubmit={handleRegisterUniversity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="input"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  className="input"
                  value={registerForm.code}
                  onChange={e => setRegisterForm(f => ({ ...f, code: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Wallet</label>
                <input
                  type="text"
                  className="input font-mono"
                  value={registerForm.adminWallet}
                  onChange={e => setRegisterForm(f => ({ ...f, adminWallet: e.target.value }))}
                  required
                />
              </div>
              {registerError && <div className="text-red-600 text-sm">{registerError}</div>}
              <button type="submit" className="btn-primary w-full">Register</button>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-600">
            Manage university registrations and settings
          </p>
        </div>
        {canRegisterUniversity() && (
          <button
            className="btn-primary inline-flex items-center space-x-2"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Register University</span>
          </button>
        )}
      </div>

      {/* Universities List */}
      <div className="space-y-4">
        {universities.length === 0 ? (
          <div className="card text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Universities Found</h3>
            <p className="text-gray-600 mb-4">
              No universities have been registered yet.
            </p>
            {canRegisterUniversity() && (
              <button
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register First University</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {universities.map((university, index) => (
              <div key={index} className="card">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {university.name}
                          </h3>
                          <p className="text-sm text-gray-600">Code: {university.code}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {university.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Admin Wallet:</span>
                      <span className="font-mono text-gray-900">
                        {formatAddress(university.adminWallet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Registration Date:</span>
                      <span className="text-gray-900">
                        {new Date(university.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Admin Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canManageUniversity(university) && (
                        <>
                          <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button className="btn-secondary text-sm px-3 py-1 inline-flex items-center space-x-1">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
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
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {universities.length}
          </h3>
          <p className="text-gray-600">Total Universities</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {universities.filter(u => u.isActive).length}
          </h3>
          <p className="text-gray-600">Active Universities</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {universities.length > 0 ? Math.floor((Date.now() - Math.min(...universities.map(u => u.registrationDate))) / (1000 * 60 * 60 * 24)) : 0}
          </h3>
          <p className="text-gray-600">Days Since First Registration</p>
        </div>
      </div>
    </div>
  );
};

export default Universities;