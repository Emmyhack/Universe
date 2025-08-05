export const config = {
  // Network Configuration
  network: {
    id: import.meta.env.VITE_NETWORK_ID || '31337',
    rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
    chainName: import.meta.env.VITE_CHAIN_NAME || 'Hardhat',
  },

  // Contract Addresses
  contracts: (() => {
    try {
      return JSON.parse(import.meta.env.VITE_CONTRACT_ADDRESSES || '{}');
    } catch {
      return {
        universityRegistry: '',
        electionFactory: '',
        candidateRegistry: '',
        verificationMerkle: '',
        zkVerifier: '',
      };
    }
  })(),

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'UniVote',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Decentralized University Elections',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  },

  // Security Configuration
  security: {
    https: import.meta.env.VITE_ENABLE_HTTPS === 'true',
    cors: import.meta.env.VITE_ENABLE_CORS === 'true',
  },
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;