/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🏦 Step 5: Deploying Vault...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-04-vault-extension.json')) {
    throw new Error('Please run 04-deploy-vault-extension.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-04-vault-extension.json', 'utf8'));
  console.log(`📋 Using VaultExtension: ${previousInfo.vaultExtension}`);
  console.log(`📋 Using VaultAdmin: ${previousInfo.vaultAdmin}`);
  console.log(`📋 Using Authorizer: ${previousInfo.authorizer}`);
  console.log(`📋 Using ProtocolFeeController: ${previousInfo.protocolFeeController}`);
  
  // Deploy Vault
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy(
    previousInfo.vaultExtension,
    previousInfo.authorizer,
    previousInfo.protocolFeeController
  );
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log(`✅ Vault deployed to: ${vaultAddress}`);
  
  // Verify the predicted address matches
  if (vaultAddress !== previousInfo.predictedVaultAddress) {
    console.log(`⚠️  Warning: Predicted address (${previousInfo.predictedVaultAddress}) doesn't match actual address (${vaultAddress})`);
  }
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    vault: vaultAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-05-vault.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-05-vault.json`);
  
  return vault;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 