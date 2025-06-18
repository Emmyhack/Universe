'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface WalletProvider {
  name: string
  id: string
  icon: string
  available: boolean
  installUrl?: string
}

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  connectToWallet: (walletId: string) => Promise<void>
  disconnect: () => void
  chainId: number | null
  switchToKaiChain: () => Promise<void>
  isCorrectChain: boolean
  isLoading: boolean
  networkName: string
  balance: string | null
  refreshBalance: () => Promise<void>
  availableWallets: WalletProvider[]
  showWalletModal: boolean
  setShowWalletModal: (show: boolean) => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// KaiChain configuration - Update with actual KaiChain details when available
const KAICHAIN_CONFIG = {
  chainId: '0x1', // Replace with actual KaiChain chainId when available
  chainName: 'KaiChain',
  nativeCurrency: {
    name: 'KAI',
    symbol: 'KAI',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.kaichain.com'], // Replace with actual RPC URL
  blockExplorerUrls: ['https://explorer.kaichain.com'], // Replace with actual explorer URL
}

// For development/testing, you can use localhost or testnet
const LOCALHOST_CONFIG = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Localhost',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [''],
}

// Use localhost for development, KaiChain for production
const CURRENT_CHAIN_CONFIG = process.env.NODE_ENV === 'production' ? KAICHAIN_CONFIG : LOCALHOST_CONFIG

