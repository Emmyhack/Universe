#!/bin/bash
set -e

echo "🚀 Completing ZK setup (skipping compilation and ptau generation)..."

# Use locally installed snarkjs
SNARKJS="./node_modules/.bin/snarkjs"

# Check if tools are available
if [ ! -f "$SNARKJS" ]; then
    echo "❌ snarkjs not found. Please run: npm install --save-dev snarkjs"
    exit 1
fi

# Create necessary directories
mkdir -p zk/public/zk
mkdir -p public/zk

# Check if required files exist
if [ ! -f zk/vote_verification.r1cs ]; then
    echo "❌ Circuit file not found. Please run the full setup first."
    exit 1
fi

if [ ! -f zk/pot14_final.ptau ]; then
    echo "❌ Ptau file not found. Please run the full setup first."
    exit 1
fi

echo "✅ Using existing circuit and ptau files"

# 1. Groth16 setup
echo "🔧 Running Groth16 trusted setup..."
$SNARKJS groth16 setup zk/vote_verification.r1cs zk/pot14_final.ptau zk/public/zk/vote_verification_0000.zkey
$SNARKJS zkey contribute zk/public/zk/vote_verification_0000.zkey zk/public/zk/vote_verification_final.zkey --name="UniVote" -v

# 2. Export verification key
echo "🔑 Exporting verification key..."
$SNARKJS zkey export verificationkey zk/public/zk/vote_verification_final.zkey zk/public/zk/verification_key.json

# 3. Generate Solidity verifier
echo "🔑 Generating Solidity verifier..."
$SNARKJS zkey export solidityverifier zk/public/zk/vote_verification_final.zkey contracts/Verifier.sol

# 4. Move files to frontend
echo "📁 Moving files to frontend..."
cp zk/vote_verification_js/vote_verification.wasm public/zk/vote_verification.wasm
cp zk/public/zk/vote_verification_final.zkey public/zk/vote_verification.zkey
cp zk/public/zk/verification_key.json public/zk/verification_key.json

echo "✅ ZK setup complete! Files are in public/zk/"
echo "📋 Generated files:"
echo "   - public/zk/vote_verification.wasm"
echo "   - public/zk/vote_verification.zkey"
echo "   - public/zk/verification_key.json"
echo "   - contracts/Verifier.sol" 