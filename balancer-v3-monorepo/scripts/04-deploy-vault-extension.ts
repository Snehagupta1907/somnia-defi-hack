/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🔧 Step 4: Deploying VaultExtension...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-03-vault-admin.json')) {
    throw new Error('Please run 03-deploy-vault-admin.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-03-vault-admin.json', 'utf8'));
  console.log(`📋 Using VaultAdmin: ${previousInfo.vaultAdmin}`);
  console.log(`📋 Predicted Vault address: ${previousInfo.predictedVaultAddress}`);
  
  // Deploy VaultExtension
  const VaultExtension = await ethers.getContractFactory('VaultExtension');
  const vaultExtension = await VaultExtension.deploy(
    previousInfo.predictedVaultAddress, // predicted vault address
    previousInfo.vaultAdmin
  );
  await vaultExtension.waitForDeployment();
  
  const vaultExtensionAddress = await vaultExtension.getAddress();
  console.log(`✅ VaultExtension deployed to: ${vaultExtensionAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    vaultExtension: vaultExtensionAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-04-vault-extension.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-04-vault-extension.json`);
  
  return vaultExtension;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 