# UniVote Platform - Deployment Guide

This guide covers deploying the UniVote platform to production environments.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- MetaMask or Web3 wallet
- Hardhat (for smart contract deployment)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd univote-platform
npm install
cd frontend && npm install
```

### 2. Deploy Smart Contracts
```bash
# Start local blockchain (optional)
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network <network>
```

### 3. Configure Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your contract addresses
```

### 4. Start Development
```bash
# Start frontend
npm run dev

# Start backend (if needed)
npm run dev:backend
```

## 🏗️ Smart Contract Deployment

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### Testnet Deployment (Sepolia)
```bash
# Set up environment
export PRIVATE_KEY=your_private_key
export INFURA_URL=your_infura_url

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

### Mainnet Deployment
```bash
# Set up environment
export PRIVATE_KEY=your_private_key
export INFURA_URL=your_infura_url

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

## 🌐 Frontend Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

### Netlify Deployment
```bash
# Build the project
cd frontend
npm run build

# Deploy dist/ folder to Netlify
```

### Docker Deployment
```bash
# Build Docker image
docker build -t univote-frontend .

# Run container
docker run -p 3000:3000 univote-frontend
```

## 🔧 Environment Configuration

### Frontend Environment Variables
Create `.env` file in frontend directory:

```env
# Network Configuration
VITE_NETWORK_ID=1
VITE_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
VITE_CHAIN_NAME=Ethereum

# Contract Addresses (Update after deployment)
VITE_CONTRACT_ADDRESSES={"universityRegistry":"0x...","electionFactory":"0x...","candidateRegistry":"0x...","verificationMerkle":"0x...","zkVerifier":"0x..."}

# Application Configuration
VITE_APP_NAME=UniVote
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/univote

# Blockchain
PRIVATE_KEY=your_private_key
INFURA_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## 🔒 Security Configuration

### SSL/HTTPS Setup
```bash
# For production, always use HTTPS
VITE_ENABLE_HTTPS=true
```

### CORS Configuration
```javascript
// Configure CORS for your domain
VITE_ENABLE_CORS=true
```

### Environment-Specific Settings

#### Development
```env
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=true
VITE_NETWORK_ID=31337
```

#### Staging
```env
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_NETWORK_ID=11155111  # Sepolia
```

#### Production
```env
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_NETWORK_ID=1  # Ethereum Mainnet
VITE_ENABLE_ANALYTICS=true
```

## 📊 Monitoring and Analytics

### Application Monitoring
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: Sentry, LogRocket
- **Blockchain**: Etherscan, The Graph

### Performance Monitoring
```bash
# Build analysis
npm run build:analyze

# Performance testing
npm run test:performance
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy UniVote

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🧪 Testing

### Smart Contract Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test test/Election.test.ts

# Run with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📈 Performance Optimization

### Frontend Optimization
```bash
# Analyze bundle size
npm run build:analyze

# Optimize images
npm run optimize:images

# Minify assets
npm run build:minify
```

### Smart Contract Optimization
```bash
# Gas optimization
npx hardhat run scripts/optimize-gas.ts

# Size optimization
npx hardhat run scripts/optimize-size.ts
```

## 🚨 Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check network configuration
npx hardhat console --network <network>

# Verify contract addresses
npx hardhat verify --network <network> <contract-address>
```

#### Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

#### Wallet Connection Issues
- Ensure MetaMask is installed
- Check network configuration
- Verify contract addresses

### Debug Mode
```bash
# Enable debug logging
VITE_ENABLE_DEBUG_MODE=true

# Check browser console for errors
# Check network tab for failed requests
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review error logs
3. Create an issue on GitHub
4. Contact the development team

## 🔄 Updates and Maintenance

### Updating Smart Contracts
```bash
# Deploy new contracts
npx hardhat run scripts/deploy.ts --network <network>

# Update frontend contract addresses
# Update .env file with new addresses
```

### Updating Frontend
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install
cd frontend && npm install

# Build and deploy
npm run build
```

---

**Note**: Always test deployments in staging environments before production deployment.