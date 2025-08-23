/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🏗️ Step 3: Deploying VaultAdmin...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-02-protocol-fee-controller.json')) {
    throw new Error('Please run 02-deploy-protocol-fee-controller.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-02-protocol-fee-controller.json', 'utf8'));
  console.log(`📋 Using authorizer: ${previousInfo.authorizer}`);
  console.log(`📋 Using predicted Vault address: ${previousInfo.predictedVaultAddress}`);
  
  // Use the predicted address from the previous deployment
  const futureVaultAddress = previousInfo.predictedVaultAddress;
  
  // Deploy VaultAdmin
  const VaultAdmin = await ethers.getContractFactory('VaultAdmin');
  const vaultAdmin = await VaultAdmin.deploy(
    futureVaultAddress, // vault address (will be set later)
    0, // pauseWindowDuration (90 days)
    0, // bufferPeriodDuration
    ethers.parseUnits('0.0001', 18), // minTradeAmount
    ethers.parseUnits('0.0001', 18)  // minWrapAmount
  );
  await vaultAdmin.waitForDeployment();
  
  const vaultAdminAddress = await vaultAdmin.getAddress();
  console.log(`✅ VaultAdmin deployed to: ${vaultAdminAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    vaultAdmin: vaultAdminAddress,
    predictedVaultAddress: futureVaultAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-03-vault-admin.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-03-vault-admin.json`);
  
  return vaultAdmin;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 