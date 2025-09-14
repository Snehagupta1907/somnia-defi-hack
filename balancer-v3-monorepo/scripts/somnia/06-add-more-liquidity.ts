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
  console.log('💧 Add more liquidity to Somnia Pool via Router');

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
  console.log(`📋 Somnia Tokens:`, somniaTokens);

  // Contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('WeightedPool', poolAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // Check current pool state
  const totalSupply = await pool.totalSupply();
  console.log(`📋 Current pool total supply: ${ethers.formatUnits(totalSupply, 18)} BPT`);

  if (totalSupply === 0n) {
    throw new Error('Pool has no liquidity. Please run 03-add-initial-liquidity.ts first to initialize the pool.');
  }

  // Get pool token order
  const poolTokens: string[] = await pool.getTokens();
  console.log(`📋 Pool token order: ${poolTokens.length} tokens`);

  // Decide amounts per token (edit here or use environment variable)
  const amountPerTokenStr = process.env.AMOUNT_PER_TOKEN || '1';
  const desiredPerToken = ethers.parseUnits(amountPerTokenStr, 18);
  console.log(`📋 Adding ${amountPerTokenStr} of each token`);

  // Check token balances
  console.log('\n💰 Checking token balances...');
  for (let i = 0; i < poolTokens.length; i++) {
    const token = await ethers.getContractAt('IERC20', poolTokens[i]);
    const balance = await token.balanceOf(sender.address);
    console.log(`📋 Token ${i}: ${ethers.formatUnits(balance, 18)}`);
    
    if (balance < desiredPerToken) {
      throw new Error(`Insufficient balance for token ${i}: ${ethers.formatUnits(balance, 18)} < ${ethers.formatUnits(desiredPerToken, 18)}`);
    }
  }

  // Approve tokens using the same pattern as the working script
  console.log('\n🔐 Approving tokens for router through Permit2...');
  
  for (let i = 0; i < poolTokens.length; i++) {
    const tokenAddr = poolTokens[i];
    const token = await ethers.getContractAt('IERC20', tokenAddr);
    
    // Step 1: Approve tokens for Permit2
    console.log(`🔐 Approving Permit2 for token ${i}...`);
    const approvePermit2 = await token.approve(permit2Addr, desiredPerToken);
    await approvePermit2.wait();

    // Step 2: Approve Permit2 to spend tokens for Router
    console.log(`🔐 Approving Permit2 to spend token ${i} for Router...`);
    const approveRouter = await permit2.approve(tokenAddr, routerAddr, desiredPerToken, MAX_UINT48);
    await approveRouter.wait();
    console.log(`✅ Token ${i} approved for Router via Permit2`);
  }

  // Create amounts array matching the working pattern
  const amountsIn = poolTokens.map(() => desiredPerToken);
  console.log(`📋 Amounts to add: ${amountsIn.map(amount => ethers.formatUnits(amount, 18))}`);

  // Add liquidity using the same pattern as the working script
  console.log('\n💧 Adding liquidity to pool...');
  
  try {
    // Try addLiquidityUnbalanced instead of addLiquidityProportional
    console.log('🔄 Adding more liquidity via addLiquidityUnbalanced...');
    
    const addLiquidityTx = await router.addLiquidityUnbalanced(
      poolAddr,
      amountsIn,      // exactAmountsIn
      0n,             // minBptAmountOut (0 for any amount)
      false,          // wethIsEth
      '0x'            // userData
    );
    
    console.log(`📋 Add liquidity transaction: ${addLiquidityTx.hash}`);
    console.log(`🔗 ${makeTxUrl(addLiquidityTx.hash)}`);
    
    console.log('⏳ Waiting for transaction...');
    const receipt = await addLiquidityTx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);
    
    // Check final state
    console.log('\n📊 Final State:');
    const finalBptBalance = await pool.balanceOf(sender.address);
    const finalTotalSupply = await pool.totalSupply();
    console.log(`📋 Final BPT balance: ${ethers.formatUnits(finalBptBalance, 18)}`);
    console.log(`📋 Final total supply: ${ethers.formatUnits(finalTotalSupply, 18)}`);
    
    if (finalTotalSupply > totalSupply) {
      console.log(`✅ Success! Pool total supply increased by ${ethers.formatUnits(finalTotalSupply - totalSupply, 18)}`);
    } else {
      console.log(`❌ Pool total supply unchanged. Liquidity addition may have failed.`);
    }
    
  } catch (error: any) {
    console.error('❌ Error adding liquidity:', error);
    
    if (error.message && error.message.includes('execution reverted')) {
      console.log('💡 This suggests the transaction reverted on-chain');
      console.log('🔍 Possible causes:');
      console.log('   - Router not authorized to call vault');
      console.log('   - Pool in invalid state');
      console.log('   - Insufficient token allowances');
      console.log('   - Pool configuration issue');
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 