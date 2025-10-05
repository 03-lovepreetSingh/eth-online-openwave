// This file defines TypeScript types and interfaces used throughout the application. 

interface SubnetConfig {
    subnetId: number;
    tokenSymbol: string;
    vmType: string;
    gasFee: {
        lowDiskUse: boolean;
        lowThroughput: boolean;
    };
}

interface BlockchainConfig {
    chainId: number;
    subnetId: number;
    vmId: string;
    genesisData: object;
}

interface WalletConnection {
    address: string;
    connected: boolean;
}

interface Transaction {
    id: string;
    status: string;
    type: 'CreateSubnetTx' | 'CreateChainTx';
    timestamp: number;
}

interface AirdropConfig {
    recipient: string;
    amount: number;
}