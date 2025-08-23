/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Factory Configuration
const FACTORY_CONFIG = {
  factoryVersion: '1.0.0',
  poolVersion: '1.0.0',
  pauseWindowDuration: 0 // 90 days in seconds
};

async function main() {
  console.log('🏭 Step 0: Deploying WeightedPoolFactory for Somnia...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Check if we have vault deployment info
  let vaultAddress = ethers.ZeroAddress;
  if (fs.existsSync('scripts/somnia/deployment-vault.json')) {
    const vaultInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-vault.json', 'utf8'));
    vaultAddress = vaultInfo.vault;
    console.log(`📋 Using Somnia Vault: ${vaultAddress}`);
  } else {
    console.log('⚠️  No Somnia vault deployment found. Please run 00-deploy-vault-from-scratch.ts first.');
    console.log('💡 This will deploy the vault and all dependencies for Somnia chain.');
    return;
  }
  
  // Deploy WeightedPoolFactory
  console.log('🚀 Deploying WeightedPoolFactory...');
  
  try {
    const WeightedPoolFactory = await ethers.getContractFactory('WeightedPoolFactory');
    const factory = await WeightedPoolFactory.deploy(
      vaultAddress,
      FACTORY_CONFIG.pauseWindowDuration,
      FACTORY_CONFIG.factoryVersion,
      FACTORY_CONFIG.poolVersion
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log(`✅ WeightedPoolFactory deployed to: ${factoryAddress}`);
    
    // Verify factory deployment
    const factoryVersion = await factory.version();
    const poolVersion = await factory.getPoolVersion();
    const vault = await factory.getVault();
    
    console.log(`📋 Factory version: ${factoryVersion}`);
    console.log(`📋 Pool version: ${poolVersion}`);
    console.log(`📋 Vault address: ${vault}`);
    
    if (vault !== vaultAddress) {
      throw new Error(`Vault address mismatch! Expected: ${vaultAddress}, Got: ${vault}`);
    }
    
    // Check if factory is disabled
    const isDisabled = await factory.isDisabled();
    console.log(`📋 Factory disabled: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('⚠️  Warning: Factory is disabled! You may need to enable it.');
    }
    
    // Save deployment info
    const deploymentInfo = {
      weightedPoolFactory: factoryAddress,
      vault: vaultAddress,
      factoryConfig: FACTORY_CONFIG,
      deployer: deployer.address,
      timestamp: Date.now()
    };
    
    fs.writeFileSync('scripts/somnia/deployment-weighted-pool-factory.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to scripts/somnia/deployment-weighted-pool-factory.json`);
    
    console.log('\n🎉 WeightedPoolFactory deployment completed successfully!');
    console.log(`🏭 Factory Address: ${factoryAddress}`);
    console.log(`🏦 Vault Address: ${vaultAddress}`);
    console.log(`📋 Factory Version: ${factoryVersion}`);
    console.log(`📋 Pool Version: ${poolVersion}`);
    
    return factory;
    
  } catch (error: any) {
    console.error('❌ Error deploying factory:', error);
    
    // Additional debugging info
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might be due to:');
      console.log('   - Invalid vault address');
      console.log('   - Insufficient gas');
      console.log('   - Network issues');
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 