// Supported wallet providers with proper icons
const WALLET_PROVIDERS: WalletProvider[] = [
  {
    name: 'MetaMask',
    id: 'metamask',
    icon: '🦊',
    available: false,
    installUrl: 'https://metamask.io/download/'
  },
  {
    name: 'KaiWallet',
    id: 'kaiwallet',
    icon: '🔗',
    available: false,
    installUrl: 'https://kaichain.com/wallet'
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    icon: '🪙',
    available: false,
    installUrl: 'https://www.coinbase.com/wallet'
  },
  {
    name: 'Brave Wallet',
    id: 'brave',
    icon: '🦁',
    available: false,
    installUrl: 'https://brave.com/wallet/'
  },
  {
    name: 'WalletConnect',
    id: 'walletconnect',
    icon: '🔗',
    available: false,
    installUrl: 'https://walletconnect.com/'
  }
]

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])

  const isCorrectChain = chainId === Number(CURRENT_CHAIN_CONFIG.chainId)
  
  const networkName = chainId === Number(CURRENT_CHAIN_CONFIG.chainId) 
    ? CURRENT_CHAIN_CONFIG.chainName 
    : chainId === 1 ? 'Ethereum Mainnet'
    : chainId === 11155111 ? 'Sepolia Testnet'
    : chainId === 31337 ? 'Localhost'
    : `Chain ID ${chainId}`

  const refreshBalance = async () => {
    if (!provider || !address) return
    try {
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  // Check for available wallet providers
  useEffect(() => {
    const checkWallets = () => {
      const wallets = WALLET_PROVIDERS.map(wallet => ({
        ...wallet,
        available: checkWalletAvailability(wallet.id)
      }))
      setAvailableWallets(wallets)
    }

    checkWallets()
    // Check again after a short delay to catch wallets that load asynchronously
    const timer = setTimeout(checkWallets, 1000)
    return () => clearTimeout(timer)
  }, [])

  const checkWalletAvailability = (walletId: string): boolean => {
    if (typeof window === 'undefined') return false
    
    switch (walletId) {
      case 'metamask':
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
      case 'kaiwallet':
        return typeof window.kaiwallet !== 'undefined' || typeof window.ethereum !== 'undefined'
      case 'coinbase':
        return typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet
      case 'brave':
        return typeof window.ethereum !== 'undefined' && window.ethereum.isBraveWallet
      case 'walletconnect':
        return true // WalletConnect is always available as it can be used via QR code
      default:
        return false
    }
  }

  const switchToKaiChain = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('No wallet provider available')
      return
    }

    try {
      setIsLoading(true)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CURRENT_CHAIN_CONFIG.chainId }],
      })
      toast.success(`Switched to ${CURRENT_CHAIN_CONFIG.chainName} successfully!`)
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CURRENT_CHAIN_CONFIG],
          })
          toast.success(`${CURRENT_CHAIN_CONFIG.chainName} added to MetaMask successfully!`)
        } catch (addError: any) {
          toast.error(`Failed to add ${CURRENT_CHAIN_CONFIG.chainName} to MetaMask`)
          console.error('Add chain error:', addError)
        }
      } else {
        toast.error(`Failed to switch to ${CURRENT_CHAIN_CONFIG.chainName}`)
        console.error('Switch chain error:', switchError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const connectToWallet = async (walletId: string) => {
    if (typeof window === 'undefined') {
      toast.error('Browser environment not available')
      return
    }

    try {
      setIsLoading(true)
      let ethereumProvider: any

      switch (walletId) {
        case 'metamask':
        case 'coinbase':
        case 'brave':
          if (typeof window.ethereum === 'undefined') {
            toast.error('No Ethereum wallet detected')
            return
          }
          ethereumProvider = window.ethereum
          break
        case 'kaiwallet':
          if (typeof window.kaiwallet !== 'undefined') {
            ethereumProvider = window.kaiwallet
          } else if (typeof window.ethereum !== 'undefined') {
            ethereumProvider = window.ethereum
          } else {
            toast.error('KaiWallet not detected')
            return
          }
          break
        case 'walletconnect':
          // WalletConnect implementation would go here
          toast.error('WalletConnect support coming soon')
          return
        default:
          toast.error('Unsupported wallet type')
          return
      }

      // Request account access
      const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        toast.error('No accounts found')
        return
      }

      const account = accounts[0]
      
      // Create ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(ethereumProvider)
      const ethersSigner = await ethersProvider.getSigner()
      
      // Get network info
      const network = await ethersProvider.getNetwork()
      const chainIdNumber = Number(network.chainId)
      
      // Set state
      setProvider(ethersProvider)
      setSigner(ethersSigner)
      setAddress(account)
      setChainId(chainIdNumber)
      setIsConnected(true)
      setShowWalletModal(false)
      
      // Refresh balance
      await refreshBalance()
      
      toast.success(`Connected to ${account.slice(0, 6)}...${account.slice(-4)}`)
      
      // Set up event listeners
      ethereumProvider.on('accountsChanged', handleAccountsChanged)
      ethereumProvider.on('chainChanged', handleChainChanged)
      
    } catch (error: any) {
      console.error('Connection error:', error)
      if (error.code === 4001) {
        toast.error('Connection rejected by user')
      } else {
        toast.error('Failed to connect wallet: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const connect = async () => {
    setShowWalletModal(true)
  }

  const disconnect = () => {
    if (provider) {
      // Remove event listeners
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners()
      }
    }
    
    setProvider(null)
    setSigner(null)
    setAddress(null)
    setChainId(null)
    setIsConnected(false)
    setBalance(null)
    setShowWalletModal(false)
    
    toast.success('Disconnected from wallet')
  }

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === 'undefined') return
      
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum)
          const ethersSigner = await ethersProvider.getSigner()
          const network = await ethersProvider.getNetwork()
          const chainIdNumber = Number(network.chainId)
          
          setProvider(ethersProvider)
          setSigner(ethersSigner)
          setAddress(accounts[0])
          setChainId(chainIdNumber)
          setIsConnected(true)
          
          // Refresh balance
          await refreshBalance()
          
          // Set up event listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged)
          window.ethereum.on('chainChanged', handleChainChanged)
        }
      } catch (error) {
        console.error('Error checking existing connection:', error)
      }
    }
    
    checkConnection()
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAddress(accounts[0])
      refreshBalance()
    }
  }

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload()
  }

  const value: Web3ContextType = {
    provider,
    signer,
    address,
    isConnected,
    connect,
    connectToWallet,
    disconnect,
    chainId,
    switchToKaiChain,
    isCorrectChain,
    isLoading,
    networkName,
    balance,
    refreshBalance,
    availableWallets,
    showWalletModal,
    setShowWalletModal
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Extend Window interface for wallet providers
declare global {
  interface Window {
    ethereum?: any
    solana?: any
    kaiwallet?: any
  }
} 