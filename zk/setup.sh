#!/bin/bash
set -e

echo "🚀 Starting ZK circuit compilation and setup..."

# Use local circom binary and locally installed snarkjs
CIRCOM="./zk/circom"
SNARKJS="./node_modules/.bin/snarkjs"

# Check if tools are available
if [ ! -f "$CIRCOM" ]; then
    echo "❌ circom binary not found. Please download it with:"
    echo "   wget https://github.com/iden3/circom/releases/download/v2.1.4/circom-linux-amd64 -O zk/circom && chmod +x zk/circom"
    exit 1
fi

if [ ! -f "$SNARKJS" ]; then
    echo "❌ snarkjs not found. Please run: npm install --save-dev snarkjs"
    exit 1
fi

# Create necessary directories
mkdir -p zk/public/zk
mkdir -p public/zk

# 1. Compile circuit
echo "📦 Compiling circuit..."
$CIRCOM zk/vote_verification.circom --r1cs --wasm --sym --c -l node_modules/circomlib/circuits

# 2. Generate ptau file locally (bypass download issues)
echo "🔧 Checking ptau file..."
if [ ! -f zk/pot14_final.ptau ]; then
    echo "📥 Creating new ptau file (power 14 for larger circuits)..."
    $SNARKJS powersoftau new bn128 14 zk/pot14_0000.ptau -v
    
    echo "📝 Contributing to ceremony..."
    echo "love" | $SNARKJS powersoftau contribute zk/pot14_0000.ptau zk/pot14_0001.ptau --name="UniVote contribution" -v
    
    echo "📝 Final contribution..."
    echo "emmanuel" | $SNARKJS powersoftau contribute zk/pot14_0001.ptau zk/pot14_final.ptau --name="Final contribution" -v
    
    echo "🔗 Adding beacon..."
    $SNARKJS powersoftau beacon zk/pot14_final.ptau zk/pot14_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10
    
    echo "⚙️ Preparing phase 2..."
    $SNARKJS powersoftau prepare phase2 zk/pot14_beacon.ptau zk/pot14_final.ptau -v
    
    echo "✅ Ptau file generated successfully!"
else
    echo "✅ Using existing zk/pot14_final.ptau file"
fi

# 3. Groth16 setup
echo "🔧 Running Groth16 trusted setup..."
$SNARKJS groth16 setup zk/vote_verification.r1cs zk/pot14_final.ptau zk/public/zk/vote_verification_0000.zkey
$SNARKJS zkey contribute zk/public/zk/vote_verification_0000.zkey zk/public/zk/vote_verification_final.zkey --name="UniVote" -v

# 4. Export verification key
echo "🔑 Exporting verification key..."
$SNARKJS zkey export verificationkey zk/public/zk/vote_verification_final.zkey zk/public/zk/verification_key.json

# 5. Generate Solidity verifier
echo "🔑 Generating Solidity verifier..."
$SNARKJS zkey export solidityverifier zk/public/zk/vote_verification_final.zkey contracts/Verifier.sol

# 6. Move files to frontend
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