import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3State, ContractAddresses } from '@/types';
import toast from 'react-hot-toast';

interface Web3ContextType {
  state: Web3State;
  connect: () => Promise<void>;
  disconnect: () => void;
  getContract: (contractName: string) => ethers.Contract | null;
  executeTransaction: (tx: Promise<any>, message: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Contract ABIs - In a real app, these would be imported from compiled artifacts
const UNIVERSITY_REGISTRY_ABI = [
  "function registerUniversity(string name, string code, address adminWallet)",
  "function getUniversityInfo(string code) view returns (tuple(string name, string code, address adminWallet, bool isActive, uint256 registrationDate))",
  "function universityExists(string code) view returns (bool)",
  "function updateUniversityAdmin(string code, address newAdminWallet)",
  "function setUniversityStatus(string code, bool isActive)",
];

const ELECTION_FACTORY_ABI = [
  "function createElection(string universityCode, string title, uint256 startTime, uint256 endTime, bytes32 eligibilityRoot, address verificationMerkleAddress, address candidateRegistryAddress, address zkVerifierAddress)",
  "function approveElection(string universityCode, uint256 proposalId)",
  "function getUniversityElections(string universityCode) view returns (address[])",
  "function getPendingElectionProposal(string universityCode, uint256 proposalId) view returns (tuple(string title, uint256 startTime, uint256 endTime, bytes32 eligibilityRoot, address verificationMerkleAddress, address candidateRegistryAddress, address zkVerifierAddress, address proposer, bool approved))",
  "function grantRoleOnElection(address electionAddress, bytes32 role, address account)",
];

const CANDIDATE_REGISTRY_ABI = [
  "function registerCandidate(address candidateAddress, string ipfsHash)",
  "function getCandidateInfo(address candidateAddress) view returns (tuple(address candidateAddress, string ipfsHash, bool isVerified, uint256 registrationTimestamp))",
  "function verifyCandidateEligibility(address candidateAddress, bool isVerified)",
  "function updateCandidateInfo(address candidateAddress, string newIpfsHash)",
];

const VERIFICATION_MERKLE_ABI = [
  "function updateMerkleRoot(bytes32 newMerkleRoot)",
  "function currentMerkleRoot() view returns (bytes32)",
  "function verifyStudent(address studentAddress, bytes32[] merkleProof, bytes32 leaf) view returns (bool)",
  "function isStudentVerified(address studentAddress, bytes32[] merkleProof, bytes32 leaf) view returns (bool)",
];

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
  });

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: accounts[0].address,
          chainId: Number(network.chainId),
        }));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.', {
          duration: 6000,
        });
        return;
      }

      toast.loading('Connecting to wallet...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setState({
        isConnected: true,
        account: accounts[0],
        chainId: Number(network.chainId),
      });

      toast.dismiss();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      toast.dismiss();
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection request was rejected');
      } else if (error.code === -32002) {
        toast.error('Connection request is already pending. Please check MetaMask.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnect = () => {
    setState({
      isConnected: false,
    });
    toast.success('Wallet disconnected');
  };

  const getContract = (contractName: string): ethers.Contract | null => {
    if (!state.isConnected) return null;

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Mock contract addresses - in real app, these would be from config
    const mockContracts: ContractAddresses = {
      universityRegistry: '0x1234567890123456789012345678901234567890',
      electionFactory: '0x2345678901234567890123456789012345678901',
      candidateRegistry: '0x3456789012345678901234567890123456789012',
      verificationMerkle: '0x4567890123456789012345678901234567890123',
      zkVerifier: '0x5678901234567890123456789012345678901234',
    };
    
    const address = mockContracts[contractName as keyof ContractAddresses];
    
    if (!address) return null;

    let abi: any[] = [];
    switch (contractName) {
      case 'universityRegistry':
        abi = UNIVERSITY_REGISTRY_ABI;
        break;
      case 'electionFactory':
        abi = ELECTION_FACTORY_ABI;
        break;
      case 'candidateRegistry':
        abi = CANDIDATE_REGISTRY_ABI;
        break;
      case 'verificationMerkle':
        abi = VERIFICATION_MERKLE_ABI;
        break;
      default:
        return null;
    }

    return new ethers.Contract(address, abi, provider);
  };

  const executeTransaction = async (tx: Promise<any>, message: string) => {
    try {
      toast.loading(message);
      const result = await tx;
      await result.wait();
      toast.dismiss();
      toast.success('Transaction completed successfully!');
      return result;
    } catch (error: any) {
      toast.dismiss();
      console.error('Transaction error:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction was rejected by user');
      } else if (error.code === -32603) {
        toast.error('Transaction failed. Please check your gas settings.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else if (error.message?.includes('gas')) {
        toast.error('Transaction failed due to gas issues. Please try increasing gas limit.');
      } else {
        toast.error('Transaction failed. Please try again.');
      }
      throw error;
    }
  };

  const value: Web3ContextType = {
    state,
    connect,
    disconnect,
    getContract,
    executeTransaction,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};