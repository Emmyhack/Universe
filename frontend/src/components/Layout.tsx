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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-primary-700 font-display">UniVote</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6" role="navigation" aria-label="Main navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
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
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold">
                      {formatAddress(state.account!)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    aria-label="Disconnect wallet"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
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