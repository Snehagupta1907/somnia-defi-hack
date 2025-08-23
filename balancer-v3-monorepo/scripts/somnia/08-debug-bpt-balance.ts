/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

function makeTxUrl(hash: string): string {
  return `https://shannon-explorer.somnia.network/tx/${hash}`;
}

async function main() {
  console.log('🔍 Debug BPT Balance Issue');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  // Load Somnia deployment info
  const deploymentFile = 'scripts/somnia/deployment-weighted-pool-2t.json';
  if (!fs.existsSync(deploymentFile)) {
    throw new Error('deployment-weighted-pool-2t.json not found. Please run the deployment scripts first.');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const routerAddr: string = poolInfo.router;
  const poolAddr: string = poolInfo.somniaWeightedPool;
  const vaultAddr: string = poolInfo.vault;

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Vault: ${vaultAddr}`);

  // Connect to contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('WeightedPool', poolAddr);
  const vault = await ethers.getContractAt('IVault', vaultAddr);

  // Check various balances and states
  console.log('\n💰 Checking Balances and States...');
  
  // 1. Check BPT balance of sender
  const senderBptBalance = await pool.balanceOf(sender.address);
  console.log(`📋 Sender BPT balance: ${ethers.formatUnits(senderBptBalance, 18)}`);
  
  // 2. Check BPT balance of router
  const routerBptBalance = await pool.balanceOf(routerAddr);
  console.log(`📋 Router BPT balance: ${ethers.formatUnits(routerBptBalance, 18)}`);
  
  // 3. Check BPT balance of vault
  const vaultBptBalance = await pool.balanceOf(vaultAddr);
  console.log(`📋 Vault BPT balance: ${ethers.formatUnits(vaultBptBalance, 18)}`);
  
  // 4. Check total supply
  const totalSupply = await pool.totalSupply();
  console.log(`📋 Pool total supply: ${ethers.formatUnits(totalSupply, 18)}`);
  
  // 5. Check pool tokens and balances
  const poolTokens = await pool.getTokens();
  console.log(`📋 Pool tokens: ${poolTokens.length}`);
  
  for (let i = 0; i < poolTokens.length; i++) {
    const token = await ethers.getContractAt('IERC20', poolTokens[i]);
    const poolBalance = await token.balanceOf(poolAddr);
    const vaultBalance = await token.balanceOf(vaultAddr);
    const senderBalance = await token.balanceOf(sender.address);
    
    console.log(`📋 Token ${i}: ${poolTokens[i]}`);
    console.log(`   Pool balance: ${ethers.formatUnits(poolBalance, 18)}`);
    console.log(`   Vault balance: ${ethers.formatUnits(vaultBalance, 18)}`);
    console.log(`   Sender balance: ${ethers.formatUnits(senderBalance, 18)}`);
  }
  
  // 6. Check router permissions and state
  console.log('\n🔐 Checking Router State...');
  
  // Note: Router version function might not exist on all router implementations
  console.log(`📋 Router address: ${routerAddr}`);
  
  // 7. Check if sender has any BPT in other addresses
  console.log('\n🔍 Checking for BPT in other addresses...');
  
  // Check if BPT might be in the router contract
  if (routerBptBalance > 0n) {
    console.log(`⚠️ Found ${ethers.formatUnits(routerBptBalance, 18)} BPT in router contract!`);
    console.log(`💡 This suggests BPT tokens are being sent to the router instead of the sender.`);
  }
  
  // Check if BPT might be in the vault contract
  if (vaultBptBalance > 0n) {
    console.log(`⚠️ Found ${ethers.formatUnits(vaultBptBalance, 18)} BPT in vault contract!`);
    console.log(`💡 This suggests BPT tokens are being sent to the vault instead of the sender.`);
  }
  
  // 8. Try to understand the issue
  console.log('\n💡 Analysis:');
  if (senderBptBalance === 0n && totalSupply > 0n) {
    console.log(`❌ Sender has no BPT but pool has ${ethers.formatUnits(totalSupply, 18)} total supply`);
    console.log(`🔍 This suggests BPT tokens are being sent to the wrong address`);
    
    if (routerBptBalance > 0n) {
      console.log(`🎯 Most likely issue: BPT tokens are being sent to the router contract instead of the sender`);
      console.log(`💡 This could be due to a router implementation issue or incorrect sender parameter`);
    } else if (vaultBptBalance > 0n) {
      console.log(`🎯 Most likely issue: BPT tokens are being sent to the vault contract instead of the sender`);
      console.log(`💡 This could be due to a vault implementation issue`);
    } else {
      console.log(`🎯 BPT tokens seem to be lost or sent to an unknown address`);
    }
  } else if (senderBptBalance > 0n) {
    console.log(`✅ Sender has BPT tokens: ${ethers.formatUnits(senderBptBalance, 18)}`);
  } else {
    console.log(`ℹ️ Pool has no BPT tokens yet`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 