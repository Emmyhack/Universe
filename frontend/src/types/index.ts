export interface User {
  address: string;
  role: UserRole;
  universityCode?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  CANDIDATE = 'CANDIDATE',
  ELECTION_OFFICER = 'ELECTION_OFFICER',
  UNIVERSITY_ADMIN = 'UNIVERSITY_ADMIN',
  CANDIDATE_MANAGER = 'CANDIDATE_MANAGER',
  VERIFIER = 'VERIFIER',
  DAO_MEMBER = 'DAO_MEMBER',
  REGISTRAR = 'REGISTRAR',
  DEFAULT_ADMIN = 'DEFAULT_ADMIN',
}

export interface University {
  name: string;
  code: string;
  adminWallet: string;
  isActive: boolean;
  registrationDate: number;
}

export interface Candidate {
  address: string;
  ipfsHash: string;
  isVerified: boolean;
  registrationTimestamp: number;
}

export interface ElectionConfig {
  title: string;
  startTime: number;
  endTime: number;
  eligibilityRoot: string;
  isActive: boolean;
}

export enum ElectionPhase {
  REGISTRATION = 0,
  VOTING = 1,
  TALLY = 2,
  RESULTS = 3,
  COMPLETED = 4,
}

export interface Election {
  address: string;
  config: ElectionConfig;
  currentPhase: ElectionPhase;
  candidates: string[];
  finalTallyResultHash?: string;
}

export interface Vote {
  encryptedVote: string;
  voterLeaf: string;
  timestamp: number;
}

export interface ProposedElection {
  title: string;
  startTime: number;
  endTime: number;
  eligibilityRoot: string;
  verificationMerkleAddress: string;
  candidateRegistryAddress: string;
  zkVerifierAddress: string;
  proposer: string;
  approved: boolean;
}

export interface ContractAddresses {
  universityRegistry: string;
  electionFactory: string;
  candidateRegistry: string;
  verificationMerkle: string;
  zkVerifier: string;
}

export interface Web3State {
  isConnected: boolean;
  account?: string;
  chainId?: number;
  contracts?: ContractAddresses;
}

export interface FormData {
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}