pragma circom 2.1.4;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/merkle.circom";

template VoteVerification(depth) {
    // Public inputs
    signal input electionId;
    signal input candidate;
    signal input merkleRoot;

    // Private inputs
    signal input voterSecret;
    signal input voterLeaf;
    signal input merklePath[depth];
    signal input merklePathPos[depth];

    // Check Merkle proof
    component mp = MerkleProof(depth);
    mp.leaf <== voterLeaf;
    for (var i = 0; i < depth; i++) {
        mp.pathElements[i] <== merklePath[i];
        mp.pathIndices[i] <== merklePathPos[i];
    }
    mp.root === merkleRoot;

    // Hash the vote (for privacy)
    component hasher = Poseidon(3);
    hasher.inputs[0] <== candidate;
    hasher.inputs[1] <== electionId;
    hasher.inputs[2] <== voterSecret;

    // Output the vote hash as a public signal
    signal output voteHash;
    voteHash <== hasher.out;
}

component main = VoteVerification(32);