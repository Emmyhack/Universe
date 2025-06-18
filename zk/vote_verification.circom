pragma circom 2.1.4;

include "poseidon.circom";
include "smt/smtverifier.circom";

// depth should match the tree depth used in your application
template VoteVerification(depth) {
    // Public inputs
    signal input electionId;
    signal input candidate;
    signal input merkleRoot;

    // Private inputs
    signal input voterSecret;
    signal input voterLeaf;
    signal input merklePathElements[depth];
    signal input merklePathIndices[depth];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input key;
    signal input value;
    signal input fnc; // 0 for inclusion, 1 for non-inclusion

    // Check SMT Merkle proof
    component smt = SMTVerifier(depth);
    smt.enabled <== 1;
    smt.root <== merkleRoot;
    smt.siblings <== merklePathElements;
    smt.oldKey <== oldKey;
    smt.oldValue <== oldValue;
    smt.isOld0 <== isOld0;
    smt.key <== key;
    smt.value <== value;
    smt.fnc <== fnc;

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