/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🏦 Step 0: Deploying Vault from scratch for Somnia...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment');
  }
  
  // Step 1: Deploy BasicAuthorizerMock
  console.log('\n🔐 Step 1: Deploying BasicAuthorizerMock...');
  const BasicAuthorizerMock = await ethers.getContractFactory('BasicAuthorizerMock');
  const authorizer = await BasicAuthorizerMock.deploy();
  await authorizer.waitForDeployment();
  const authorizerAddress = await authorizer.getAddress();
  console.log(`✅ BasicAuthorizerMock deployed to: ${authorizerAddress}`);
  
  // Grant admin role to deployer
  await authorizer.grantRole(ethers.ZeroHash, deployer.address);
  console.log(`✅ Admin role granted to deployer`);
  
  // Predict future Vault address
  const nonce = await deployer.getNonce();
  const futureVaultAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce + 3, // VaultAdmin, VaultExtension, ProtocolFeeController, then Vault
  });
  
  console.log(`📋 Predicted Vault address: ${futureVaultAddress}`);
  
  // Step 2: Deploy ProtocolFeeController
  console.log('\n💰 Step 2: Deploying ProtocolFeeController...');
  const ProtocolFeeController = await ethers.getContractFactory('ProtocolFeeController');
  const protocolFeeController = await ProtocolFeeController.deploy(
    futureVaultAddress, // predicted vault address
    ethers.parseUnits('0.01', 18), // initial global protocol swap fee percentage 1%
    ethers.parseUnits('0.01', 18)  // initial global protocol yield fee percentage 1%
  );
  await protocolFeeController.waitForDeployment();
  const protocolFeeControllerAddress = await protocolFeeController.getAddress();
  console.log(`✅ ProtocolFeeController deployed to: ${protocolFeeControllerAddress}`);
  
  // Step 3: Deploy VaultAdmin
  console.log('\n🏗️ Step 3: Deploying VaultAdmin...');
  const VaultAdmin = await ethers.getContractFactory('VaultAdmin');
  const vaultAdmin = await VaultAdmin.deploy(
    futureVaultAddress, // vault address (will be set later)
    0, // pauseWindowDuration (0 for Somnia)
    0, // bufferPeriodDuration (0 for Somnia)
    ethers.parseUnits('0.0001', 18), // minTradeAmount
    ethers.parseUnits('0.0001', 18)  // minWrapAmount
  );
  await vaultAdmin.waitForDeployment();
  const vaultAdminAddress = await vaultAdmin.getAddress();
  console.log(`✅ VaultAdmin deployed to: ${vaultAdminAddress}`);
  
  // Step 4: Deploy VaultExtension
  console.log('\n🔧 Step 4: Deploying VaultExtension...');
  const VaultExtension = await ethers.getContractFactory('VaultExtension');
  const vaultExtension = await VaultExtension.deploy(
    futureVaultAddress, // predicted vault address
    vaultAdminAddress
  );
  await vaultExtension.waitForDeployment();
  const vaultExtensionAddress = await vaultExtension.getAddress();
  console.log(`✅ VaultExtension deployed to: ${vaultExtensionAddress}`);
  
  // Step 5: Deploy Vault
  console.log('\n🏦 Step 5: Deploying Vault...');
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy(
    vaultExtensionAddress,
    authorizerAddress,
    protocolFeeControllerAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ Vault deployed to: ${vaultAddress}`);
  
  // Verify the predicted address matches
  if (vaultAddress !== futureVaultAddress) {
    console.log(`⚠️  Warning: Predicted address (${futureVaultAddress}) doesn't match actual address (${vaultAddress})`);
  }
  
  // Note: Vault configuration verification is not needed for deployment
  // The contracts will revert if there are configuration issues
  
  // Save deployment info
  const deploymentInfo = {
    authorizer: authorizerAddress,
    protocolFeeController: protocolFeeControllerAddress,
    vaultAdmin: vaultAdminAddress,
    vaultExtension: vaultExtensionAddress,
    vault: vaultAddress,
    predictedVaultAddress: futureVaultAddress,
    deployer: deployer.address,
    timestamp: Date.now(),
    network: network.chainId.toString()
  };
  
  fs.writeFileSync('scripts/somnia/deployment-vault.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to scripts/somnia/deployment-vault.json`);
  
  console.log('\n🎉 Vault deployment completed successfully!');
  console.log(`🔐 Authorizer: ${authorizerAddress}`);
  console.log(`💰 ProtocolFeeController: ${protocolFeeControllerAddress}`);
  console.log(`🏗️ VaultAdmin: ${vaultAdminAddress}`);
  console.log(`🔧 VaultExtension: ${vaultExtensionAddress}`);
  console.log(`🏦 Vault: ${vaultAddress}`);
  
  return {
    authorizer,
    protocolFeeController,
    vaultAdmin,
    vaultExtension,
    vault
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 