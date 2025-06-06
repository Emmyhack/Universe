import { ethers } from "hardhat";

async function main() {
  // Get the contract factories
  const UniversityRegistry = await ethers.getContractFactory("UniversityRegistry");
  const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
  const CandidateRegistry = await ethers.getContractFactory("CandidateRegistry");
  const VerificationMerkle = await ethers.getContractFactory("VerificationMerkle");
  const Election = await ethers.getContractFactory("Election");

  // Deploy the contracts in a logical order
  // The order of deployment matters due to dependencies between contracts.
  // VerificationMerkle and CandidateRegistry can likely be deployed first.
  // Then UniversityRegistry.
  // ElectionFactory depends on Election, so Election might need to be deployed first or handled carefully.

  console.log("Deploying contracts...");

  // Deploy VerificationMerkle
  const verificationMerkle = await VerificationMerkle.deploy();
  await verificationMerkle.waitForDeployment();
  console.log("VerificationMerkle deployed to:", verificationMerkle.target);

  // Deploy CandidateRegistry
  const candidateRegistry = await CandidateRegistry.deploy();
  await candidateRegistry.waitForDeployment();
  console.log("CandidateRegistry deployed to:", candidateRegistry.target);

  // Deploy UniversityRegistry
  const universityRegistry = await UniversityRegistry.deploy();
  await universityRegistry.waitForDeployment();
  console.log("UniversityRegistry deployed to:", universityRegistry.target);

  // Deploy Election (This is a simplified example, the actual Election deployment will be triggered by ElectionFactory)
  // This part of the script is more for demonstrating how Election would be deployed individually.
  // In the final system, Election contracts are deployed by the ElectionFactory.
  // For a basic deployment script, we might deploy a sample Election contract for testing purposes.
  // NOTE: The Election constructor requires parameters (_electionConfig, _verificationMerkleAddress, _zkVerifierAddress).
  // You will need to provide appropriate values here for a test deployment.
  /*
  const sampleElectionConfig = {
    title: "Sample SUG Election",
    startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    candidates: [], // Add sample candidate addresses
    eligibilityRoot: "0x0000000000000000000000000000000000000000000000000000000000000000", // Replace with a valid initial root
    isActive: true,
  };
  const election = await Election.deploy(sampleElectionConfig, verificationMerkle.target, "ZK_VERIFIER_ADDRESS"); // Replace with actual ZK Verifier address
  await election.waitForDeployment();
  console.log("Sample Election deployed to:", election.target);
  */

  // Deploy ElectionFactory (This contract will be responsible for deploying Election contracts)
  // The ElectionFactory might need the address of the UniversityRegistry and potentially DAO/Election Officer roles set up initially.
  const electionFactory = await ElectionFactory.deploy(); // TODO: Add constructor parameters if needed
  await electionFactory.waitForDeployment();
  console.log("ElectionFactory deployed to:", electionFactory.target);

  console.log("Deployment complete.");

  // You might want to save the deployed contract addresses to a file for later use
  // fs.writeFileSync('./deployedAddresses.json', JSON.stringify({\n    UniversityRegistry: universityRegistry.target,\n    ElectionFactory: electionFactory.target,\n    CandidateRegistry: candidateRegistry.target,\n    VerificationMerkle: verificationMerkle.target,\n    // SampleElection: election.target // Uncomment if deploying sample election
  // }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 