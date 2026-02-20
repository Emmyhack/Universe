// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZKVerifier {
    /**
     * @notice Verifies a zero-knowledge proof
     * @param _proof The proof data to verify
     * @param _publicInputs The public inputs for verification
     * @return True if the proof is valid, false otherwise
     * @dev Future versions may include additional verification functions
     */
    function verifyProof(
        bytes memory _proof,
        bytes memory _publicInputs
    ) external view returns (bool);
} 