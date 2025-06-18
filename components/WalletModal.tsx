'use client'

import { useWeb3 } from '@/components/providers/Web3Provider'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Wallet icons as SVG components
const WalletIcons = {
  metamask: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21.49 2L13.54 8.27L14.77 4.95L21.49 2Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.51 2L10.36 8.39L9.23 4.95L2.51 2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.15 16.52L16.17 19.59L20.74 21.07L21.61 16.67L18.15 16.52Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.45 16.67L3.32 21.07L7.89 19.59L5.91 16.52L2.45 16.67Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.33 10.27L6.09 12.33L10.36 12.58L10.18 7.95L7.33 10.27Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.73 10.27L13.82 7.88L13.7 12.58L17.97 12.33L16.73 10.27Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.89 19.59L11.36 17.85L8.27 15.33L7.89 19.59Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.7 17.85L16.17 19.59L15.79 15.33L12.7 17.85Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.17 19.59L12.7 17.85L13.02 20.12L13.06 21.01L16.17 19.59Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.89 19.59L10.94 21.01L11.04 20.12L10.76 17.85L7.89 19.59Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.06 21.01L11.02 20.12L10.74 20.35H13.32L13.04 20.12L13 21.01L11.06 21.01Z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.7 17.85L10.76 16.52H8.27L10.36 17.85L12.7 17.85Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.89 19.59L8.27 15.33H5.91L7.89 19.59Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.97 12.33L13.7 12.58L14.94 16.52H17.43L19.52 17.85L17.97 12.33Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.17 19.59L15.79 15.33L13.06 21.01L16.17 19.59Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.61 16.67L20.74 21.07L21.49 21.35L23.55 16.82L21.61 16.67Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.45 16.67L0.51 16.82L2.57 21.35L3.32 21.07L2.45 16.67Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23.55 16.82L21.49 21.35L16.17 19.59L15.79 15.33L19.52 17.85L23.55 16.82Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.45 16.67L6.48 17.85L10.21 15.33L9.83 19.59L4.51 21.35L2.45 16.67Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.7 12.58L10.76 16.52H8.27L10.36 12.58H13.7Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.76 16.52L8.27 15.33L10.36 17.85L10.76 16.52Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.97 12.33L19.52 17.85L21.61 16.67L23.55 16.82L21.49 21.35L16.17 19.59L15.79 15.33L17.97 12.33Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.45 16.67L4.51 21.35L2.57 21.35L0.51 16.82L2.45 16.67Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.89 19.59L10.76 17.85L8.27 15.33L7.89 19.59Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.17 19.59L13.04 21.01L10.74 20.35H13.32L16.17 19.59Z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.76 16.52L8.27 15.33L10.36 17.85L10.76 16.52Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.7 12.58L10.76 16.52H8.27L10.36 12.58H13.7Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.97 12.33L19.52 17.85L21.61 16.67L23.55 16.82L21.49 21.35L16.17 19.59L15.79 15.33L17.97 12.33Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.45 16.67L4.51 21.35L2.57 21.35L0.51 16.82L2.45 16.67Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  kaiwallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#3B82F6"/>
      <path d="M12 6L18 12L12 18L6 12L12 6Z" fill="white"/>
      <path d="M12 8L16 12L12 16L8 12L12 8Z" fill="#3B82F6"/>
    </svg>
  ),
  coinbase: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#0052FF"/>
      <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="white"/>
    </svg>
  ),
  brave: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#FF2000"/>
      <path d="M12 6L14 10L18 12L14 14L12 18L10 14L6 12L10 10L12 6Z" fill="white"/>
    </svg>
  ),
  walletconnect: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#3B99FC"/>
      <path d="M12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="white"/>
    </svg>
  )
}

export default function WalletModal() {
  const { 
    showWalletModal, 
    setShowWalletModal, 
    availableWallets, 
    connectToWallet, 
    isLoading 
  } = useWeb3()

  if (!showWalletModal) return null

  const handleWalletClick = async (walletId: string) => {
    try {
      await connectToWallet(walletId)
    } catch (error) {
      console.error('Error connecting to wallet:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowWalletModal(false)} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {availableWallets.map((wallet) => {
                const IconComponent = WalletIcons[wallet.id as keyof typeof WalletIcons]
                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletClick(wallet.id)}
                    disabled={!wallet.available || isLoading}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      wallet.available 
                        ? 'border-gray-200 hover:border-primary-300 hover:bg-primary-50' 
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {IconComponent ? <IconComponent /> : <span className="text-2xl">🔗</span>}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{wallet.name}</p>
                        <p className="text-sm text-gray-500">
                          {wallet.available ? 'Available' : 'Not installed'}
                        </p>
                      </div>
                    </div>
                    {!wallet.available && wallet.installUrl && (
                      <a
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Install
                      </a>
                    )}
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {availableWallets.filter(w => w.available).length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No wallet extensions detected. Please install a wallet extension like MetaMask to continue.
                </p>
                <div className="mt-3 space-y-2">
                  {availableWallets.filter(w => w.installUrl).map((wallet) => (
                    <a
                      key={wallet.id}
                      href={wallet.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary-600 hover:text-primary-700"
                    >
                      Install {wallet.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 