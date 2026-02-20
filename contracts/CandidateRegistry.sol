// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CandidateRegistry is AccessControl, Pausable {

    // Define roles for candidate management
    bytes32 public constant CANDIDATE_MANAGER_ROLE = keccak256("CANDIDATE_MANAGER_ROLE");
    bytes32 public constant CANDIDATE_ROLE = keccak256("CANDIDATE_ROLE"); // Role for registered candidates
    // The ElectionOfficer might also need permissions here
    // bytes32 public constant ELECTION_OFFICER_ROLE = keccak256("ELECTION_OFFICER_ROLE");

    // Struct to hold candidate information
    struct Candidate {
        address candidateAddress;
        string ipfsHash; // IPFS hash for candidate manifesto/information
        bool isVerified;
        uint256 registrationTimestamp;
    }

    // Mapping from candidate address to Candidate struct
    mapping(address => Candidate) private candidates;

    // Event for candidate registration
    event CandidateRegistered(address indexed candidateAddress, string ipfsHash, uint256 registrationTimestamp);

    // Event for candidate info update
    event CandidateInfoUpdated(address indexed candidateAddress, string oldIpfsHash, string newIpfsHash);

    // Event for candidate verification status update
    event CandidateVerificationStatusUpdated(address indexed candidateAddress, bool isVerified);

    constructor() payable {
        // Grant the deployer the DEFAULT_ADMIN_ROLE and CANDIDATE_MANAGER_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CANDIDATE_MANAGER_ROLE, msg.sender);
        // CANDIDATE_ROLE is granted when a candidate is registered
    }

    /**
     * @dev Registers a new candidate.
     * Only accounts with the CANDIDATE_MANAGER_ROLE can call this function.
     * @param _candidateAddress The wallet address of the candidate.
     * @param _ipfsHash The IPFS hash pointing to the candidate's information.
     */
    function registerCandidate(address _candidateAddress, string memory _ipfsHash) public onlyRole(CANDIDATE_MANAGER_ROLE) whenNotPaused {
        require(_candidateAddress != address(0), "Invalid candidate address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(candidates[_candidateAddress].registrationTimestamp == 0, "Candidate already registered");

        candidates[_candidateAddress] = Candidate({
            candidateAddress: _candidateAddress,
            ipfsHash: _ipfsHash,
            isVerified: false, // Candidates are not verified by default upon registration
            registrationTimestamp: block.timestamp
        });

        // Grant CANDIDATE_ROLE to the registered candidate address
        _grantRole(CANDIDATE_ROLE, _candidateAddress);

        emit CandidateRegistered(_candidateAddress, _ipfsHash, block.timestamp);
    }

    /**
     * @dev Updates the IPFS hash for an existing candidate.
     * Only accounts with the CANDIDATE_MANAGER_ROLE or the candidate themselves can call this function.
     * @param _candidateAddress The wallet address of the candidate.
     * @param _newIpfsHash The new IPFS hash.
     */
    function updateCandidateInfo(address _candidateAddress, string memory _newIpfsHash) public whenNotPaused {
        require(candidates[_candidateAddress].registrationTimestamp != 0, "Candidate not found");
        require(bytes(_newIpfsHash).length > 0, "New IPFS hash cannot be empty");
        require(hasRole(CANDIDATE_MANAGER_ROLE, msg.sender) || _candidateAddress == msg.sender, "Caller is not manager or the candidate");

        string memory oldIpfsHash = candidates[_candidateAddress].ipfsHash;
        candidates[_candidateAddress].ipfsHash = _newIpfsHash;

        emit CandidateInfoUpdated(_candidateAddress, oldIpfsHash, _newIpfsHash);
    }

     /**
     * @dev Updates the verification status of a candidate.
     * Only accounts with the CANDIDATE_MANAGER_ROLE can call this function.
     * @param _candidateAddress The wallet address of the candidate.
     * @param _isVerified The new verification status.
     */
    function verifyCandidateEligibility(address _candidateAddress, bool _isVerified) public onlyRole(CANDIDATE_MANAGER_ROLE) whenNotPaused {
        require(candidates[_candidateAddress].registrationTimestamp != 0, "Candidate not found");
        // TODO: Implement access control: ensure only authorized verifiers can call this
        // (CANDIDATE_MANAGER_ROLE is used for now as per requirements, could be ELECTION_OFFICER_ROLE)

        candidates[_candidateAddress].isVerified = _isVerified;

        emit CandidateVerificationStatusUpdated(_candidateAddress, _isVerified);
    }

    /**
     * @dev Retrieves the information of a registered candidate.
     * Anyone can call this function.
     * @param _candidateAddress The wallet address of the candidate.
     * @return Candidate struct containing candidate details.
     */
    function getCandidateInfo(address _candidateAddress) public view returns (Candidate memory) {
        require(candidates[_candidateAddress].registrationTimestamp != 0, "Candidate not found");
        return candidates[_candidateAddress];
    }

    /**
     * @dev Checks the verification status of a candidate.
     * Anyone can call this function.
     * @param _candidateAddress The wallet address of the candidate.
     * @return bool True if the candidate is verified, false otherwise.
     */
    function isCandidateVerified(address _candidateAddress) public view returns (bool) {
        require(candidates[_candidateAddress].registrationTimestamp != 0, "Candidate not found");
        return candidates[_candidateAddress].isVerified;
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

    // TODO: Add more comprehensive access control based on roles
    // TODO: Add reentrancy guards where necessary

} 