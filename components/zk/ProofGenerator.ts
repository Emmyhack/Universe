import { ethers } from 'ethers'
import { MerkleTree } from 'merkletreejs'
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import { groth16 } from 'snarkjs'

export interface VoteData {
  selectedCandidate: number
  electionId: string
  voterAddress: string
  timestamp: number
}

export interface EncryptedVote {
  encryptedData: string
  iv: string
  voteHash: string
  voterCommitment: string
}

export interface MerkleProofData {
  leaf: string
  path: string[]
  pathPos: number[]
  root: string
}

export interface VoteProofInputs {
  electionId: string;
  candidate: number;
  merkleRoot: string;
  voterSecret: string;
  voterLeaf: string;
  merklePathElements: string[];
  merklePathIndices: string[];
  oldKey: string;
  oldValue: string;
  isOld0: number;
  key: string;
  value: string;
  fnc: number;
}

export interface VoteProof {
  proof: any;
  publicSignals: any;
}

export class ZKProofGenerator {
  private static readonly ENCRYPTION_KEY = process.env.NEXT_PUBLIC_VOTE_ENCRYPTION_KEY || 'default-key-change-in-production'
  private wasmBuffer: ArrayBuffer | null = null;
  private zkeyBuffer: ArrayBuffer | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      console.log('Initializing ZK Proof Generator...');
      
      // Load the circuit files
      const wasmResponse = await fetch('/zk/vote_verification.wasm');
      const zkeyResponse = await fetch('/zk/vote_verification.zkey');
      
      if (!wasmResponse.ok || !zkeyResponse.ok) {
        throw new Error('Failed to load ZK circuit files');
      }
      
      this.wasmBuffer = await wasmResponse.arrayBuffer();
      this.zkeyBuffer = await zkeyResponse.arrayBuffer();
      this.isInitialized = true;
      
