import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, sepolia, hederaTestnet } from "wagmi/chains";

// Get projectId from environment variables with fallback
export const projectId = process.env.REOWN_PROJECT_ID || "ff7e4c6da87929d965ceb31b6a72924c";
console.log("Project ID:", projectId , process.env.REOWN_PROJECT_ID);

// Export hederaTestnet for use in other files
export { hederaTestnet };




export const HBARTestnet = {
  id: 2484,
  name: "HBAR Network Nebulas",
  chainNamespace: "eip155",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-nebulas-testnet.HBAR.xyz"]
    },
    public: {
      http: ["https://rpc-nebulas-testnet.HBAR.xyz"],
    },
  
  },
  blockExplorers: {
    default: {
      name: "HBAR Nebulas Testnet Explorer",
      url: "https://testnet.HBARscan.xyz",
    },
  },
}
export const HBARMainnet = {
  id: 39,
  name: "HBAR Network Solaris",
  chainNamespace: "eip155",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.HBAR.xyz", "https://rpc-tracer-mainnet.HBAR.xyz"]
    },
    public: {
      http: ["https://rpc-mainnet.HBAR.xyz", "https://rpc-tracer-mainnet.HBAR.xyz"]
    },
  },
  blockExplorers: {
    default: {
      name: "HBAR Mainnet Explorer",
      url: "https://HBARscan.xyz",
    },
  },
}

export const networks = [mainnet, sepolia, HBARTestnet, HBARMainnet ,hederaTestnet];

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

// Metadata for the app
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia, HBARTestnet, HBARMainnet, hederaTestnet],
  defaultNetwork: hederaTestnet,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
});
