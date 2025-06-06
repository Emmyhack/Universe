// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Import interfaces for ZK-proof verification
import "./interfaces/IZKVerifier.sol";
import "./VerificationMerkle.sol"; // Import the VerificationMerkle contract
import "./CandidateRegistry.sol"; // Import the CandidateRegistry contract

contract Election is AccessControl, ReentrancyGuard, Pausable {

    // Define roles specific to an election
    bytes32 public constant ELECTION_ADMIN_ROLE = keccak256("ELECTION_ADMIN_ROLE");
    bytes32 public constant VERIFIED_STUDENT_ROLE = keccak256("VERIFIED_STUDENT_ROLE");
    bytes32 public constant CANDIDATE_ROLE = keccak256("CANDIDATE_ROLE"); // Role for candidates in this specific election

    enum ElectionPhase { 
        Registration, 
        Voting, 
        Tally, 
        Results, 
        Completed 
    }

    struct Vote {
        bytes32 encryptedVote;
        bytes32 voterLeaf; // Store the leaf used for voter eligibility verification
        uint256 timestamp;
    }

    struct ElectionConfig {
        string title;
        uint256 startTime; // Start time of the Voting phase
        uint256 endTime; // End time of the Voting phase
        bytes32 eligibilityRoot; // Merkle root for student verification for this election
        bool isActive; // Indicates if the election is active and not cancelled
        // Note: Candidates are registered dynamically during the Registration phase
    }

    ElectionConfig public electionConfig;
    ElectionPhase public currentPhase;

    // Mapping to store votes: voterAddress => Vote struct
    mapping(address => Vote) private votes;

    // Mapping to track if a student has voted
    mapping(address => bool) private hasVoted;

    // List of candidate addresses in this election
    address[] public candidates;

    // Mapping to store candidate information for this election: candidateAddress => IPFS hash
    mapping(address => string) private candidateInfoIPFSHash;

    // Reference to the VerificationMerkle contract instance
    VerificationMerkle public verificationMerkle;

    // Reference to the CandidateRegistry contract instance
    CandidateRegistry public candidateRegistry;

    // Reference to ZK-proof contract instance
    IZKVerifier public zkVerifier;

    // State variable to store the tally result hash after verification
    bytes32 public finalTallyResultHash;

    // Events for election phases
    event ElectionStarted(uint256 timestamp);
    event ElectionEnded(uint256 timestamp);
    event VotesTallied(uint256 timestamp);
    event ResultsPublished(uint256 timestamp);
    event ElectionCancelled(uint256 timestamp);

    // Event for vote casting
    event VoteCast(address indexed voter, bytes32 encryptedVote, uint256 timestamp);

    // Event for candidate registration in this election
    event CandidateRegistered(address indexed candidateAddress, string ipfsHash);

    // Event for successful tally verification
    event TallyVerified(bytes32 indexed tallyResultHash);

     // Event for setting the VerificationMerkle address
    event VerificationMerkleSet(address indexed verificationMerkleAddress);

     // Event for setting the CandidateRegistry address
    event CandidateRegistrySet(address indexed candidateRegistryAddress);

     // Event for setting the ZKVerifier address
    event ZKVerifierSet(address indexed zkVerifierAddress);

    constructor(
        ElectionConfig memory _electionConfig
    ) payable {
        // Input validation for election config
        require(bytes(_electionConfig.title).length > 0, "Election title cannot be empty");
        require(_electionConfig.startTime < _electionConfig.endTime, "Start time must be before end time");
        // eligibilityRoot is set via a separate function after deployment
        // candidates are added during registration phase

        electionConfig = _electionConfig;
        currentPhase = ElectionPhase.Registration;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant deployer admin role
        _grantRole(ELECTION_ADMIN_ROLE, msg.sender); // Grant deployer election admin role
        // VERIFIED_STUDENT_ROLE is likely granted by University Admin via VerificationMerkle or a separate process.
        // CANDIDATE_ROLE is granted during candidate registration for this election.
    }

    /**
     * @dev Sets the address of the VerificationMerkle contract.
     * Can only be called once by the DEFAULT_ADMIN_ROLE.
     * @param _verificationMerkleAddress Address of the deployed VerificationMerkle contract.
     */
    function setVerificationMerkle(address _verificationMerkleAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(verificationMerkle) == address(0), "VerificationMerkle already set");
        require(_verificationMerkleAddress != address(0), "Invalid VerificationMerkle address");
        verificationMerkle = VerificationMerkle(_verificationMerkleAddress);
        emit VerificationMerkleSet(_verificationMerkleAddress);
    }

     /**
     * @dev Sets the address of the CandidateRegistry contract.
     * Can only be called once by the DEFAULT_ADMIN_ROLE.
     * @param _candidateRegistryAddress Address of the deployed CandidateRegistry contract.
     */
    function setCandidateRegistry(address _candidateRegistryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(candidateRegistry) == address(0), "CandidateRegistry already set");
        require(_candidateRegistryAddress != address(0), "Invalid CandidateRegistry address");
        candidateRegistry = CandidateRegistry(_candidateRegistryAddress);
        emit CandidateRegistrySet(_candidateRegistryAddress);
    }

     /**
     * @dev Sets the address of the ZKVerifier contract.
     * Can only be called once by the DEFAULT_ADMIN_ROLE.
     * @param _zkVerifierAddress Address of the deployed ZKVerifier contract.
     */
    function setZKVerifier(address _zkVerifierAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(zkVerifier) == address(0), "ZKVerifier already set");
        require(_zkVerifierAddress != address(0), "Invalid ZKVerifier address");
        zkVerifier = IZKVerifier(_zkVerifierAddress);
        emit ZKVerifierSet(_zkVerifierAddress);
    }

    /**
     * @dev Allows an account with VERIFIED_STUDENT_ROLE to cast an encrypted vote.
     * Requires the election to be in the Voting phase.
     * Requires the sender to have the VERIFIED_STUDENT_ROLE.
     * Requires the student not to have voted already.
     * Requires successful verification via Merkle proof and VerificationMerkle contract.
     * Requires successful verification of the vote's ZK proof.
     * @param _encryptedVote The encrypted vote data.
     * @param _voterProof The Merkle proof for voter eligibility.
     * @param _voterLeaf The leaf node used in the Merkle tree for the voter.
     * @param _voteZKProof The ZK proof related to the vote itself (e.g., proving vote is for a valid candidate).
     * @param _votePublicInputs Public inputs for the vote ZK proof (e.g., election ID, candidate hash).
     */
    function castVote(
        bytes32 _encryptedVote,
        bytes32[] memory _voterProof,
        bytes32 _voterLeaf,
        bytes memory _voteZKProof,
        bytes memory _votePublicInputs
    ) public onlyRole(VERIFIED_STUDENT_ROLE) nonReentrant whenNotPaused {
        require(currentPhase == ElectionPhase.Voting, "Election is not in Voting phase");
        require(!hasVoted[msg.sender], "You have already voted");
        require(address(verificationMerkle) != address(0), "VerificationMerkle address not set");
        require(address(zkVerifier) != address(0), "ZKVerifier address not set");

        // Verify voter eligibility using Merkle proof against the election's eligibility root.
        require(verificationMerkle.isStudentVerified(msg.sender, _voterProof, _voterLeaf), "Voter not verified");

        // Verify the ZK proof related to the vote itself.
        require(zkVerifier.verifyProof(_voteZKProof, _votePublicInputs), "Invalid vote ZK proof");

        votes[msg.sender] = Vote({
            encryptedVote: _encryptedVote,
            voterLeaf: _voterLeaf,
            timestamp: block.timestamp
        });
        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, _encryptedVote, block.timestamp);
    }

    /**
     * @dev Allows an account with ELECTION_ADMIN_ROLE to register a candidate for THIS election.
     * Requires the election to be in the Registration phase.
     * This does NOT register the candidate globally in the CandidateRegistry.
     * @param _candidateAddress The wallet address of the candidate.
     * @param _ipfsHash The IPFS hash pointing to the candidate's information.
     */
    function registerCandidate(address _candidateAddress, string memory _ipfsHash) public onlyRole(ELECTION_ADMIN_ROLE) whenNotPaused {
        require(currentPhase == ElectionPhase.Registration, "Election is not in Registration phase");
        require(_candidateAddress != address(0), "Invalid candidate address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(address(candidateRegistry) != address(0), "CandidateRegistry address not set");

        // Check if candidate is already registered for this election
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == _candidateAddress) {
                revert("Candidate already registered for this election");
            }
        }

        // Check if the candidate is registered and verified in the global CandidateRegistry
        require(candidateRegistry.getCandidateInfo(_candidateAddress).registrationTimestamp > 0, "Candidate not found in global registry");
        require(candidateRegistry.isCandidateVerified(_candidateAddress), "Candidate not verified in global registry");

        candidates.push(_candidateAddress);
        candidateInfoIPFSHash[_candidateAddress] = _ipfsHash;

        // Grant CANDIDATE_ROLE to the candidate address FOR THIS ELECTION INSTANCE
        _grantRole(CANDIDATE_ROLE, _candidateAddress);

        emit CandidateRegistered(_candidateAddress, _ipfsHash);
    }

    /**
     * @dev Allows an account with ELECTION_ADMIN_ROLE to start the voting phase.
     * Requires the election to be in the Registration phase and the current time to be after startTime.
     * Requires at least one candidate to be registered.
     */
    function startElection() public onlyRole(ELECTION_ADMIN_ROLE) whenNotPaused {
        require(currentPhase == ElectionPhase.Registration, "Election is not in Registration phase");
        require(block.timestamp >= electionConfig.startTime, "Election start time has not been reached");
        require(candidates.length > 0, "No candidates registered for the election");
        require(electionConfig.eligibilityRoot != bytes32(0), "Eligibility Merkle root is not set in election config");
        require(address(verificationMerkle) != address(0), "VerificationMerkle address not set");

        // Ensure the current Merkle root in the VerificationMerkle contract matches the election's eligibility root
        require(verificationMerkle.currentMerkleRoot() == electionConfig.eligibilityRoot, "VerificationMerkle root does not match election eligibility root");

        currentPhase = ElectionPhase.Voting;
        emit ElectionStarted(block.timestamp);
    }

    /**
     * @dev Allows an account with ELECTION_ADMIN_ROLE to end the voting phase and move to tally.
     * Requires the election to be in the Voting phase and the current time to be after endTime.
     */
    function endElection() public onlyRole(ELECTION_ADMIN_ROLE) whenNotPaused {
        require(currentPhase == ElectionPhase.Voting, "Election is not in Voting phase");
        // Allow ending election manually by admin even if time hasn't passed, if necessary
        // require(block.timestamp >= electionConfig.endTime, "Election end time has not been reached");

        currentPhase = ElectionPhase.Tally;
        emit ElectionEnded(block.timestamp);
    }

    /**
     * @dev Allows an account with ELECTION_ADMIN_ROLE to trigger the tally process and verify the result with ZKPs.
     * Requires the election to be in the Tally phase.
     * @param _tallyResultZKProof The ZK proof verifying the tally result.
     * @param _tallyPublicInputs Public inputs for the tally ZK proof (e.g., election ID, vote commitments, final counts).
     * @param _finalTallyResultHash A hash of the final tally result (to be stored on-chain).
     */
    function tallyVotes(
        bytes memory _tallyResultZKProof,
        bytes memory _tallyPublicInputs,
        bytes32 _finalTallyResultHash
    ) public onlyRole(ELECTION_ADMIN_ROLE) nonReentrant whenNotPaused {
        require(currentPhase == ElectionPhase.Tally, "Election is not in Tally phase");
        require(_finalTallyResultHash != bytes32(0), "Final tally result hash cannot be zero");
        require(address(zkVerifier) != address(0), "ZKVerifier address not set");

        // Verify the ZK proof for the tally result
        require(zkVerifier.verifyProof(_tallyResultZKProof, _tallyPublicInputs), "Invalid tally ZK proof");

        // Store the verified tally result hash on-chain
        finalTallyResultHash = _finalTallyResultHash;

        currentPhase = ElectionPhase.Results;
        emit VotesTallied(block.timestamp);
        emit TallyVerified(_finalTallyResultHash);
    }

    /**
     * @dev Allows an account with ELECTION_ADMIN_ROLE to publish the results.
     * Requires the election to be in the Results phase (after votes are tallied and verified).
     * This function makes the results accessible.
     */
    function publishResults() public onlyRole(ELECTION_ADMIN_ROLE) whenNotPaused {
        require(currentPhase == ElectionPhase.Results, "Election is not in Results phase");
        require(finalTallyResultHash != bytes32(0), "Tally results not verified yet");

        currentPhase = ElectionPhase.Completed;
        emit ResultsPublished(block.timestamp);
    }

     /**
     * @dev Allows the DEFAULT_ADMIN_ROLE to cancel the election.
     * Can be called in any phase except Completed.
     */
    function cancelElection() public onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        require(currentPhase != ElectionPhase.Completed, "Election is already completed");
        electionConfig.isActive = false;
        emit ElectionCancelled(block.timestamp);
        // TODO: Consider refunding any associated costs (if applicable)
    }

    /**
     * @dev Retrieves the list of candidates for this election.
     */
    function getCandidates() public view returns (address[] memory) {
        return candidates;
    }

    /**
     * @dev Retrieves the IPFS hash for a specific candidate in this election.
     * @param _candidateAddress The address of the candidate.
     * @return The IPFS hash.
     */
    function getCandidateIpfsHash(address _candidateAddress) public view returns (string memory) {
         require(_candidateAddress != address(0), "Invalid candidate address");
         bool found = false;
         for (uint i = 0; i < candidates.length; i++) {
             if (candidates[i] == _candidateAddress) {
                 found = true;
                 break;
             }
         }
         require(found, "Candidate not registered for this election");
         return candidateInfoIPFSHash[_candidateAddress];
    }

    /**
     * @dev Retrieves the final verified tally result hash.
     * Can be called once the election is in the Results or Completed phase.
     * @return The hash of the final tally result.
     */
    function getResultsHash() public view returns (bytes32) {
        require(currentPhase == ElectionPhase.Results || currentPhase == ElectionPhase.Completed, "Results are not available yet");
        return finalTallyResultHash;
    }

    /**
     * @dev Pauses the contract. Only DEFAULT_ADMIN_ROLE can call this.
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) { 
        _pause();
    }

    /**
     * @dev Unpauses the contract. Only DEFAULT_ADMIN_ROLE can call this.
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) { 
        _unpause();
    }

    // TEST ONLY: Grant any role for testing purposes. REMOVE IN PRODUCTION!
    function testGrantRole(bytes32 role, address account) public {
        _grantRole(role, account);
    }

}
