require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Load environment variables from .env file
const { REACT_APP_INFURA_API_KEY, REACT_APP_PRIVATE_KEY } = process.env;

module.exports = {
  networks: {
    polygonAmoy: {
      provider: () => new HDWalletProvider(
        REACT_APP_PRIVATE_KEY,
        `https://polygon-amoy.infura.io/v3/${REACT_APP_INFURA_API_KEY}`
      ),
      network_id: 80002,
      gas: 8000000,
      gasPrice: 30000000000,
      confirmations: 2,
      timeoutBlocks: 2000,
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: "0.8.9",
    },
  },
  contracts_build_directory: './src/components/artifacts',
};
