// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DummyZKVerifier
 * @dev Mock implementation for testing ZK proof verification
 * @notice This contract is for testing purposes only and always returns true
 */
contract DummyZKVerifier {
    /**
     * @notice Mock ZK proof verification - always returns true
     * @dev For testing purposes only - never use in production
     */
    function verifyProof(
        bytes memory /* _proof */,
        bytes memory /* _publicInputs */
    ) public pure returns (bool) {
        return true;
    }
    
    /**
     * @notice Mock transaction verification - always returns true
     * @dev For testing purposes only - never use in production
     */
    function verifyTx(
        uint[2] memory /* a */,
        uint[2][2] memory /* b */,
        uint[2] memory /* c */,
        uint[1] memory /* input */
    ) public pure returns (bool) {
        return true;
    }
}