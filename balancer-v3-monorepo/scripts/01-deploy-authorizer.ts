/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🔐 Step 1: Deploying BasicAuthorizerMock...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment');
  }
  
  // Deploy BasicAuthorizerMock
  const BasicAuthorizerMock = await ethers.getContractFactory('BasicAuthorizerMock');
  const authorizer = await BasicAuthorizerMock.deploy();
  await authorizer.waitForDeployment();
  
  const authorizerAddress = await authorizer.getAddress();
  console.log(`✅ BasicAuthorizerMock deployed to: ${authorizerAddress}`);
  
  // Grant admin role to deployer
  await authorizer.grantRole(ethers.ZeroHash, deployer.address);
  console.log(`✅ Admin role granted to deployer`);
  
  // Save deployment info
  const deploymentInfo = {
    authorizer: authorizerAddress,
    deployer: deployer.address,
    timestamp: Date.now(),
    network: (await ethers.provider.getNetwork()).chainId.toString()
  };
  
  fs.writeFileSync('deployment-01-authorizer.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-01-authorizer.json`);
  
  return authorizer;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 