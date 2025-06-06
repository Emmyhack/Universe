import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers";

describe("VerificationMerkle", function () {
    let verificationMerkle: any;
    let owner: any;
    let addr1: any; // Represents a Verifier
    let addr2: any; // Represents a student address to be verified
    let addr3: any; // Represents another address
    let verifierRole: string;
    let merkleTree: MerkleTree;
    let leaves: string[];

    beforeEach(async function () {
        // Get the signers
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy the VerificationMerkle contract
        const VerificationMerkleFactory = await ethers.getContractFactory("VerificationMerkle");
        verificationMerkle = await VerificationMerkleFactory.deploy();

        // Get the verifier role hash
        verifierRole = await verificationMerkle.VERIFIER_ROLE();

        // Ensure the owner has the necessary roles initially (granted in the contract constructor)
        expect(await verificationMerkle.hasRole(await verificationMerkle.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
        expect(await verificationMerkle.hasRole(verifierRole, owner.address)).to.be.true;

        // Grant VERIFIER_ROLE to addr1 for testing
        await verificationMerkle.grantRole(verifierRole, addr1.address);

        // Create a sample Merkle tree for testing
        // Using keccak256 as the hashing algorithm
        leaves = [addr2.address, addr3.address].map(x => keccak256(x));
        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        // Update the Merkle root in the contract
        await verificationMerkle.connect(addr1).updateMerkleRoot(merkleTree.getHexRoot());
    });

    describe("Deployment", function () {
        it("Should set the right roles to the deployer", async function () {
            // Verified in beforeEach
        });

        it("Should grant VERIFIER_ROLE to the specified address", async function () {
            expect(await verificationMerkle.hasRole(verifierRole, addr1.address)).to.be.true;
        });
    });

    describe("Merkle Root Update", function () {
        it("Should allow an account with VERIFIER_ROLE to update the Merkle root", async function () {
            const newLeaves = [owner.address, addr1.address].map(x => keccak256(x));
            const newMerkleTree = new MerkleTree(newLeaves, keccak256, { sortPairs: true });
            const newRoot = newMerkleTree.getHexRoot();

            await expect(verificationMerkle.connect(addr1).updateMerkleRoot(newRoot))
                .to.emit(verificationMerkle, "MerkleRootUpdated")
                .withArgs(merkleTree.getHexRoot(), newRoot);

            // Verify the root is updated
            expect(await verificationMerkle.currentMerkleRoot()).to.equal(newRoot);
        });

        it("Should not allow an account without VERIFIER_ROLE to update the Merkle root", async function () {
             const newLeaves = [owner.address].map(x => keccak256(x));
             const newMerkleTree = new MerkleTree(newLeaves, keccak256, { sortPairs: true });
             const newRoot = newMerkleTree.getHexRoot();

            await expect(verificationMerkle.connect(addr2).updateMerkleRoot(newRoot))
                .to.be.reverted;
        });

         it("Should revert when updating with a zero Merkle root", async function () {
              await expect(verificationMerkle.connect(addr1).updateMerkleRoot(ethers.ZeroHash))
                  .to.be.reverted;
         });
    });

    describe("Student Verification", function () {
        it("Should verify a student with a valid Merkle proof", async function () {
            const leaf = keccak256(addr2.address);
            const proof = merkleTree.getHexProof(leaf);

            expect(await verificationMerkle.verifyStudent(addr2.address, proof, leaf)).to.be.true;
            expect(await verificationMerkle.isStudentVerified(addr2.address, proof, leaf)).to.be.true;
        });

        it("Should not verify a student with an invalid Merkle proof", async function () {
            // Try to verify addr3 with addr2's proof
            const leaf2 = keccak256(addr2.address);
            const proof2 = merkleTree.getHexProof(leaf2);
            const leaf3 = keccak256(addr3.address);

            expect(await verificationMerkle.verifyStudent(addr3.address, proof2, leaf3)).to.be.false;
            expect(await verificationMerkle.isStudentVerified(addr3.address, proof2, leaf3)).to.be.false;
        });

        it("Should not verify an address not in the Merkle tree", async function () {
            const nonMemberAddress = owner.address;
            const nonMemberLeaf = keccak256(nonMemberAddress);
            // Generate a proof (it will be a valid proof for a different leaf if the tree is not empty, 
            // but verification against the non-member leaf should fail)
            const proof = merkleTree.getHexProof(leaves[0]); // Use a proof from an existing leaf

            expect(await verificationMerkle.verifyStudent(nonMemberAddress, proof, nonMemberLeaf)).to.be.false;
            expect(await verificationMerkle.isStudentVerified(nonMemberAddress, proof, nonMemberLeaf)).to.be.false;
        });

        it("Should revert when verifying with address(0)", async function () {
             const leaf = keccak256(addr2.address);
             const proof = merkleTree.getHexProof(leaf);
             const zeroAddressLeaf = keccak256(ethers.ZeroAddress);

             await expect(verificationMerkle.verifyStudent(ethers.ZeroAddress, proof, zeroAddressLeaf))
                 .to.be.revertedWith("Invalid student address");

              await expect(verificationMerkle.isStudentVerified(ethers.ZeroAddress, proof, zeroAddressLeaf))
                  .to.be.revertedWith("Invalid student address");
        });

         it("Should revert when Merkle root is not set", async function () {
              // Deploy a new contract without setting the root
              const VerificationMerkleFactory = await ethers.getContractFactory("VerificationMerkle");
              const newVerificationMerkle = await VerificationMerkleFactory.deploy();

              const leaf = keccak256(addr2.address);
              const proof = merkleTree.getHexProof(leaf);

              await expect(newVerificationMerkle.verifyStudent(addr2.address, proof, leaf))
                  .to.be.revertedWith("Merkle root is not set");

               await expect(newVerificationMerkle.isStudentVerified(addr2.address, proof, leaf))
                   .to.be.revertedWith("Merkle root is not set");
         });
    });

    // TODO: Add tests for reentrancy guards and pausable functionality if implemented
}); 