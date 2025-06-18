import ElectionFactory from '../../artifacts/contracts/ElectionFactory.sol/ElectionFactory.json'
import Election from '../../artifacts/contracts/Election.sol/Election.json'
import UniversityRegistry from '../../artifacts/contracts/UniversityRegistry.sol/UniversityRegistry.json'
import CandidateRegistry from '../../artifacts/contracts/CandidateRegistry.sol/CandidateRegistry.json'
import VerificationMerkle from '../../artifacts/contracts/VerificationMerkle.sol/VerificationMerkle.json'

export const ElectionFactoryABI = Election.abi
export const ElectionABI = Election.abi
export const UniversityRegistryABI = UniversityRegistry.abi
export const CandidateRegistryABI = CandidateRegistry.abi
export const VerificationMerkleABI = VerificationMerkle.abi

// For contract instantiation, import and use these ABIs 