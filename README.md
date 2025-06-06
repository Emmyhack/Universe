# UniVote: Decentralized University Election Platform

UniVote is a decentralized application (dApp) for managing university elections on the blockchain. It leverages smart contracts to ensure transparent, secure, and auditable voting processes, supporting eligibility verification, candidate management, and zero-knowledge proof-based privacy for votes.

## Features
- **University Registry:** Register and manage universities and their administrators.
- **Election Factory:** Propose, approve, and deploy new elections for registered universities.
- **Election Contract:** Handles candidate registration, voting, tallying, and result publication for each election.
- **Candidate Registry:** Global registry for candidate information and verification.
- **VerificationMerkle:** Merkle tree-based eligibility verification for student voters.
- **Zero-Knowledge Proofs:** (Pluggable) ZK verification for private and valid voting.
- **Role-Based Access Control:** Fine-grained permissions for admins, officers, candidates, and verifiers.
- **Pausable & Upgradeable:** Emergency stop and future extensibility.

## Smart Contract Architecture

- **UniversityRegistry.sol**: Registers universities, manages their status and admin wallets.
- **CandidateRegistry.sol**: Registers and verifies candidates globally.
- **VerificationMerkle.sol**: Maintains a Merkle root for eligible voters and verifies proofs.
- **ElectionFactory.sol**: Proposes and approves new elections, deploying Election contracts for each.
- **Election.sol**: Manages the full lifecycle of an election (registration, voting, tally, results).
- **IZKVerifier.sol**: Interface for pluggable ZK proof verification.

## Directory Structure

- `contracts/` — Solidity smart contracts
- `scripts/` — Deployment and utility scripts
- `test/integration/` — Integration tests for full election flows
- `artifacts/` — Compiled contract ABIs and build info
- `typechain-types/` — TypeScript typings for contracts

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
- University registration
- Election proposal, approval, and deployment
- Candidate registration and verification
- Merkle root updates and eligibility checks
- Full election lifecycle: registration, voting, tally, and results
- Role-based access control and negative cases

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
