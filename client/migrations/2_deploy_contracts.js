const BlockStashV1 = artifacts.require("BlockStashV1");
const Proxy = artifacts.require("Proxy");

module.exports = async function(deployer) {
  // Deploy the updated BlockStashV1 contract (this is the new implementation)
  await deployer.deploy(BlockStashV1);
  const newBlockStashV1 = await BlockStashV1.deployed();

  // Retrieve the already deployed Proxy contract
  const proxy = await Proxy.deployed();

  // Call upgradeTo function on the proxy to point to the new implementation
  await proxy.upgradeTo(newBlockStashV1.address);

  console.log(`New BlockStashV1 deployed at: ${newBlockStashV1.address}`);
  console.log(`Proxy is now pointing to new implementation at: ${newBlockStashV1.address}`);
};
