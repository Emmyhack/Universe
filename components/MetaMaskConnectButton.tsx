'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

export default function MetaMaskConnectButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connectMetaMask = async () => {
    setError(null)
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed')
      return
    }
    setIsLoading(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length === 0) {
        setError('No accounts found')
        setIsLoading(false)
        return
      }
      setAddress(accounts[0])
    } catch (err: any) {
      setError(err.message || 'Failed to connect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {address ? (
        <div className="text-green-700 font-mono">Connected: {address.slice(0, 6)}...{address.slice(-4)}</div>
      ) : (
        <button
          onClick={connectMetaMask}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  )
} 