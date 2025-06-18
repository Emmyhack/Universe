'use client'

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { ZKProofGenerator, VoteData } from './zk/ProofGenerator'
import { useElectionContract } from './contracts/hooks'

interface VotingInterfaceProps {
  electionAddress: string
  electionId: string
  candidates: Array<{
    id: number
    name: string
    description: string
    address: string
  }>
  eligibleVoters: string[]
  merkleRoot: string
}

export default function VotingInterface({
  electionAddress,
  electionId,
  candidates,
  eligibleVoters,
  merkleRoot
}: VotingInterfaceProps) {
  const { address } = useAccount()
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [voteStatus, setVoteStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const { contract: electionContract } = useElectionContract(electionAddress)

  const { data: castVoteData, write: castVote, isLoading: isCastVoteLoading } = useContractWrite({
    address: electionAddress as `0x${string}`,
    abi: [
      {
        name: 'castVote',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: '_encryptedVote', type: 'bytes32' },
          { name: '_voterProof', type: 'bytes32[]' },
          { name: '_voterLeaf', type: 'bytes32' },
          { name: '_voteZKProof', type: 'bytes' },
          { name: '_votePublicInputs', type: 'bytes' }
        ],
        outputs: []
      }
    ],
    functionName: 'castVote'
  })

  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: castVoteData?.hash,
    onSuccess: () => {
      setVoteStatus('Vote cast successfully! 🎉')
      setIsVoting(false)
    },
    onError: (error) => {
      setError(`Transaction failed: ${error.message}`)
      setIsVoting(false)
    }
  })

  const handleVote = async () => {
    if (!address || selectedCandidate === null) {
      setError('Please select a candidate and ensure you are connected')
      return
    }

    if (!eligibleVoters.includes(address)) {
      setError('You are not eligible to vote in this election')
      return
    }

    setIsVoting(true)
    setError('')
    setVoteStatus('Preparing your vote...')

    try {
      // Prepare vote data
      const voteData: VoteData = {
        selectedCandidate,
        electionId,
        voterAddress: address,
        timestamp: Date.now()
      }

      setVoteStatus('Generating privacy protections...')

      // Prepare vote with all privacy protections
      const votePreparation = await ZKProofGenerator.prepareVote(voteData, eligibleVoters)
      
      if (!votePreparation) {
        throw new Error('Failed to prepare vote')
      }

      const { encryptedVote, merkleProof, zkProof } = votePreparation

      setVoteStatus('Submitting vote to blockchain...')

      // Convert data for smart contract
      const encryptedVoteBytes = ethers.toUtf8Bytes(encryptedVote.encryptedData)
      const voterProofBytes = merkleProof.path.map(p => ethers.toUtf8Bytes(p))
      const voterLeafBytes = ethers.toUtf8Bytes(merkleProof.leaf)
      const zkProofBytes = ethers.toUtf8Bytes(zkProof.proof)
      const publicInputsBytes = ethers.toUtf8Bytes(zkProof.publicInputs)

      // Cast vote on blockchain
      castVote({
        args: [
          encryptedVoteBytes,
          voterProofBytes,
          voterLeafBytes,
          zkProofBytes,
          publicInputsBytes
        ]
      })

    } catch (err) {
      console.error('Voting error:', err)
      setError(err instanceof Error ? err.message : 'Failed to cast vote')
      setIsVoting(false)
    }
  }

  const isEligible = address && eligibleVoters.includes(address)

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cast Your Vote</h2>
      
      {!address ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to vote</p>
        </div>
      ) : !isEligible ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">You are not eligible to vote in this election</p>
          <p className="text-sm text-gray-500">Eligible voters: {eligibleVoters.length}</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Select a Candidate</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Address: {candidate.address}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedCandidate !== null && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>Selected:</strong> {candidates.find(c => c.id === selectedCandidate)?.name}
              </p>
            </div>
          )}

          {voteStatus && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{voteStatus}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleVote}
            disabled={selectedCandidate === null || isVoting || isCastVoteLoading || isTransactionPending}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
              selectedCandidate === null || isVoting || isCastVoteLoading || isTransactionPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isVoting || isCastVoteLoading || isTransactionPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isVoting ? 'Preparing Vote...' : 'Submitting Vote...'}
              </span>
            ) : (
              'Cast Vote'
            )}
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Privacy Features:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your vote is encrypted and protected by zero-knowledge proofs</li>
              <li>Your identity remains anonymous while proving eligibility</li>
              <li>Vote verification without revealing your choice</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
} 