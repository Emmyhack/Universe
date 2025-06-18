'use client'

import { useWeb3 } from '@/components/providers/Web3Provider'
import { useState } from 'react'
import { ethers } from 'ethers'

export default function TestWalletPage() {
  const { address, isConnected, connect, disconnect, provider, signer } = useWeb3()
  const [testResult, setTestResult] = useState<string>('')

  const testConnection = async () => {
    try {
      if (!isConnected) {
        setTestResult('Not connected')
        return
      }

      if (!provider) {
        setTestResult('No provider')
        return
      }

      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address!)
      
      setTestResult(`Connected! Network: ${network.name}, Chain ID: ${network.chainId}, Balance: ${ethers.formatEther(balance)} ETH`)
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wallet Connection Test</h1>
        
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {address || 'Not connected'}</p>
            <p><strong>Provider:</strong> {provider ? 'Available' : 'Not available'}</p>
            <p><strong>Signer:</strong> {signer ? 'Available' : 'Not available'}</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {!isConnected ? (
              <button onClick={connect} className="btn-primary">
                Connect Wallet
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={testConnection} className="btn-primary">
                  Test Connection
                </button>
                <button onClick={disconnect} className="btn-secondary">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {testResult && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <p className="text-gray-700">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  )
} 