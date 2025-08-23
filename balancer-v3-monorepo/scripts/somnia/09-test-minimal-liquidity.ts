/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Minimal Permit2 ABI (approve only)
const PERMIT2_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const MAX_UINT48 = 281474976710655n; // 2^48 - 1

function makeTxUrl(hash: string): string {
  return `https://shannon-explorer.somnia.network/tx/${hash}`;
}

async function main() {
  console.log('🧪 Test Minimal Liquidity Addition');

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
  const permit2Addr: string = poolInfo.permit2;
  const somniaTokens: Record<string, string> = poolInfo.somniaTokens || {};

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Permit2: ${permit2Addr}`);

  // Contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('WeightedPool', poolAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // Check initial state
  console.log('\n📊 Initial State:');
  const initialBptBalance = await pool.balanceOf(sender.address);
  const initialTotalSupply = await pool.totalSupply();
  console.log(`📋 Initial BPT balance: ${ethers.formatUnits(initialBptBalance, 18)}`);
  console.log(`📋 Initial total supply: ${ethers.formatUnits(initialTotalSupply, 18)}`);

  // Get pool token order
  const poolTokens: string[] = await pool.getTokens();
  console.log(`📋 Pool token order: ${poolTokens.length} tokens`);

  // Use very small amounts for testing
  const testAmount = ethers.parseUnits('0.001', 18); // 0.001 tokens
  console.log(`📋 Test amount per token: ${ethers.formatUnits(testAmount, 18)}`);

  // Check token balances
  console.log('\n💰 Token Balances:');
  for (let i = 0; i < poolTokens.length; i++) {
    const token = await ethers.getContractAt('IERC20', poolTokens[i]);
    const balance = await token.balanceOf(sender.address);
    console.log(`📋 Token ${i}: ${ethers.formatUnits(balance, 18)}`);
    
    if (balance < testAmount) {
      throw new Error(`Insufficient balance for token ${i}: ${ethers.formatUnits(balance, 18)} < ${ethers.formatUnits(testAmount, 18)}`);
    }
  }

  // Approve tokens
  console.log('\n🔐 Approving tokens...');
  for (let i = 0; i < poolTokens.length; i++) {
    const tokenAddr = poolTokens[i];
    const token = await ethers.getContractAt('IERC20', tokenAddr);
    
    console.log(`🔐 Approving Permit2 for token ${i}...`);
    const approvePermit2 = await token.approve(permit2Addr, testAmount);
    await approvePermit2.wait();

    console.log(`🔐 Approving Router via Permit2 for token ${i}...`);
    const approveRouter = await permit2.approve(tokenAddr, routerAddr, testAmount, MAX_UINT48);
    await approveRouter.wait();
    console.log(`✅ Token ${i} approved`);
  }

  // Try to add liquidity with very small amounts
  console.log('\n🚀 Adding minimal liquidity...');
  
  const amountsIn = poolTokens.map(() => testAmount);
  console.log(`📋 Amounts in: ${amountsIn.map((amount: bigint) => ethers.formatUnits(amount, 18))}`);

  // Try to add liquidity
  try {
    console.log('🚀 Calling addLiquidityProportional...');
    const tx = await router.addLiquidityProportional(
      poolAddr,
      amountsIn,      // maxAmountsIn
      0n,             // exactBptAmountOut (0 for proportional)
      false,          // wethIsEth
      '0x'            // userData
    );
    
    console.log(`📋 Transaction hash: ${tx.hash}`);
    console.log(`🔗 ${makeTxUrl(tx.hash)}`);
    
    console.log('⏳ Waiting for transaction...');
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);
    
    // Check final state
    console.log('\n📊 Final State:');
    const finalBptBalance = await pool.balanceOf(sender.address);
    const finalTotalSupply = await pool.totalSupply();
    console.log(`📋 Final BPT balance: ${ethers.formatUnits(finalBptBalance, 18)}`);
    console.log(`📋 Final total supply: ${ethers.formatUnits(finalTotalSupply, 18)}`);
    
    if (finalBptBalance > initialBptBalance) {
      console.log(`✅ Success! BPT balance increased by ${ethers.formatUnits(finalBptBalance - initialBptBalance, 18)}`);
    } else {
      console.log(`❌ No BPT received. Balance unchanged.`);
    }
    
  } catch (e: any) {
    console.error(`❌ Transaction failed: ${e}`);
    
    // Try to understand the error
    if (e.message && e.message.includes('execution reverted')) {
      console.log('💡 This suggests the transaction reverted on-chain');
      console.log('🔍 Possible causes:');
      console.log('   - Router not authorized to call vault');
      console.log('   - Pool in invalid state');
      console.log('   - Insufficient token allowances');
      console.log('   - Pool configuration issue');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 