/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🔐 Authorizing Router to call Vault functions');

  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);

  // Load Somnia deployment info
  const deploymentFile = 'scripts/somnia/deployment-weighted-pool-2t.json';
  if (!fs.existsSync(deploymentFile)) {
    throw new Error('deployment-weighted-pool-2t.json not found. Please run the deployment scripts first.');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const vaultAddr: string = poolInfo.vault;
  const routerAddr: string = poolInfo.router;

  console.log(`📋 Vault: ${vaultAddr}`);
  console.log(`📋 Router: ${routerAddr}`);

  // Connect to the vault extension to get the authorizer
  const vaultExtension = await ethers.getContractAt('VaultExtension', vaultAddr);
  
  // Get the authorizer address
  const authorizerAddr = await vaultExtension.getAuthorizer();
  console.log(`📋 Authorizer: ${authorizerAddr}`);

  // Connect to the authorizer
  const authorizer = await ethers.getContractAt('BasicAuthorizerMock', authorizerAddr);

  // Check if router is already authorized
  console.log('\n🔍 Checking current router authorization...');
  
  try {
    const isRouterAuthorized = await authorizer.hasRole(routerAddr, '0x0000000000000000000000000000000000000000000000000000000000000000');
    console.log(`📋 Router has default role: ${isRouterAuthorized}`);
  } catch (e) {
    console.log(`⚠️ Could not check default role: ${e}`);
  }

  // Check if router can call vault functions
  try {
    const canCall = await authorizer.canPerform('0x0000000000000000000000000000000000000000000000000000000000000000', routerAddr, vaultAddr);
    console.log(`📋 Router can call vault: ${canCall}`);
  } catch (e) {
    console.log(`⚠️ Could not check vault call permission: ${e}`);
  }

  // Grant router permission to call vault functions
  console.log('\n🔐 Granting router permission to call vault...');
  
  try {
    // Grant the router permission to call the vault
    // We need to grant the router the ability to call vault functions
    const grantTx = await authorizer.grantRole('0x0000000000000000000000000000000000000000000000000000000000000000', routerAddr);
    console.log(`📋 Grant role transaction: ${grantTx.hash}`);
    
    console.log('⏳ Waiting for transaction...');
    const receipt = await grantTx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);
    
    console.log('✅ Router has been authorized to call vault functions');
    
  } catch (error: any) {
    console.error('❌ Error granting role:', error);
    
    if (error.message && error.message.includes('already has role')) {
      console.log('ℹ️ Router already has the required role');
    } else {
      throw error;
    }
  }

  // Verify the authorization
  console.log('\n🔍 Verifying router authorization...');
  
  try {
    const isRouterAuthorized = await authorizer.hasRole(routerAddr, '0x0000000000000000000000000000000000000000000000000000000000000000');
    console.log(`📋 Router has default role: ${isRouterAuthorized}`);
    
    if (isRouterAuthorized) {
      console.log('✅ Router is now authorized to call vault functions');
      console.log('💡 Try running the liquidity addition scripts again');
    } else {
      console.log('❌ Router authorization failed');
    }
  } catch (e) {
    console.log(`⚠️ Could not verify role: ${e}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 