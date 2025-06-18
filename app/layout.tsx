import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { UniversityProvider } from '@/components/providers/UniversityProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UniVote - Decentralized University Voting System',
  description: 'A blockchain-based voting system for universities built on KaiChain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <UniversityProvider>
            {children}
            <Toaster position="top-right" />
          </UniversityProvider>
        </Web3Provider>
      </body>
    </html>
  )
} 