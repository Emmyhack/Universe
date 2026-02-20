// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Election.sol";
import "./UniversityRegistry.sol"; // Import UniversityRegistry

contract ElectionFactory is AccessControl, Pausable {

    // Define roles for election management
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    bytes32 public constant ELECTION_OFFICER_ROLE = keccak256("ELECTION_OFFICER_ROLE");

    // Reference to the UniversityRegistry contract
    UniversityRegistry public universityRegistry;

    // Struct for proposed election configuration
    struct ProposedElectionConfig {
        address proposer;
        string title;
        uint256 startTime;
        uint256 endTime;
        bytes32 eligibilityRoot;
        address verificationMerkleAddress;
        address candidateRegistryAddress;
        address zkVerifierAddress;
        bool approved;
        uint256 submissionTimestamp;
    }

    // Mapping to store deployed elections per university
    mapping(string => address[]) private universityElections;

    // Mapping to store pending election creations requiring DAO approval
    // University Code => proposal ID => ProposedElectionConfig
    mapping(string => mapping(uint256 => ProposedElectionConfig)) private pendingElections;

    // Mapping to track the next available proposal ID for each university
    mapping(string => uint256) private nextProposalId;

    // Event for election creation proposal
    event ElectionProposalSubmitted(string indexed universityCode, uint256 indexed proposalId, address indexed proposer);

    // Event for election approval
    event ElectionApproved(string indexed universityCode, uint256 indexed proposalId, address indexed electionAddress);

    // Event for election proposal revocation
    event ElectionProposalRevoked(string indexed universityCode, uint256 indexed proposalId, address indexed revokedBy);

     // Event for setting the UniversityRegistry address
    event UniversityRegistrySet(address indexed universityRegistryAddress);

    constructor() payable {
        // Grant the deployer the DEFAULT_ADMIN_ROLE, DAO_ROLE and ELECTION_OFFICER_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_ROLE, msg.sender);
        _grantRole(ELECTION_OFFICER_ROLE, msg.sender);
    }

    /**
     * @dev Sets the address of the UniversityRegistry contract.
     * Can only be called once by the DEFAULT_ADMIN_ROLE.
     * @param _universityRegistry Address of the deployed UniversityRegistry contract.
     */
    function setUniversityRegistry(address _universityRegistry) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(universityRegistry) == address(0), "UniversityRegistry already set");
        require(_universityRegistry != address(0), "Invalid UniversityRegistry address");
        universityRegistry = UniversityRegistry(_universityRegistry);
        emit UniversityRegistrySet(_universityRegistry);
    }

    /**
     * @dev Allows an account with ELECTION_OFFICER_ROLE to propose a new election.
     * This proposal requires DAO approval before the election contract is deployed.
     * @param _universityCode The code of the university for which the election is being created.
     * @param _title The title of the election.
     * @param _startTime The start time of the voting phase.
     * @param _endTime The end time of the voting phase.
     * @param _eligibilityRoot The Merkle root for student eligibility.
     * @param _verificationMerkleAddress Address of the VerificationMerkle contract.
     * @param _candidateRegistryAddress Address of the CandidateRegistry contract.
     * @param _zkVerifierAddress Address of the ZKVerifier contract.
     */
    function createElection(
        string memory _universityCode,
        string memory _title,
        uint256 _startTime,
        uint256 _endTime,
        bytes32 _eligibilityRoot,
        address _verificationMerkleAddress,
        address _candidateRegistryAddress,
        address _zkVerifierAddress
    ) public onlyRole(ELECTION_OFFICER_ROLE) whenNotPaused {
        // Input validation
        require(bytes(_universityCode).length > 0, "University code cannot be empty");
        require(bytes(_title).length > 0, "Election title cannot be empty");
        require(_startTime < _endTime, "Start time must be before end time");
        require(_eligibilityRoot != bytes32(0), "Eligibility root cannot be zero");
        require(_verificationMerkleAddress != address(0), "VerificationMerkle address cannot be zero");
        require(_candidateRegistryAddress != address(0), "CandidateRegistry address cannot be zero");
        require(_zkVerifierAddress != address(0), "ZKVerifier address cannot be zero");
        require(address(universityRegistry) != address(0), "UniversityRegistry address not set");

        // Check if university exists and is active
        require(universityRegistry.universityExists(_universityCode), "University not found");
        require(universityRegistry.getUniversityInfo(_universityCode).isActive, "University is not active");

        uint256 proposalId = nextProposalId[_universityCode]++;

        pendingElections[_universityCode][proposalId] = ProposedElectionConfig({
            proposer: msg.sender,
            title: _title,
            startTime: _startTime,
            endTime: _endTime,
            eligibilityRoot: _eligibilityRoot,
            verificationMerkleAddress: _verificationMerkleAddress,
            candidateRegistryAddress: _candidateRegistryAddress,
            zkVerifierAddress: _zkVerifierAddress,
            approved: false,
            submissionTimestamp: block.timestamp
        });

        emit ElectionProposalSubmitted(_universityCode, proposalId, msg.sender);
    }

    /**
     * @dev Allows an account with DAO_ROLE to approve a pending election proposal.
     * Upon approval, the actual Election contract is deployed.
     * @param _universityCode The code of the university.
     * @param _proposalId The ID of the pending election proposal to approve.
     */
    function approveElection(string memory _universityCode, uint256 _proposalId) public onlyRole(DAO_ROLE) whenNotPaused {
        // Input validation and proposal check
        require(bytes(_universityCode).length > 0, "University code cannot be empty");
        ProposedElectionConfig storage proposal = pendingElections[_universityCode][_proposalId];
        require(proposal.proposer != address(0), "Proposal not found"); // Check if proposal exists
        require(!proposal.approved, "Proposal already approved");

        // Create the ElectionConfig struct from the proposal data
        Election.ElectionConfig memory electionConfig = Election.ElectionConfig({
            title: proposal.title,
            startTime: proposal.startTime,
            endTime: proposal.endTime,
            eligibilityRoot: proposal.eligibilityRoot,
            isActive: true // Election is active upon deployment
        });

        // Deploy the Election contract using the approved configuration and linked contract addresses
        Election newElection = new Election(
            electionConfig
        );
        address newElectionAddress = address(newElection);

        // Set the addresses of the dependent contracts in the newly deployed Election contract
        newElection.setVerificationMerkle(proposal.verificationMerkleAddress);
        newElection.setCandidateRegistry(proposal.candidateRegistryAddress);
        newElection.setZKVerifier(proposal.zkVerifierAddress);

        // Grant ELECTION_ADMIN_ROLE on the new Election contract to the proposer
        bytes32 electionAdminRole = newElection.ELECTION_ADMIN_ROLE();
        newElection.grantRole(electionAdminRole, proposal.proposer);

        // SECURITY: Only grant ELECTION_ADMIN_ROLE to the proposer
        // The DEFAULT_ADMIN_ROLE should remain with the factory contract for security
        // bytes32 defaultAdminRole = newElection.DEFAULT_ADMIN_ROLE();
        // newElection.grantRole(defaultAdminRole, proposal.proposer);

        // Link the new election contract address to the university code
        universityElections[_universityCode].push(newElectionAddress);

        // Mark proposal as approved and potentially clear or mark for archival
        proposal.approved = true; // Or delete the proposal: delete pendingElections[_universityCode][_proposalId];

        emit ElectionApproved(_universityCode, _proposalId, newElectionAddress);
    }

    /**
     * @dev Allows the proposer or an account with DAO_ROLE to revoke a pending election proposal.
     * Requires the proposal to be pending (not yet approved).
     * @param _universityCode The code of the university.
     * @param _proposalId The ID of the pending election proposal to revoke.
     */
    function revokeElectionProposal(string memory _universityCode, uint256 _proposalId) public whenNotPaused {
        require(bytes(_universityCode).length > 0, "University code cannot be empty");
        ProposedElectionConfig storage proposal = pendingElections[_universityCode][_proposalId];
        require(proposal.proposer != address(0), "Proposal not found");
        require(!proposal.approved, "Proposal already approved");

        // Only the proposer or DAO_ROLE can revoke
        require(msg.sender == proposal.proposer || hasRole(DAO_ROLE, msg.sender), "Caller is not the proposer or DAO");

        // Remove the proposal from storage
        delete pendingElections[_universityCode][_proposalId];

        emit ElectionProposalRevoked(_universityCode, _proposalId, msg.sender);
    }

    /**
     * @dev Retrieves the list of deployed election contract addresses for a given university.
     * Anyone can call this function.
     * @param _universityCode The code of the university.
     * @return An array of Election contract addresses.
     */
    function getUniversityElections(string memory _universityCode) public view returns (address[] memory) {
         require(bytes(_universityCode).length > 0, "University code cannot be empty");
         require(address(universityRegistry) != address(0), "UniversityRegistry address not set");
         // Using universityExists from UniversityRegistry
         require(universityRegistry.universityExists(_universityCode), "University not found");
         return universityElections[_universityCode];
    }

     /**
     * @dev Retrieves a pending election proposal.
     * @param _universityCode The code of the university.
     * @param _proposalId The ID of the pending election proposal.
     * @return ProposedElectionConfig struct.
     */
    function getPendingElectionProposal(string memory _universityCode, uint256 _proposalId) public view returns (ProposedElectionConfig memory) {
        require(bytes(_universityCode).length > 0, "University code cannot be empty");
        ProposedElectionConfig memory proposal = pendingElections[_universityCode][_proposalId];
        require(proposal.proposer != address(0), "Proposal not found"); // Check if proposal exists
        return proposal;
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

    /**
     * @dev Allows the factory to grant roles on deployed elections.
     * Only DEFAULT_ADMIN_ROLE can call this function.
     * @param _electionAddress The address of the deployed election contract.
     * @param _role The role to grant.
     * @param _account The account to grant the role to.
     */
    function grantRoleOnElection(address _electionAddress, bytes32 _role, address _account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_electionAddress != address(0), "Invalid election address");
        require(_account != address(0), "Invalid account address");
        
        Election election = Election(_electionAddress);
        election.grantRole(_role, _account);
    }

    /**
     * @dev Future Enhancement: Add proposal revocation functionality
     * - Allow proposer to revoke pending proposals
     * - Add DAO-based revocation voting
     */
} 