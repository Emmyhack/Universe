# UniVote Platform

> **Decentralized University Election Platform with Zero-Knowledge Proofs**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.24.1-orange.svg)](https://hardhat.org/)

## 🎯 Overview

UniVote is a revolutionary decentralized platform that enables secure, transparent, and privacy-preserving university elections using blockchain technology and zero-knowledge proofs. The platform ensures vote integrity while maintaining complete voter anonymity.

### ✨ Key Features

- **🔐 Privacy-Preserving Voting**: Zero-knowledge proofs ensure vote privacy
- **🏛️ Role-Based Access Control**: Granular permissions for different user roles
- **🌳 Merkle Tree Verification**: Secure student eligibility verification
- **⚡ Real-Time Results**: Transparent and tamper-proof election results
- **🎨 Modern UI/UX**: Professional and intuitive user interface
- **🔒 Security First**: Comprehensive security measures and audits

## 🏗️ Architecture

### Smart Contracts

The platform consists of five core smart contracts:

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| `ElectionFactory.sol` | Election creation and management | Proposal system, DAO approval |
| `Election.sol` | Individual election logic | Voting, tallying, results |
| `UniversityRegistry.sol` | University management | Registration, admin control |
| `CandidateRegistry.sol` | Candidate management | Registration, verification |
| `VerificationMerkle.sol` | Student verification | Merkle tree, eligibility proofs |

### Frontend Application

Built with modern web technologies:

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Ethers.js** for blockchain interaction
- **React Hook Form** with Zod validation
- **Framer Motion** for smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/univote/univote-platform.git
   cd univote-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Smart contract development
   npm run compile
   npm run test
   
   # Terminal 2: Frontend development
   npm run frontend:dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Hardhat Network: http://localhost:8545

## 📚 Documentation

### User Guides

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Complete setup instructions
- **[User Manual](docs/USER_MANUAL.md)** - How to use the platform
- **[Security Guide](docs/SECURITY_GUIDE.md)** - Security best practices

### Developer Documentation

- **[Smart Contract Documentation](docs/SMART_CONTRACTS.md)** - Contract architecture and APIs
- **[Frontend Documentation](docs/FRONTEND.md)** - React components and hooks
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation

### Deployment

- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Security Audit](SECURITY_AUDIT.md)** - Comprehensive security assessment
- **[Project Summary](PROJECT_SUMMARY.md)** - Complete project overview

## 🔧 Development

### Project Structure

```
univote-platform/
├── contracts/                 # Smart contracts
│   ├── interfaces/           # Contract interfaces
│   ├── mocks/               # Mock implementations
│   └── *.sol               # Core contracts
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── scripts/                # Deployment scripts
├── test/                   # Test files
│   └── integration/       # Integration tests
└── docs/                  # Documentation
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run all tests |
| `npm run deploy` | Deploy contracts |
| `npm run frontend:dev` | Start frontend development server |
| `npm run frontend:build` | Build frontend for production |
| `npm run install:all` | Install all dependencies |

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/Election.test.ts

# Run with coverage
npx hardhat coverage
```

## 🔐 Security Features

### Smart Contract Security

- **Access Control**: Role-based permissions using OpenZeppelin
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Emergency Controls**: Pausable contracts for emergencies
- **Safe Math**: Built-in overflow protection (Solidity 0.8.20+)

### Cryptographic Security

- **Merkle Trees**: Secure student eligibility verification
- **Zero-Knowledge Proofs**: Privacy-preserving vote verification
- **Vote Encryption**: Encrypted vote transmission
- **Keccak256 Hashing**: Industry-standard hashing algorithm

### Frontend Security

- **Wallet Integration**: Secure MetaMask connection
- **Input Sanitization**: XSS and CSRF protection
- **Environment Security**: Proper configuration management
- **HTTPS Enforcement**: Secure communication protocols

## 👥 User Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| **Student** | Vote in elections | Eligible voters |
| **Candidate** | Register candidacy | Election participants |
| **Election Officer** | Create/manage elections | Election administration |
| **University Admin** | Manage university settings | Institutional control |
| **Registrar** | Register universities | System administration |
| **DAO Member** | Approve elections | Governance participation |
| **Default Admin** | System-wide control | Platform administration |

## 🎨 User Interface

### Design Principles

- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design approach
- **Intuitive**: Clear navigation and user flows
- **Professional**: Modern, clean aesthetic
- **Accessible**: Support for screen readers and keyboard navigation

### Key Components

- **Dashboard**: Overview and quick actions
- **Election Management**: Create and manage elections
- **Voting Interface**: Secure vote casting
- **Results Display**: Transparent result presentation
- **Admin Panel**: System administration tools

## 🔄 Development Workflow

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

### Testing Strategy

- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow testing
- **Security Tests**: Access control and vulnerability testing
- **UI Tests**: Component and user interaction testing

### Deployment Pipeline

1. **Development**: Local development with Hardhat
2. **Testing**: Comprehensive test suite execution
3. **Staging**: Testnet deployment and validation
4. **Production**: Mainnet deployment with monitoring

## 📊 Performance

### Smart Contracts

- **Gas Optimization**: Efficient contract design
- **Batch Operations**: Reduced transaction costs
- **Storage Optimization**: Minimal on-chain data storage
- **Caching**: Off-chain data caching strategies

### Frontend Application

- **Code Splitting**: Dynamic imports for optimization
- **Lazy Loading**: Component-level lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **CDN Integration**: Static asset delivery optimization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Report bugs via [GitHub Issues](https://github.com/univote/univote-platform/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/univote/univote-platform/discussions)
- **Security**: Report security issues to security@univote.com

### Community

- **Discord**: Join our [Discord server](https://discord.gg/univote)
- **Twitter**: Follow [@UniVotePlatform](https://twitter.com/UniVotePlatform)
- **Blog**: Read our [blog](https://blog.univote.com)

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat**: For the excellent development framework
- **React Team**: For the amazing frontend framework
- **Ethereum Community**: For blockchain innovation

---

**Built with ❤️ by the UniVote Team**

*Empowering democratic participation through blockchain technology*
