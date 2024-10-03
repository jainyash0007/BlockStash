const ethers = require('ethers');
const BlockStash = require('./artifacts/BlockStashV1.json');
require('dotenv').config();

// Define your contract ABI and address
const contractABI = BlockStash.abi;
const contractAddress = '0x4df919a8206daA629e1a7cd7f59339CEA6e1A630';

// Define your provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology/'); // or any provider
const privateKey = '205408941dc5527a779c1bfdf60cdad6aad4497dc708f22cec3976a7ef0cf3be';
const wallet = new ethers.Wallet(privateKey, provider);

// Connect to your contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Function to delete file from contract
async function deleteFileFromContract(fileId) {
  try {
    const gasLimit = await contract.estimateGas.deleteFile(fileId);
    const maxPriorityFeePerGas = ethers.utils.parseUnits('30', 'gwei'); // Adjust this based on network conditions
    const maxFeePerGas = ethers.utils.parseUnits('50', 'gwei'); // Adjust this based on network conditions

    // Send the transaction
    const tx = await contract.deleteFile(fileId, {
      gasLimit: ethers.utils.hexlify(gasLimit),
      maxPriorityFeePerGas,
      maxFeePerGas,
    });
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log(`File with fileId ${fileId} deleted successfully`);
    } else {
      console.error(`Failed to delete file with fileId ${fileId}`);
    }
  } catch (error) {
    console.error("Error deleting file from contract:", error);
  }
}

// Call the function and pass the fileId to delete
// deleteFileFromContract(3); // Replace 1 with the fileId you want to delete
// deleteFileFromContract(5); // Replace 1 with the fileId you want to delete
// deleteFileFromContract(6); // Replace 1 with the fileId you want to delete
deleteFileFromContract(9); // Replace 1 with the fileId you want to delete
