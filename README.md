# UniVote: Decentralized University Voting Platform

UniVote is a decentralized application (dApp) for managing university elections on the blockchain. It leverages smart contracts for transparent, secure, and auditable voting, supporting eligibility verification, candidate management, and zero-knowledge proof-based privacy for votes. The platform features a modern UI, multi-wallet support, and modular ZK integration.

## Features
- **University Registry:** Register and manage universities and their administrators (pre-populated and manual registration supported).
- **Election Factory:** Propose, approve, and deploy new elections for registered universities.
- **Election Contract:** Handles candidate registration, voting, tallying, and result publication for each election.
- **Candidate Registry:** Global registry for candidate information and verification.
- **VerificationMerkle:** Merkle tree-based eligibility verification for student voters.
- **Zero-Knowledge Proofs:** Pluggable ZK verification for private and valid voting (Circom circuits, SnarkJS tooling).
- **Role-Based Access Control:** Fine-grained permissions for admins, officers, candidates, and verifiers.
- **Pausable & Upgradeable:** Emergency stop and future extensibility.
- **Modern UI/UX:** Responsive layout, sidebar navigation, and per-university branding (logo upload supported).
- **Multi-Wallet Support:** Modal-based wallet selector with MetaMask, KaiWallet, Coinbase Wallet, Brave Wallet, and WalletConnect (with install links and detection).

## Smart Contract Architecture

- **UniversityRegistry.sol**: Registers universities, manages their status and admin wallets.
- **CandidateRegistry.sol**: Registers and verifies candidates globally.
- **VerificationMerkle.sol**: Maintains a Merkle root for eligible voters and verifies proofs.
- **ElectionFactory.sol**: Proposes and approves new elections, deploying Election contracts for each.
- **Election.sol**: Manages the full lifecycle of an election (registration, voting, tally, results).
- **IZKVerifier.sol**: Interface for pluggable ZK proof verification.

## Directory Structure

- `contracts/` — Solidity smart contracts
- `components/` — React components (layout, wallet selector, providers, ZK, contracts)
- `app/` — Next.js app directory (pages, layout, styles)
- `zk/` — Zero-knowledge proof circuits and setup scripts
- `vote_verification_js/` — Witness generation and ZK tooling (JS)
- `vote_verification_cpp/` — Native witness generation (C++)
- `test/` — Unit and integration tests
- `scripts/` — Deployment and utility scripts

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- [Hardhat](https://hardhat.org/)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root with:
```
KAIA_RPC_URL=<your_rpc_url>
PRIVATE_KEY=<your_private_key>
```
These are used for network deployments. For local testing, they are not required.

## Deployment

You can deploy all contracts locally or to a testnet using Hardhat:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network <network>
```

The deployment script (`scripts/deploy.ts`) deploys all core contracts in the correct order and prints their addresses.

## Testing

Run the full integration test suite:
```bash
npx hardhat test
```

The integration tests in `test/integration/ElectionFlow.test.ts` cover:
- University registration (pre-populated and manual)
- Election proposal, approval, and deployment
- Candidate registration and verification
- Merkle root updates and eligibility checks
- Full election lifecycle: registration, voting, tally, and results
- Role-based access control and negative cases

## UI/UX Highlights
- **Sidebar Navigation:** Responsive sidebar for easy access to all sections.
- **Flexible Branding:** Default academic cap icon, with support for per-university custom logos (upload via UI).
- **Wallet Selector Modal:** Modern modal for wallet connection, with detection and install links for MetaMask, KaiWallet, Coinbase Wallet, Brave Wallet, and WalletConnect.
- **Landing Page:** Hero section, feature highlights, and call-to-action.
- **Consistent Theming:** Tailwind CSS for a clean, modern look.
- **Dedicated Pages:** Dashboard, Elections (with dynamic routes), Candidates, Universities, University Auth, Settings, About, and Test Wallet.

## Wallet Support
- **MetaMask:** Fully supported (dedicated connect button and modal integration).
- **KaiWallet:** Detected and connectable if present.
- **Coinbase Wallet, Brave Wallet, WalletConnect:** Detected and install links provided; connection logic extensible.
- **WalletSelector:** Modal-based, with icons, install links, and browser extension detection.

## Zero-Knowledge Proofs (ZK)
- **Circuits:** Circom-based ZK circuits for vote privacy and validity (`zk/vote_verification.circom`).
- **Setup:** Scripts and tooling for trusted setup and proof generation (`zk/`, `vote_verification_js/`, `vote_verification_cpp/`).
- **Integration:** Pluggable ZK verifier interface in smart contracts; frontend components for proof generation and verification.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Headless UI, Heroicons, React Hot Toast
- **Blockchain:** Solidity, Hardhat, Ethers.js, Wagmi, Viem
- **ZK Proofs:** Circom, SnarkJS, Circomlib, MerkleTreeJS, witness generation (JS/C++)
- **Testing:** Hardhat, TypeScript, Jest

## Security Notes

### Test-Only Admin Role Grant

**Warning: Test-Only Code!**

For integration testing purposes, the `ElectionFactory` contract has been temporarily modified to grant the `DEFAULT_ADMIN_ROLE` to the proposer (test account) after deploying a new `Election` contract. This is done automatically in the `approveElection` function:

```
// TEST ONLY: Grant DEFAULT_ADMIN_ROLE to the proposer (or test account)
// REMOVE THIS IN PRODUCTION!
bytes32 defaultAdminRole = newElection.DEFAULT_ADMIN_ROLE();
newElection.grantRole(defaultAdminRole, proposal.proposer);
```

This change allows test accounts to perform privileged actions (such as cancelling elections) that would otherwise be restricted to the factory contract. **This code must be removed before deploying to production to maintain proper access control and security.**

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
