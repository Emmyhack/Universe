'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useUniversity } from '@/components/providers/UniversityProvider'
import UniversitySelector from './UniversitySelector'
import WalletModal from '@/components/WalletModal'
import Logo from './Logo'
import WalletDropdownButton from '@/components/WalletDropdownButton'
import { 
  HomeIcon,
  AcademicCapIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  Cog6ToothIcon,
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Universities', href: '/universities', icon: AcademicCapIcon },
  { name: 'University Auth', href: '/university-auth', icon: ShieldCheckIcon },
  { name: 'Elections', href: '/elections', icon: ChartBarIcon },
  { name: 'Candidates', href: '/candidates', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
]

export default function Navigation() {
  const pathname = usePathname()
  const { isConnected, address, connect, disconnect, networkName, balance, setShowWalletModal } = useWeb3()
  const { selectedUniversity, isUniversityAdmin } = useUniversity()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <h1 className="text-xl font-bold text-gray-900">Universe</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Mobile wallet section */}
          <div className="border-t border-gray-200 p-4">
            {isConnected ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Connected</p>
                  <p className="font-medium text-gray-900 truncate">{address}</p>
                  <p className="text-xs text-gray-500">{networkName}</p>
                  {balance && <p className="text-xs text-gray-500">{parseFloat(balance).toFixed(4)} KAI</p>}
                </div>
                <button
                  onClick={disconnect}
                  className="w-full btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <WalletDropdownButton />
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <h1 className="text-xl font-bold text-gray-900">Universe</h1>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Desktop wallet section */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            {isConnected && (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Connected</p>
                  <p className="font-medium text-gray-900 truncate">{address}</p>
                  <p className="text-xs text-gray-500">{networkName}</p>
                  {balance && <p className="text-xs text-gray-500">{parseFloat(balance).toFixed(4)} KAI</p>}
                </div>
                
                {/* University Selector */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">University</p>
                  <UniversitySelector />
                </div>
                
                {selectedUniversity && (
                  <div className="text-xs text-gray-600">
                    <p>Selected: {selectedUniversity.name}</p>
                    {isUniversityAdmin && (
                      <p className="text-green-600 font-medium">✓ University Admin</p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={disconnect}
                  className="w-full btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            )}
            
            {!isConnected && (
              <button
                onClick={() => setShowWalletModal(true)}
                className="w-full btn-primary text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <h1 className="text-lg font-semibold text-gray-900">Universe</h1>
            </div>
          </div>
          
          {isConnected && (
            <UniversitySelector />
          )}
          
          {!isConnected && (
            <WalletDropdownButton />
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal />
    </>
  )
} 