      console.log('ZK Proof Generator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ZK Proof Generator:', error);
      throw error;
    }
  }

  async generateVoteProof(inputs: VoteProofInputs): Promise<VoteProof> {
    if (!this.isInitialized) {
      throw new Error('ZK Proof Generator not initialized. Call initialize() first.');
    }

    try {
      console.log('Generating ZK proof for vote...');
      
      // Prepare the witness inputs for the circuit
      const witnessInputs = {
        electionId: inputs.electionId,
        candidate: inputs.candidate,
        merkleRoot: inputs.merkleRoot,
        voterSecret: inputs.voterSecret,
        voterLeaf: inputs.voterLeaf,
        merklePathElements: inputs.merklePathElements,
        merklePathIndices: inputs.merklePathIndices,
        oldKey: inputs.oldKey,
        oldValue: inputs.oldValue,
        isOld0: inputs.isOld0,
        key: inputs.key,
        value: inputs.value,
        fnc: inputs.fnc
      };

      // Generate the proof using snarkjs
      const { proof, publicSignals } = await groth16.fullProve(
        witnessInputs,
        this.wasmBuffer!,
        this.zkeyBuffer!
      );

      console.log('ZK proof generated successfully');
      
      return { proof, publicSignals };
    } catch (error) {
      console.error('Failed to generate ZK proof:', error);
      throw error;
    }
  }

  async verifyProof(proof: any, publicSignals: any): Promise<boolean> {
    try {
      // Load the verification key
      const vKeyResponse = await fetch('/zk/verification_key.json');
      if (!vKeyResponse.ok) {
        throw new Error('Failed to load verification key');
      }
      
      const vKey = await vKeyResponse.json();
      
      // Verify the proof
      const isValid = await groth16.verify(vKey, publicSignals, proof);
      
      console.log('Proof verification result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Failed to verify proof:', error);
      return false;
    }
  }

  /**
   * Generate a random voter secret for privacy
   */
  static generateVoterSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt vote data to protect voter privacy
   */
  static encryptVote(voteData: VoteData, voterSecret: string): EncryptedVote {
    const voteString = JSON.stringify(voteData)
    const iv = CryptoJS.lib.WordArray.random(16)
    
    // Encrypt the vote data
    const encrypted = CryptoJS.AES.encrypt(voteString, ZKProofGenerator.ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Create vote hash for verification
    const voteHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        `${voteData.selectedCandidate}-${voteData.electionId}-${voterSecret}-${voteData.voterAddress}`
      )
    )

    // Create voter commitment for privacy
    const voterCommitment = ethers.keccak256(
      ethers.toUtf8Bytes(`${voteData.voterAddress}-${voterSecret}`)
    )

    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString(),
      voteHash,
      voterCommitment
    }
  }

  /**
   * Decrypt vote data (for verification purposes)
   */
  static decryptVote(encryptedVote: EncryptedVote): VoteData | null {
    try {
      const iv = CryptoJS.enc.Hex.parse(encryptedVote.iv)
      const decrypted = CryptoJS.AES.decrypt(encryptedVote.encryptedData, ZKProofGenerator.ENCRYPTION_KEY, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      const voteString = decrypted.toString(CryptoJS.enc.Utf8)
      return JSON.parse(voteString)
    } catch (error) {
      console.error('Failed to decrypt vote:', error)
      return null
    }
  }

  /**
   * Generate Merkle proof for voter eligibility
   */
  static generateMerkleProof(
    eligibleVoters: string[],
    voterAddress: string
  ): MerkleProofData | null {
    try {
      // Create Merkle tree from eligible voters
      const leaves = eligibleVoters.map(voter => 
        ethers.keccak256(ethers.toUtf8Bytes(voter))
      )
      const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true })
      
      // Find voter's leaf
      const voterLeaf = ethers.keccak256(ethers.toUtf8Bytes(voterAddress))
      const leafIndex = leaves.findIndex(leaf => leaf === voterLeaf)
      
      if (leafIndex === -1) {
        return null // Voter not eligible
      }

      // Generate proof
      const proof = tree.getProof(voterLeaf)
      const path = proof.map(p => p.data)
      const pathPos = proof.map(p => p.position === 'left' ? 0 : 1)

      return {
        leaf: voterLeaf,
        path,
        pathPos,
        root: tree.getRoot().toString('hex')
      }
    } catch (error) {
      console.error('Failed to generate Merkle proof:', error)
      return null
    }
  }

  /**
   * Verify Merkle proof
   */
  static verifyMerkleProof(proofData: MerkleProofData): boolean {
    try {
      const tree = new MerkleTree([], ethers.keccak256, { sortPairs: true })
      return tree.verify(proofData.path, proofData.leaf, proofData.root)
    } catch (error) {
      console.error('Failed to verify Merkle proof:', error)
      return false
    }
  }

  /**
   * Generate ZK proof for vote verification
   * Note: This is a simplified version. In production, you'd use actual ZK circuits
   */
  static async generateZKProof(
    voteData: VoteData,
    encryptedVote: EncryptedVote,
    merkleProof: MerkleProofData,
    voterSecret: string
  ): Promise<{
    proof: string
    publicInputs: string
  } | null> {
    try {
      // Initialize the ZK proof generator if not already done
      if (!zkProofGenerator.isInitialized) {
        await zkProofGenerator.initialize();
      }

      // Prepare the inputs for the ZK circuit
      const proofInputs: VoteProofInputs = {
        electionId: voteData.electionId,
        candidate: voteData.selectedCandidate,
        merkleRoot: merkleProof.root,
        voterSecret: voterSecret,
        voterLeaf: merkleProof.leaf,
        merklePathElements: merkleProof.path,
        merklePathIndices: merkleProof.pathPos.map(p => p.toString()),
        oldKey: '0', // For SMT, this represents the old state
        oldValue: '0', // For SMT, this represents the old value
        isOld0: 1, // Indicates this is a new entry
        key: merkleProof.leaf, // The key in the SMT
        value: '1', // The value (1 for eligible voter)
        fnc: 0 // 0 for inclusion proof
      };

      // Generate the ZK proof
      const voteProof = await zkProofGenerator.generateVoteProof(proofInputs);

      // Convert the proof to the format expected by the smart contract
      const proofString = JSON.stringify(voteProof.proof);
      const publicInputsString = JSON.stringify(voteProof.publicSignals);

      return {
        proof: proofString,
        publicInputs: publicInputsString
      };
    } catch (error) {
      console.error('Failed to generate ZK proof:', error);
      return null;
    }
  }

  /**
   * Verify ZK proof
   */
  static verifyZKProof(
    proof: string,
    publicInputs: string
  ): boolean {
    try {
      // In a real implementation, this would verify the actual ZK proof
      // For now, we'll do basic validation
      const inputs = JSON.parse(ethers.toUtf8String(publicInputs))
      
      // Basic checks
      return (
        inputs.validVote === true &&
        inputs.electionId &&
        inputs.candidateHash &&
        inputs.voteHash &&
        inputs.merkleRoot &&
        inputs.voterCommitment
      )
    } catch (error) {
      console.error('Failed to verify ZK proof:', error)
      return false
    }
  }

  /**
   * Complete vote preparation with all privacy protections
   */
  static async prepareVote(
    voteData: VoteData,
    eligibleVoters: string[]
  ): Promise<{
    encryptedVote: EncryptedVote
    merkleProof: MerkleProofData
    zkProof: { proof: string; publicInputs: string }
    voterSecret: string
  } | null> {
    try {
      // Generate voter secret for privacy
      const voterSecret = ZKProofGenerator.generateVoterSecret()

      // Encrypt the vote
      const encryptedVote = ZKProofGenerator.encryptVote(voteData, voterSecret)

      // Generate Merkle proof for eligibility
      const merkleProof = ZKProofGenerator.generateMerkleProof(eligibleVoters, voteData.voterAddress)
      if (!merkleProof) {
        throw new Error('Voter not eligible')
      }

      // Generate ZK proof
      const zkProof = await ZKProofGenerator.generateZKProof(voteData, encryptedVote, merkleProof, voterSecret)
      if (!zkProof) {
        throw new Error('Failed to generate ZK proof')
      }

      return {
        encryptedVote,
        merkleProof,
        zkProof,
        voterSecret
      }
    } catch (error) {
      console.error('Failed to prepare vote:', error)
      return null
    }
  }
}

// Export a singleton instance
export const zkProofGenerator = new ZKProofGenerator(); 