'use client'

import { useState } from 'react'
import { useWeb3 } from '@/components/providers/Web3Provider'
import Logo from '@/components/layout/Logo'
import { 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import MetaMaskConnectButton from '@/components/MetaMaskConnectButton'
import WalletDropdownButton from '@/components/WalletDropdownButton'

async function connectKaiOrMetaMask() {
  if (typeof window === 'undefined') return
  // Prefer KaiWallet
  if (typeof window.kaiwallet !== 'undefined') {
    try {
      await window.kaiwallet.request({ method: 'eth_requestAccounts' })
      alert('Connected to KaiWallet!')
      return
    } catch (err) {
      alert('KaiWallet connection failed: ' + (err.message || err))
      return
    }
  }
  // Fallback to MetaMask
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      alert('Connected to MetaMask!')
      return
    } catch (err) {
      alert('MetaMask connection failed: ' + (err.message || err))
      return
    }
  }
  alert('No KaiWallet or MetaMask detected. Please install a wallet extension.')
}

export default function HomePage() {
  const { address, isConnected, disconnect, connect, setShowWalletModal } = useWeb3()

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Voting',
      description: 'Zero-knowledge proofs ensure vote privacy while maintaining transparency'
    },
    {
      icon: AcademicCapIcon,
      title: 'University Focused',
      description: 'Designed specifically for university elections and governance'
    },
    {
      icon: UserGroupIcon,
      title: 'Student Verification',
      description: 'Merkle tree-based student verification system'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Results',
      description: 'Transparent and verifiable election results'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" />
              <span className="ml-2 text-xl font-bold text-gray-900">Universe</span>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="btn-secondary"
                  >
                    Disconnect
                  </button>
                  <Link href="/dashboard" className="btn-primary">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <WalletDropdownButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Decentralized University
            <span className="text-primary-600"> Voting</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A secure, transparent, and privacy-preserving voting system built on blockchain technology. 
            Empowering universities with decentralized governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isConnected ? (
              <Link href="/dashboard" className="btn-primary inline-flex items-center">
                Go to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="btn-primary inline-flex items-center"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            )}
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
          <div className="mt-6">
            <MetaMaskConnectButton />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Universe?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge blockchain technology with zero-knowledge proofs 
            to create the most secure and transparent voting experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to revolutionize university voting?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join the future of decentralized governance today.
          </p>
          {isConnected ? (
            <Link href="/dashboard" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              Access Dashboard
            </Link>
          ) : (
            <button
              onClick={() => connect()}
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo size="md" className="text-primary-400" />
              <span className="ml-2 text-xl font-bold">Universe</span>
            </div>
            <p className="text-gray-400">
              © 2024 Universe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 