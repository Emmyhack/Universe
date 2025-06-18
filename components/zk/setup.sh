#!/bin/bash
set -e

# 1. Compile circuit
circom vote_verification.circom --r1cs --wasm --sym

# 2. Download ptau if needed
if [ ! -f pot12_final.ptau ]; then
  wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
fi

# 3. Groth16 setup
snarkjs groth16 setup vote_verification.r1cs pot12_final.ptau vote_verification_0000.zkey
snarkjs zkey contribute vote_verification_0000.zkey vote_verification_final.zkey --name="UniVote ZK" -v

# 4. Export verification key
snarkjs zkey export verificationkey vote_verification_final.zkey verification_key.json

# 5. Move files to frontend
mkdir -p ../public/zk
cp vote_verification_js/vote_verification.wasm ../public/zk/vote_verification.wasm
cp vote_verification_final.zkey ../public/zk/vote_verification.zkey

echo \"ZK setup complete! Files are in public/zk/\"