/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🔐 Step 2: Granting Factory Permissions...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load deployment info
  if (!fs.existsSync('scripts/somnia/deployment-weighted-pool-factory.json')) {
    throw new Error('Please run 00-deploy-weighted-pool-factory.ts first');
  }
  
  const factoryInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-weighted-pool-factory.json', 'utf8'));
  console.log(`📋 Using WeightedPoolFactory: ${factoryInfo.weightedPoolFactory}`);
  console.log(`📋 Using Vault: ${factoryInfo.vault}`);
  
  // Connect to the authorizer
  if (!fs.existsSync('scripts/somnia/deployment-vault.json')) {
    throw new Error('Please run 00-deploy-vault-from-scratch.ts first');
  }
  
  const vaultInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-vault.json', 'utf8'));
  console.log(`📋 Using Authorizer: ${vaultInfo.authorizer}`);
  
  const authorizer = await ethers.getContractAt('BasicAuthorizerMock', vaultInfo.authorizer);
  
  // The action ID for registering pools in the vault
  // This is typically the keccak256 hash of the function signature
  const REGISTER_POOL_ACTION = ethers.keccak256(ethers.toUtf8Bytes('registerPool(address,address,uint256,address,address,bytes)'));
  
  console.log(`📋 Register Pool Action ID: ${REGISTER_POOL_ACTION}`);
  
  // Grant the REGISTER_POOL permission to the factory
  console.log('🔐 Granting REGISTER_POOL permission to factory...');
  
  try {
    const tx = await authorizer.grantRole(REGISTER_POOL_ACTION, factoryInfo.weightedPoolFactory);
    console.log(`📋 Permission grant transaction: ${tx.hash}`);
    console.log(`⏳ Waiting for transaction confirmation...`);
    
    await tx.wait();
    console.log(`✅ Permission granted successfully`);
    
    // Verify the permission was granted
    const hasRole = await authorizer.hasRole(REGISTER_POOL_ACTION, factoryInfo.weightedPoolFactory);
    console.log(`📋 Factory has REGISTER_POOL permission: ${hasRole}`);
    
    if (!hasRole) {
      throw new Error('Permission was not granted successfully');
    }
    
    // Save updated deployment info
    const deploymentInfo = {
      ...factoryInfo,
      permissionsGranted: true,
      registerPoolActionId: REGISTER_POOL_ACTION,
      timestamp: Date.now()
    };
    
    fs.writeFileSync('scripts/somnia/deployment-weighted-pool-factory.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Updated deployment info saved`);
    
    console.log('\n🎉 Factory permissions granted successfully!');
    console.log(`🏭 Factory: ${factoryInfo.weightedPoolFactory}`);
    console.log(`🏦 Vault: ${factoryInfo.vault}`);
    console.log(`🔐 Permission: REGISTER_POOL`);
    
  } catch (error: any) {
    console.error('❌ Error granting permissions:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 