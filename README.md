
# BlockStash - Decentralized File Storage and Sharing Platform

BlockStash is a decentralized application (DApp) designed for secure file storage and sharing. Utilizing Ethereum blockchain and IPFS (InterPlanetary File System), the platform allows users to upload, manage, and share files in a decentralized, permissionless manner. The DApp is powered by Solidity smart contracts deployed on the Polygon network, and integrates with Pinata for IPFS file pinning. Users can store files securely on IPFS while interacting with the Ethereum blockchain for access control, ensuring a transparent, immutable, and tamper-proof experience.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Running the DApp](#running-the-dapp)
- [File Management](#file-management)
  - [Uploading Files](#uploading-files)
  - [Sharing Files](#sharing-files)
  - [Deleting Files](#deleting-files)
- [Security and Encryption](#security-and-encryption)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Decentralized File Storage:** Files are stored securely on IPFS via Pinata, ensuring decentralized access.
- **Blockchain-Based Access Control:** Users' files are managed through smart contracts on the Polygon blockchain, ensuring security and transparency.
- **File Encryption:** Files are encrypted before being uploaded to IPFS to ensure privacy and security.
- **Easy File Sharing:** Users can share files by making them public or private, and can also toggle access rights.
- **File Deletion:** Files can be removed both from the blockchain and IPFS.

## Tech Stack

- **Frontend:** React.js, Axios, Web3.js
- **Blockchain Network:** Polygon (Ethereum L2)
- **Smart Contracts:** Solidity, Truffle
- **Storage:** IPFS (via Pinata)
- **Authentication:** MetaMask
- **Backend APIs:** Firebase Functions
- **Hosting:** Firebase Hosting

## Getting Started

### Prerequisites

Before you can get started with BlockStash, ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MetaMask** browser extension
- **Truffle** (for contract deployment)
- **Ganache** (for local blockchain development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jainyash0007/BlockStash.git
   cd BlockStash
   ```

2. Install dependencies:
   ```bash
   cd backend/functions
   npm install
   ```

   ```bash
   cd ../../client
   npm install
   ```

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
REACT_APP_PINATA_API_KEY=<Your Pinata API Key>
REACT_APP_PINATA_SECRET_API_KEY=<Your Pinata Secret API Key>
REACT_APP_INFURA_API_KEY=<Your Infura API Key>
REACT_APP_PRIVATE_KEY=<Your wallet's private key>
REACT_APP_CONTRACT_ADDRESS=<Your deployed Proxy contract's address>
REACT_APP_STORE_KEY_API=https://your-firebase-api-url-for-storing-keys
REACT_APP_GET_KEY_API=https://your-firebase-api-url-for-getting-keys
REACT_APP_DELETE_KEY_API=https://your-firebase-api-url-for-deleting-keys
```

## Smart Contract Deployment

To deploy the smart contract on the Polygon Amoy testnet (or any Ethereum-compatible network):

1. Update the Truffle configuration (`truffle-config.js`) with your network details.
2. Compile the contracts:
   ```bash
   truffle compile
   ```
3. Deploy the contract:
   ```bash
   truffle migrate --network <your_network>
   ```

Once the contracts are deployed, update your frontend with the contract ABI from the artifacts/ folder and address in the necessary files.

## Running the DApp

To start the frontend:

```bash
npm start
```

This will open the DApp in your browser at `http://localhost:3000`. Ensure you are connected to MetaMask with the correct network and account.

## File Management

### Uploading Files

1. Connect your MetaMask wallet.
2. Select a file to upload via the **File Upload** section.
3. The file will be encrypted and uploaded to IPFS. The smart contract will store the necessary metadata on the blockchain.
4. Once uploaded, you will see the file in the **My Uploads** section.

### Sharing Files

1. Files can be made public or private by toggling the **Make Public/Private** button next to each file in the **My Uploads** section.
2. Public files can be shared via the IPFS link.

### Deleting Files

1. To delete a file, click the trash icon next to the file in the **My Uploads** section.
2. This will remove the file from IPFS (via Pinata) and delete the associated metadata from the blockchain.

## Security and Encryption

- **File Encryption:** All files are encrypted using AES-256 before being uploaded to IPFS.
- **Key Management:** Encryption keys are securely stored in Firebase Firestore, ensuring only the file owner can decrypt the file.
- **Smart Contract Security:** The smart contracts are designed with access control mechanisms to prevent unauthorized access to files.

## Troubleshooting

### MetaMask Connection Issues

- Ensure you are connected to the correct network (Polygon Testnet or Mainnet).
- If transactions are stuck, try resetting your MetaMask account.

### Pinata Upload Failures

- Verify your Pinata API keys are correct.
- Ensure you are not exceeding the Pinata storage limits for your account.
