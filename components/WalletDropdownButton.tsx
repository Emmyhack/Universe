'use client'

import { useState } from 'react'

export default function WalletDropdownButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const connectKaiWallet = async () => {
    setIsLoading(true)
    setOpen(false)
    if (typeof window === 'undefined' || typeof window.kaiwallet === 'undefined') {
      alert('KaiWallet is not installed')
      setIsLoading(false)
      return
    }
    try {
      await window.kaiwallet.request({ method: 'eth_requestAccounts' })
      alert('Connected to KaiWallet!')
    } catch (err: any) {
      alert('KaiWallet connection failed: ' + (err.message || err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="btn-primary flex items-center"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
      >
        Connect Wallet
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={connectKaiWallet}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center"
              disabled={isLoading}
            >
              <span className="mr-2">🟦</span> KaiWallet
            </button>
            {/* Add more wallets here in the future */}
          </div>
        </div>
      )}
    </div>
  )
} 