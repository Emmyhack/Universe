import { useWeb3 } from '@/components/providers/Web3Provider'
import { ELECTION_FACTORY_ADDRESS, UNIVERSITY_REGISTRY_ADDRESS, CANDIDATE_REGISTRY_ADDRESS, VERIFICATION_MERKLE_ADDRESS } from './addresses'
import { ElectionFactoryABI, UniversityRegistryABI, CandidateRegistryABI, VerificationMerkleABI } from './abis'
import { ethers } from 'ethers'

export function useElectionFactory() {
  const { provider, signer } = useWeb3()
  if (!signer) return null
  return new ethers.Contract(ELECTION_FACTORY_ADDRESS, ElectionFactoryABI, signer)
}

export function useUniversityRegistry() {
  const { provider, signer } = useWeb3()
  if (!signer) return null
  return new ethers.Contract(UNIVERSITY_REGISTRY_ADDRESS, UniversityRegistryABI, signer)
}

export function useCandidateRegistry() {
  const { provider, signer } = useWeb3()
  if (!signer) return null
  return new ethers.Contract(CANDIDATE_REGISTRY_ADDRESS, CandidateRegistryABI, signer)
}

export function useVerificationMerkle() {
  const { provider, signer } = useWeb3()
  if (!signer) return null
  return new ethers.Contract(VERIFICATION_MERKLE_ADDRESS, VerificationMerkleABI, signer)
}

// For dynamic Election contract instances
export function useElection(address: string) {
  const { provider, signer } = useWeb3()
  if (!signer) return null
  // ElectionABI is exported from abis.ts
  const { ElectionABI } = require('./abis')
  return new ethers.Contract(address, ElectionABI, signer)
} 