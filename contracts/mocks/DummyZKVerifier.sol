// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DummyZKVerifier {
    function verifyProof(
        bytes memory /* _proof */,
        bytes memory /* _publicInputs */
    ) public pure returns (bool) {
        return true; // Always return true for testing
    }
    
    function verifyTx(
        uint[2] memory /* a */,
        uint[2][2] memory /* b */,
        uint[2] memory /* c */,
        uint[1] memory /* input */
    ) public pure returns (bool) {
        return true; // Always return true for testing
    }
}