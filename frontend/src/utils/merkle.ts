import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

export interface StudentLeaf {
  address: string;
  universityCode: string;
  studentId: string;
}

export const createMerkleTree = (students: StudentLeaf[]): MerkleTree => {
  const leaves = students.map(student => 
    keccak256(
      ethers.solidityPacked(
        ['address', 'string', 'string'],
        [student.address, student.universityCode, student.studentId]
      )
    )
  );
  
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
};

export const getMerkleProof = (
  tree: MerkleTree,
  student: StudentLeaf
): string[] => {
  const leaf = keccak256(
    ethers.solidityPacked(
      ['address', 'string', 'string'],
      [student.address, student.universityCode, student.studentId]
    )
  );
  
  return tree.getHexProof(leaf);
};

export const verifyMerkleProof = (
  tree: MerkleTree,
  student: StudentLeaf,
  proof: string[]
): boolean => {
  const leaf = keccak256(
    ethers.solidityPacked(
      ['address', 'string', 'string'],
      [student.address, student.universityCode, student.studentId]
    )
  );
  
  return tree.verify(proof, leaf, tree.getRoot());
};

export const getMerkleRoot = (tree: MerkleTree): string => {
  return tree.getHexRoot();
};