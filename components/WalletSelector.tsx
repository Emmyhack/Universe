'use client'

import { useWeb3 } from '@/components/providers/Web3Provider'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function WalletSelector() {
  const { 
    availableWallets, 
    showWalletSelector, 
    setShowWalletSelector, 
    connect, 
    isLoading 
  } = useWeb3()

  if (!showWalletSelector) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowWalletSelector(false)} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {availableWallets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔌</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Wallets Found</h4>
                  <p className="text-gray-600 mb-4">
                    Please install a wallet extension to use UniVote
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Recommended wallets:</p>
                    <ul className="space-y-1">
                      <li>• MetaMask (🦊)</li>
                      <li>• Coinbase Wallet (🪙)</li>
                      <li>• Brave Wallet (🦁)</li>
                      <li>• Trust Wallet (🛡️)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                availableWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => connect(wallet.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{wallet.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{wallet.name}</p>
                        <p className="text-sm text-gray-500">Browser Extension</p>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={() => setShowWalletSelector(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 