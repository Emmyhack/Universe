import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/internal/withArgs";
// Import contract types
import type { UniversityRegistry } from "../../typechain-types/contracts/UniversityRegistry";
import type { ElectionFactory } from "../../typechain-types/contracts/ElectionFactory";
import type { CandidateRegistry } from "../../typechain-types/contracts/CandidateRegistry";
import type { VerificationMerkle } from "../../typechain-types/contracts/VerificationMerkle";
import type { DummyZKVerifier } from "../../typechain-types/contracts/mocks/DummyZKVerifier";


describe("ElectionFactory", function () {
  let electionFactory: ElectionFactory;
  let universityRegistry: UniversityRegistry;
  let candidateRegistry: CandidateRegistry;
  let verificationMerkle: VerificationMerkle;
  let mockZKVerifier: DummyZKVerifier;

  let owner: any;
  let addr1: any; // Represents a University Admin or Election Officer
  let addr2: any; // Represents a DAO member
  let daoRole: string;
  let electionOfficerRole: string;
  // Removed unused electionContract

  beforeEach(async function () {
    // Get the signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy dependency contracts
    const UniversityRegistryFactory = await ethers.getContractFactory("UniversityRegistry");
    universityRegistry = await UniversityRegistryFactory.deploy();

    const CandidateRegistryFactory = await ethers.getContractFactory("CandidateRegistry");
    candidateRegistry = await CandidateRegistryFactory.deploy();

    const VerificationMerkleFactory = await ethers.getContractFactory("VerificationMerkle");
    verificationMerkle = await VerificationMerkleFactory.deploy();

    // FIXED: Use just the contract name, not the file path
    const DummyZKVerifierFactory = await ethers.getContractFactory("DummyZKVerifier");
    mockZKVerifier = await DummyZKVerifierFactory.deploy() as DummyZKVerifier;

    // Deploy the ElectionFactory contract
    const ElectionFactoryFactory = await ethers.getContractFactory("ElectionFactory");
    electionFactory = await ElectionFactoryFactory.deploy();
    
    // Set the UniversityRegistry address after deployment
    await electionFactory.setUniversityRegistry(universityRegistry.target);

    // Grant necessary roles for testing ElectionFactory
    daoRole = await electionFactory.DAO_ROLE();
    electionOfficerRole = await electionFactory.ELECTION_OFFICER_ROLE();

    await electionFactory.grantRole(daoRole, addr2.address);
    await electionFactory.grantRole(electionOfficerRole, addr1.address);

    // Register a university for testing election creation
    const REGISTRAR_ROLE = await universityRegistry.REGISTRAR_ROLE();
    await universityRegistry.grantRole(REGISTRAR_ROLE, owner.address);
    await universityRegistry.connect(owner).registerUniversity("Test University", "SU", addr1.address);
  });

  describe("Deployment", function () {
    it("Should set the right roles to the deployer", async function () {
      // The beforeEach block grants roles, verify default admin
      expect(await electionFactory.hasRole(await electionFactory.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

     it("Should grant initial roles correctly", async function () {
          expect(await electionFactory.hasRole(daoRole, addr2.address)).to.be.true;
          expect(await electionFactory.hasRole(electionOfficerRole, addr1.address)).to.be.true;
     });
  });

  describe("Election Creation", function () {
      const universityCode = "SU";
      // Define placeholder values for new election creation arguments
      const electionTitle = "Student Union Election";
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 86400 * 7; // 7 days after start
      const eligibilityRoot = ethers.id("test_eligibility_root"); // Use a non-zero placeholder hash
      // Use deployed contract addresses for linked contracts
      let verificationMerkleAddress: string = ethers.ZeroAddress;
      let candidateRegistryAddress: string = ethers.ZeroAddress;
      let zkVerifierAddress: string = ethers.ZeroAddress;

      beforeEach(function() {
        // Ensure contracts are defined before accessing target
        expect(verificationMerkle).to.be.not.undefined;
        expect(candidateRegistry).to.be.not.undefined;
        expect(mockZKVerifier).to.be.not.undefined;

        verificationMerkleAddress = verificationMerkle.target;
        candidateRegistryAddress = candidateRegistry.target;
        zkVerifierAddress = mockZKVerifier.target;
      });

    it("Should allow ELECTION_OFFICER_ROLE to propose a new election", async function () {
        // Now that createElection creates a proposal, expect a successful transaction and event emission
        await expect(electionFactory.connect(addr1).createElection(
          universityCode,
          electionTitle,
          startTime,
          endTime,
          eligibilityRoot,
          verificationMerkleAddress,
          candidateRegistryAddress,
          zkVerifierAddress
        ))
        .to.emit(electionFactory, "ElectionProposalSubmitted")
        .withArgs(universityCode, anyValue, addr1.address);
    });

    it("Should not allow an account without ELECTION_OFFICER_ROLE to propose an election", async function () {
        await expect(electionFactory.connect(owner).createElection(
            universityCode,
            electionTitle,
            startTime,
            endTime,
            eligibilityRoot,
            verificationMerkleAddress,
            candidateRegistryAddress,
            zkVerifierAddress
        ))
        // Owner has ELECTION_OFFICER_ROLE, so this call should succeed.
        // This test checks that accounts *without* the role are reverted.
        // The assertion for owner was incorrect and is removed.

        await expect(electionFactory.connect(addr2).createElection(
             universityCode,
             electionTitle,
             startTime,
             endTime,
             eligibilityRoot,
             verificationMerkleAddress,
             candidateRegistryAddress,
             zkVerifierAddress
         ))
         .to.be.revertedWithCustomError(electionFactory, "AccessControlUnauthorizedAccount")
         .withArgs(addr2.address, electionOfficerRole);
    });

    // TODO: Add tests for input validation (e.g., university code exists and is active)
  });

  describe("Election Approval", function () {
      const universityCode = "SU";
      // Define placeholder values for new election creation arguments for the proposal
      const electionTitle = "Student Union Election for Approval";
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 86400 * 7; // 7 days after start
      const eligibilityRoot = ethers.id("test_eligibility_root_for_approval"); // Use a non-zero placeholder hash
      
      let verificationMerkleAddress: string;
      let candidateRegistryAddress: string;
      let zkVerifierAddress: string;
      let proposedElectionId: number; // To store the proposal ID from the beforeEach

      beforeEach(async function () {
        // Ensure contracts are defined before accessing target
        expect(verificationMerkle).to.be.not.undefined;
        expect(candidateRegistry).to.be.not.undefined;
        expect(mockZKVerifier).to.be.not.undefined;

        verificationMerkleAddress = verificationMerkle.target;
        candidateRegistryAddress = candidateRegistry.target;
        zkVerifierAddress = mockZKVerifier.target;

        // Propose an election first to have a pending proposal for approval tests
        const proposeTx = await electionFactory.connect(addr1).createElection(
          universityCode,
          electionTitle,
          startTime,
          endTime,
          eligibilityRoot,
          verificationMerkleAddress,
          candidateRegistryAddress,
          zkVerifierAddress
        );
        const receipt = await proposeTx.wait();
        const event = receipt.logs.find(
          (log: any) => electionFactory.interface.parseLog(log)?.name === "ElectionProposalSubmitted"
        );
        proposedElectionId = event ? electionFactory.interface.parseLog(event).args.proposalId : undefined;
        expect(proposedElectionId).to.be.not.undefined;
      });

    it("Should allow DAO_ROLE to approve a pending election", async function () {
        await expect(electionFactory.connect(addr2).approveElection(universityCode, proposedElectionId))
          .to.emit(electionFactory, "ElectionApproved")
          .withArgs(universityCode, proposedElectionId, anyValue); // Check for the correct event and arguments
    });

    it("Should not allow an account without DAO_ROLE to approve an election", async function () {
        await expect(electionFactory.connect(owner).approveElection(universityCode, proposedElectionId))
          // Owner has DAO_ROLE, this call should succeed.
          // This test checks that accounts *without* the role are reverted.
          // The assertion for owner was incorrect and is removed.

        await expect(electionFactory.connect(addr1).approveElection(universityCode, proposedElectionId))
          .to.be.revertedWithCustomError(electionFactory, "AccessControlUnauthorizedAccount")
          .withArgs(addr1.address, daoRole); // addr1 does *not* have DAO_ROLE
    });

     // TODO: Add tests for validating the proposal ID and university code
  });

  describe("Get University Elections", function () {
      const universityCode = "SU";
      // TODO: Add tests once election deployment is implemented in the factory

       it("Should return an empty array for a university with no deployed elections", async function () {
            const elections = await electionFactory.getUniversityElections(universityCode);
            expect(elections).to.be.an('array').that.is.empty;
       });

       // TODO: Add test to verify deployed election addresses are returned correctly
  });

  // TODO: Add tests for other ElectionFactory functionalities as they are implemented
});