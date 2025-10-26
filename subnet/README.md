# Next.js HBAR Subnet Integration

This project demonstrates how to create and manage an HBAR subnet using a Next.js application. It provides a user-friendly interface for interacting with the HBAR network, allowing users to create subnets and blockchains seamlessly.

## Project Structure

The project is organized as follows:

```
nextjs-HBAR-subnet
├── src
│   ├── app
│   │   ├── layout.tsx          # Layout component for the application
│   │   ├── page.tsx            # Main entry point for the application
│   │   └── api
│   │       └── HBAR
│   │           ├── createSubnet.route.ts  # API route for creating a subnet
│   │           └── createChain.route.ts   # API route for creating a blockchain
│   ├── components
│   │   ├── WalletConnect.tsx   # Component for wallet connection
│   │   └── SubnetDashboard.tsx  # Component for displaying subnet information
│   ├── lib
│   │   ├── HBAR
│   │   │   ├── client.ts        # HBAR client initialization
│   │   │   └── txHelpers.ts     # Transaction helper functions
│   │   └── hooks
│   │       └── useWallet.ts     # Custom hook for wallet management
│   ├── styles
│   │   └── globals.css          # Global CSS styles
│   └── types
│       └── index.d.ts           # TypeScript types and interfaces
├── subnet
│   ├── config
│   │   └── subnet-config.json    # Subnet configuration settings
│   ├── genesis
│   │   └── genesis.json          # Genesis block configuration
│   └── scripts
│       ├── create_subnet.sh      # Script to create a new subnet
│       └── deploy_chain.sh       # Script to deploy a new blockchain
├── scripts
│   ├── fund_pchain.ts            # Script to fund the P-Chain
│   └── sign_tx.ts                # Script to sign transactions
├── infra
│   ├── docker
│   │   └── docker-compose.yml     # Docker configuration for HBAR node
│   └── terraform
│       └── main.tf                # Terraform configuration for infrastructure
├── tools
│   ├── go
│   │   └── example_client.go      # Example client for HBAR network
│   └── README_SCRIPTS.md          # Documentation for available scripts
├── public
├── package.json                   # npm configuration file
├── tsconfig.json                  # TypeScript configuration file
├── next.config.js                 # Next.js configuration file
└── README.md                      # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- HBAR node (local or remote)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd nextjs-HBAR-subnet
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server, run:
```
npm run dev
```
The application will be available at `http://localhost:3000`.

### Creating a Subnet

To create a new HBAR subnet, navigate to the appropriate API route in your application. The backend will handle the subnet creation using the HBAR SDK.

### Creating a Blockchain

Once the subnet is created, you can create a blockchain within it by accessing the corresponding API route.

### Testing

You can test the application by connecting your wallet and interacting with the subnet and blockchain functionalities.

## Resources

- [HBAR Documentation](https://docs.HBAR.network/)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

Feel free to submit issues or pull requests to improve the project. Contributions are welcome!

## License

This project is licensed under the MIT License. See the LICENSE file for details.