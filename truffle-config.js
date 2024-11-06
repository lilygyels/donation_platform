require('dotenv').config();
const { MNEMONIC, PROJECT_ID } = process.env;
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "10.9.5.67", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "5777", // Any network (default: none)
    },
    sepolia: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://sepolia.infura.io/v3/${PROJECT_ID}`),
      network_id: 11155111, // Sepolia's id
      confirmations: 2, // # of confirmations to wait between deployments (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets)
    },
    // Add more network configurations here if needed
  },
  compilers: {
    solc: {
      version: "0.5.5", // Specify the Solidity compiler version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        // evmVersion: "byzantium" // Uncomment if you need a specific EVM version
      },
    },
  },
};

// contract address
// 0x48AAd96976F1A4018825FFBFFff39EB1Da5cc39d
