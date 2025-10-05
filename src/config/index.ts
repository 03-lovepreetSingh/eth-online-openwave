import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Get projectId from environment variables with fallback
export const projectId = `ff7e4c6da87929d965ceb31b6a72924c`;

export const U2UTestnet = {
  id: 545,
  name: "U2U EVM Testnet",
  chainNamespace: "eip155",
  nativeCurrency: { name: "U2U", symbol: "U2U", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.nodes.onU2U.org/"]
    },
    public: {
      http: ["https://testnet.evm.nodes.onU2U.org/"],
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Testnet Explorer",
      url: "https://evm-testnet.U2Uscan.io/",
    },
  },
};

export const avalancheTestnet = {
  id: 43113,
  name: "Avalanche Fuji C-Chain",
  chainNamespace: "eip155",
  nativeCurrency: { name: "U2U", symbol: "U2U", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.U2U-test.network/ext/bc/C/rpc"]
    },
    public: {
      http: ["https://api.U2U-test.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Avalanche Testnet Scan",
      url: "https://subnets-test.U2U.network/c-chain",
    },
  },
}

export const u2uTestnet = {
  id: 2484,
  name: "U2U Network Nebulas",
  chainNamespace: "eip155",
  nativeCurrency: { name: "U2U", symbol: "U2U", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-nebulas-testnet.u2u.xyz"]
    },
    public: {
      http: ["https://rpc-nebulas-testnet.u2u.xyz"],
    },
  
  },
  blockExplorers: {
    default: {
      name: "U2U Nebulas Testnet Explorer",
      url: "https://testnet.u2uscan.xyz",
    },
  },
}

export const networks = [U2UTestnet, avalancheTestnet, u2uTestnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || "demo-project-id", // Ensure we always have a fallback
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
