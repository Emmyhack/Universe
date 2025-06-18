'use client'

import Navigation from '@/components/layout/Navigation'
import LogoUpload from '@/components/LogoUpload'
import { useWeb3 } from '@/components/providers/Web3Provider'
import { useState } from 'react'
import { 
  CogIcon,
  WalletIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { 
    address, 
    isConnected, 
    setShowWalletSelector, 
    disconnect, 
    chainId, 
    networkName, 
    isCorrectChain, 
    switchToKaiChain, 
    balance,
    isLoading 
  } = useWeb3()
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transaction: true
  })

  const [theme, setTheme] = useState('light')

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">
              Manage your wallet connection, network preferences, and application settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Wallet Connection */}
            <div className="card">
              <div className="flex items-center mb-4">
                <WalletIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Wallet Connection</h2>
              </div>
              
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Wallet Connected</span>
                    </div>
                    <button
                      onClick={disconnect}
                      className="btn-secondary text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                        {address}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                      <div className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                        {balance ? `${parseFloat(balance).toFixed(4)} KAI` : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Connect your wallet to access Universe features</p>
                  <button
                    onClick={() => setShowWalletSelector(true)}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </div>

            {/* Network Configuration */}
            <div className="card">
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Network Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {isCorrectChain ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Current Network</p>
                      <p className="text-sm text-gray-600">{networkName} (Chain ID: {chainId})</p>
                    </div>
                  </div>
                  {!isCorrectChain && (
                    <button
                      onClick={switchToKaiChain}
                      disabled={isLoading}
                      className="btn-primary text-sm"
                    >
                      Switch to KaiChain
                    </button>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Network Information</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Universe is optimized for KaiChain. For development and testing, 
                        you can use localhost or test networks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="card">
              <LogoUpload />
            </div>

            {/* Security Settings */}
            <div className="card">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Security & Privacy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Zero-Knowledge Proofs</p>
                    <p className="text-sm text-gray-600">Enable privacy-preserving voting</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Transaction Signing</p>
                    <p className="text-sm text-gray-600">Require confirmation for all transactions</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Required</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Data Encryption</p>
                    <p className="text-sm text-gray-600">Encrypt sensitive data in transit</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="flex items-center mb-4">
                <CogIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Browser push notifications</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Transaction Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of transaction status</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('transaction')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.transaction ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.transaction ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="card">
              <div className="flex items-center mb-4">
                <CogIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="input-field max-w-xs"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="card">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">System Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">App Version</label>
                  <p className="text-sm text-gray-900">1.0.0</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Build Date</label>
                  <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <p className="text-sm text-gray-900">{process.env.NODE_ENV}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blockchain</label>
                  <p className="text-sm text-gray-900">KaiChain Compatible</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 