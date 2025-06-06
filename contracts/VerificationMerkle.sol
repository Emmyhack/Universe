// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
// Import MerkleProof library if using OpenZeppelin's implementation
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VerificationMerkle is AccessControl, Pausable {

    // Define roles for managing student verification
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // The current Merkle root for verified students
    bytes32 public currentMerkleRoot;

    // Mapping to track if a student address has been verified (optional, depending on verification flow)
    // If verification status is only checked against the current root, this mapping might not be needed.
    // mapping(address => bool) private isStudentAddressVerified;

    // Event for Merkle root update
    event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);

    // Event for student verification (if we track verification status on-chain)
    // event StudentVerified(address indexed studentAddress, bytes32 merkelProof);

    constructor() payable {
        // Grant the deployer the DEFAULT_ADMIN_ROLE and VERIFIER_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Updates the current Merkle root.
     * Only accounts with the VERIFIER_ROLE can call this function.
     * @param _newMerkleRoot The new Merkle root.
     */
    function updateMerkleRoot(bytes32 _newMerkleRoot) public onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(_newMerkleRoot != bytes32(0), "Merkle root cannot be zero");
        emit MerkleRootUpdated(currentMerkleRoot, _newMerkleRoot);
        currentMerkleRoot = _newMerkleRoot;
    }

    /**
     * @dev Verifies if a student is eligible using a Merkle proof.
     * This function is called by external entities (like the Election contract) to verify a student's eligibility.
     * The Merkle proof and leaf are generated off-chain.
     * @param _studentAddress The wallet address of the student.
     * @param _merkleProof The Merkle proof for the student's address/identifier.
     * @param _leaf The leaf node used in the Merkle tree (e.g., hash of student ID or address).
     * @return bool True if the student is verifiable with the given proof and current root, false otherwise.
     */
    function verifyStudent(
        address _studentAddress,
        bytes32[] memory _merkleProof,
        bytes32 _leaf
    ) public view returns (bool) {
        require(_studentAddress != address(0), "Invalid student address");
        require(currentMerkleRoot != bytes32(0), "Merkle root is not set");
        // Implement Merkle proof verification logic using OpenZeppelin's MerkleProof library
        return MerkleProof.verify(_merkleProof, currentMerkleRoot, _leaf);
    }

    /**
     * @dev Checks if a student address has been verified against the current Merkle root.
     * This function is essentially an alias for `verifyStudent` when checking against the latest root.
     * @param _studentAddress The wallet address of the student.
     * @param _merkleProof The Merkle proof for the student's address.
     * @param _leaf The leaf node used in the Merkle tree.
     * @return bool True if the student is currently verifiable with the given proof, false otherwise.
     */
    function isStudentVerified(
        address _studentAddress,
        bytes32[] memory _merkleProof,
        bytes32 _leaf
    ) public view returns (bool) {
        require(_studentAddress != address(0), "Invalid student address");
        // This function relies on verifyStudent for the actual proof check.
        return verifyStudent(_studentAddress, _merkleProof, _leaf);
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

}
