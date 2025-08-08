import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, GraduationCap, Vote, Users, Settings, Home, LogOut } from 'lucide-react';
import { UserGuide } from './UserGuide';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { state, connect, disconnect } = useWeb3();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: GraduationCap },
    { name: 'Elections', href: '/elections', icon: Vote },
    { name: 'Universities', href: '/universities', icon: GraduationCap },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">UniVote</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {state.isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {formatAddress(state.account!)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    aria-label="Disconnect wallet"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <nav className="flex space-x-4 overflow-x-auto" role="navigation" aria-label="Mobile navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* User Guide */}
      <UserGuide isConnected={state.isConnected} />
    </div>
  );
};

export default Layout;