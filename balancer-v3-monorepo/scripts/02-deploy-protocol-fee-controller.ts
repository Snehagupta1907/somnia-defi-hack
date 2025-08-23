/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('💰 Step 2: Deploying ProtocolFeeController...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-01-authorizer.json')) {
    throw new Error('Please run 01-deploy-authorizer.ts first');
  }
  
  const authorizerInfo = JSON.parse(fs.readFileSync('deployment-01-authorizer.json', 'utf8'));
  console.log(`📋 Using authorizer: ${authorizerInfo.authorizer}`);
  
  // Predict future Vault address
  const nonce = await deployer.getNonce();
  const futureVaultAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce + 3, // VaultAdmin, VaultExtension, ProtocolFeeController, then Vault
  });
  
  console.log(`📋 Predicted Vault address: ${futureVaultAddress}`);
  
  // Deploy ProtocolFeeController
  const ProtocolFeeController = await ethers.getContractFactory('ProtocolFeeController');
  const protocolFeeController = await ProtocolFeeController.deploy(
    futureVaultAddress, // predicted vault address
    ethers.parseUnits('0.01', 18), // initial global protocol swap fee percentage 1%
    ethers.parseUnits('0.01', 18)  // initial global protocol yield fee percentage 1%
  );
  await protocolFeeController.waitForDeployment();
  
  const protocolFeeControllerAddress = await protocolFeeController.getAddress();
  console.log(`✅ ProtocolFeeController deployed to: ${protocolFeeControllerAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...authorizerInfo,
    protocolFeeController: protocolFeeControllerAddress,
    predictedVaultAddress: futureVaultAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-02-protocol-fee-controller.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-02-protocol-fee-controller.json`);
  
  return protocolFeeController;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 