import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Get projectId from environment variables with fallback
export const projectId = process.env.REOWN_PROJECT_ID || "ff7e4c6da87929d965ceb31b6a72924c";
console.log("Project ID:", projectId , process.env.REOWN_PROJECT_ID); 




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
export const U2UMainnet = {
  id: 39,
  name: "U2U Network Solaris",
  chainNamespace: "eip155",
  nativeCurrency: { name: "U2U", symbol: "U2U", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.u2u.xyz", "https://rpc-tracer-mainnet.u2u.xyz"]
    },
    public: {
      http: ["https://rpc-mainnet.u2u.xyz", "https://rpc-tracer-mainnet.u2u.xyz"]
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Mainnet Explorer",
      url: "https://u2uscan.xyz",
    },
  },
}

export const networks = [ u2uTestnet, U2UMainnet];

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
