/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🏭 Step 6: Deploying StablePoolFactory...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`�� Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-05-vault.json')) {
    throw new Error('Please run 05-deploy-vault.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-05-vault.json', 'utf8'));
  console.log(`📋 Using Vault: ${previousInfo.vault}`);
  
  // Deploy StablePoolFactory
  const StablePoolFactory = await ethers.getContractFactory('StablePoolFactory');
  const stablePoolFactory = await StablePoolFactory.deploy(
    previousInfo.vault,           // Use main Vault address
    0,                            // pauseWindowDuration (0 for testing - no pause protection)
    '1.0.0',                     // factoryVersion
    '1.0.0'                      // poolVersion
  );
  await stablePoolFactory.waitForDeployment();
  
  const stablePoolFactoryAddress = await stablePoolFactory.getAddress();
  console.log(`✅ StablePoolFactory deployed to: ${stablePoolFactoryAddress}`);
  
  // Verify factory configuration
  console.log('🔍 Verifying factory configuration...');
  const isDisabled = await stablePoolFactory.isDisabled();
  const vault = await stablePoolFactory.getVault();
//   const factoryVersion = await stablePoolFactory.getFactoryVersion();
  const poolVersion = await stablePoolFactory.getPoolVersion();
  
  console.log(`   Factory disabled: ${isDisabled}`);
  console.log(`   Factory vault: ${vault}`);
//   console.log(`   Factory version: ${factoryVersion}`);
  console.log(`   Pool version: ${poolVersion}`);
  console.log(`   Vault address matches: ${vault === previousInfo.vault}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    stablePoolFactory: stablePoolFactoryAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-06-stable-pool-factory.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-06-stable-pool-factory.json`);
  
  console.log('🎉 StablePoolFactory deployment completed successfully!');
  
  return stablePoolFactory;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });