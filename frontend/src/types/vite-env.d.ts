/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_NAME: string
  readonly VITE_CONTRACT_ADDRESSES: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG_MODE: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_IPFS_GATEWAY: string
  readonly VITE_ENABLE_HTTPS: string
  readonly VITE_ENABLE_CORS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: any
}