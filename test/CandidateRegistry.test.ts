import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/internal/withArgs";

describe("CandidateRegistry", function () {
    let candidateRegistry: any;
    let owner: any;
    let addr1: any; // Represents a Candidate Manager
    let addr2: any; // Represents a Candidate
    let addr3: any; // Represents another address
    let candidateManagerRole: string;
    let candidateRole: string;

    beforeEach(async function () {
        // Get the signers
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy the CandidateRegistry contract
        const CandidateRegistryFactory = await ethers.getContractFactory("CandidateRegistry");
        candidateRegistry = await CandidateRegistryFactory.deploy();

        // Get the roles hash
        candidateManagerRole = await candidateRegistry.CANDIDATE_MANAGER_ROLE();
        candidateRole = await candidateRegistry.CANDIDATE_ROLE();

        // Ensure the owner has the necessary roles initially (granted in the contract constructor)
        expect(await candidateRegistry.hasRole(await candidateRegistry.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
        expect(await candidateRegistry.hasRole(candidateManagerRole, owner.address)).to.be.true;

        // Grant CANDIDATE_MANAGER_ROLE to addr1 for testing
        await candidateRegistry.grantRole(candidateManagerRole, addr1.address);
    });

    describe("Deployment", function () {
        it("Should set the right roles to the deployer", async function () {
            // Verified in beforeEach
        });

        it("Should grant CANDIDATE_MANAGER_ROLE to the specified address", async function () {
            expect(await candidateRegistry.hasRole(candidateManagerRole, addr1.address)).to.be.true;
        });
    });

    describe("Candidate Registration", function () {
        const ipfsHash = "QmSampleIPFSHash";

        it("Should allow an account with CANDIDATE_MANAGER_ROLE to register a candidate", async function () {
            await expect(candidateRegistry.connect(addr1).registerCandidate(addr2.address, ipfsHash))
                .to.emit(candidateRegistry, "CandidateRegistered")
                .withArgs(addr2.address, ipfsHash, anyValue);

            // Verify candidate info
            const candidateInfo = await candidateRegistry.getCandidateInfo(addr2.address);
            expect(candidateInfo.candidateAddress).to.equal(addr2.address);
            expect(candidateInfo.ipfsHash).to.equal(ipfsHash);
            expect(candidateInfo.isVerified).to.be.false; // Should be false by default
            expect(candidateInfo.registrationTimestamp).to.be.gt(0);

            // Verify CANDIDATE_ROLE is granted to the candidate
            expect(await candidateRegistry.hasRole(candidateRole, addr2.address)).to.be.true;
        });

        it("Should not allow an account without CANDIDATE_MANAGER_ROLE to register a candidate", async function () {
            await expect(candidateRegistry.connect(addr2).registerCandidate(addr3.address, ipfsHash))
                .to.be.reverted; // Expect revert without specific reason
        });

        it("Should not allow registering the same candidate twice", async function () {
            // Register first time
            await candidateRegistry.connect(addr1).registerCandidate(addr2.address, ipfsHash);

            // Attempt to register again
            await expect(candidateRegistry.connect(addr1).registerCandidate(addr2.address, "another hash"))
                .to.be.revertedWith("Candidate already registered");
        });

        it("Should revert when registering with address(0)", async function () {
             await expect(candidateRegistry.connect(addr1).registerCandidate(ethers.ZeroAddress, ipfsHash))
                 .to.be.revertedWith("Invalid candidate address");
        });
    });

    describe("Candidate Info Update", function () {
        const initialIpfsHash = "QmInitialHash";
        const newIpfsHash = "QmNewHash";

        beforeEach(async function () {
            // Register a candidate first
            await candidateRegistry.connect(addr1).registerCandidate(addr2.address, initialIpfsHash);
        });

        it("Should allow CANDIDATE_MANAGER_ROLE to update candidate info", async function () {
            await expect(candidateRegistry.connect(addr1).updateCandidateInfo(addr2.address, newIpfsHash))
                .to.emit(candidateRegistry, "CandidateInfoUpdated")
                .withArgs(addr2.address, initialIpfsHash, newIpfsHash);

            // Verify info is updated
            const candidateInfo = await candidateRegistry.getCandidateInfo(addr2.address);
            expect(candidateInfo.ipfsHash).to.equal(newIpfsHash);
        });

        it("Should allow the candidate to update their own info", async function () {
             await expect(candidateRegistry.connect(addr2).updateCandidateInfo(addr2.address, newIpfsHash))
                 .to.emit(candidateRegistry, "CandidateInfoUpdated")
                 .withArgs(addr2.address, initialIpfsHash, newIpfsHash);

             // Verify info is updated
             const candidateInfo = await candidateRegistry.getCandidateInfo(addr2.address);
             expect(candidateInfo.ipfsHash).to.equal(newIpfsHash);
        });

        it("Should not allow a non-manager, non-candidate account to update info", async function () {
             await expect(candidateRegistry.connect(addr3).updateCandidateInfo(addr2.address, newIpfsHash))
                 .to.be.revertedWith("Caller is not manager or the candidate");
        });

        it("Should revert when updating info for a non-existent candidate", async function () {
             await expect(candidateRegistry.connect(addr1).updateCandidateInfo(addr3.address, newIpfsHash))
                 .to.be.revertedWith("Candidate not found");
        });
    });

    describe("Candidate Verification", function () {
        const ipfsHash = "QmIpfsHash";

        beforeEach(async function () {
            // Register a candidate first
            await candidateRegistry.connect(addr1).registerCandidate(addr2.address, ipfsHash);
        });

        it("Should allow CANDIDATE_MANAGER_ROLE to verify candidate eligibility", async function () {
            expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.false; // Initially not verified

            await expect(candidateRegistry.connect(addr1).verifyCandidateEligibility(addr2.address, true))
                .to.emit(candidateRegistry, "CandidateVerificationStatusUpdated")
                .withArgs(addr2.address, true);

            // Verify verification status is updated
            expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.true;
        });

        it("Should allow CANDIDATE_MANAGER_ROLE to unverify candidate eligibility", async function () {
             // Verify first
             await candidateRegistry.connect(addr1).verifyCandidateEligibility(addr2.address, true);
             expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.true;

             await expect(candidateRegistry.connect(addr1).verifyCandidateEligibility(addr2.address, false))
                 .to.emit(candidateRegistry, "CandidateVerificationStatusUpdated")
                 .withArgs(addr2.address, false);

             // Verify verification status is updated
             expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.false;
        });

        it("Should not allow an account without CANDIDATE_MANAGER_ROLE to verify candidate eligibility", async function () {
             await expect(candidateRegistry.connect(addr2).verifyCandidateEligibility(addr2.address, true))
                 .to.be.reverted; // Expect revert without specific reason
        });

        it("Should revert when verifying a non-existent candidate", async function () {
             await expect(candidateRegistry.connect(addr1).verifyCandidateEligibility(addr3.address, true))
                 .to.be.revertedWith("Candidate not found");
        });
    });

    describe("Get Candidate Info", function () {
        const ipfsHash = "QmIpfsHash";

        beforeEach(async function () {
            // Register a candidate first
            await candidateRegistry.connect(addr1).registerCandidate(addr2.address, ipfsHash);
        });

        it("Should correctly retrieve candidate information for a registered candidate", async function () {
            const candidateInfo = await candidateRegistry.getCandidateInfo(addr2.address);
            expect(candidateInfo.candidateAddress).to.equal(addr2.address);
            expect(candidateInfo.ipfsHash).to.equal(ipfsHash);
            expect(candidateInfo.isVerified).to.be.false; // Initially not verified
            expect(candidateInfo.registrationTimestamp).to.be.gt(0);
        });

         it("Should revert when retrieving information for a non-existent candidate", async function () {
              await expect(candidateRegistry.getCandidateInfo(addr3.address)).to.be.revertedWith("Candidate not found");
         });

        it("Should correctly retrieve verification status for a registered candidate", async function () {
            expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.false;

            // Verify the candidate
            await candidateRegistry.connect(addr1).verifyCandidateEligibility(addr2.address, true);

            expect(await candidateRegistry.isCandidateVerified(addr2.address)).to.be.true;
        });

        it("Should revert when retrieving verification status for a non-existent candidate", async function () {
             await expect(candidateRegistry.isCandidateVerified(addr3.address)).to.be.revertedWith("Candidate not found");
        });
    });

    // TODO: Add tests for reentrancy guards and pausable functionality if implemented
}); 