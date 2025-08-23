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
  console.log('💧 Add liquidity for a single token to Somnia Pool via Router');

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

  // Pool token order
  const poolTokens: string[] = await pool.getTokens();
  console.log(`📋 Pool token order: ${poolTokens.length} tokens`);

  // Choose which single token to add
  // Priority: TOKEN_ADDR env -> TOKEN_KEY env (USDTG/WSTT) -> first pool token
  const envTokenAddr = process.env.TOKEN_ADDR?.toLowerCase();
  const envTokenKey = process.env.TOKEN_KEY as keyof typeof somniaTokens | undefined;
  const chosenAddr = envTokenAddr
    || (envTokenKey && somniaTokens[envTokenKey] ? somniaTokens[envTokenKey] : undefined)
    || poolTokens[0];

  if (!poolTokens.map(t => t.toLowerCase()).includes(chosenAddr.toLowerCase())) {
    throw new Error(`Chosen token ${chosenAddr} is not part of the pool token list`);
  }

  const amountStr = process.env.AMOUNT || '0.1';
  const desiredAmount = ethers.parseUnits(amountStr, 18);

  console.log(`🔎 Adding liquidity for token: ${chosenAddr}`);
  console.log(`🔎 Amount: ${amountStr}`);

  // For weighted pools, we need to calculate proportional amounts
  // Get current pool weights
  const weights = await pool.getNormalizedWeights();
  console.log(`📋 Pool weights:`, weights.map(w => ethers.formatUnits(w, 18)));

  // Find the index of the chosen token
  const chosenTokenIndex = poolTokens.findIndex(addr => addr.toLowerCase() === chosenAddr.toLowerCase());
  if (chosenTokenIndex === -1) {
    throw new Error(`Chosen token not found in pool tokens`);
  }

  // Calculate proportional amounts based on weights
  // For single token addition, we'll add the desired amount and calculate what the other tokens should be
  const chosenWeight = weights[chosenTokenIndex];
  
  // Calculate amounts for other tokens to maintain weight proportions
  const amountsIn: bigint[] = [];
  for (let i = 0; i < poolTokens.length; i++) {
    if (i === chosenTokenIndex) {
      amountsIn.push(desiredAmount);
    } else {
      // Calculate proportional amount based on weight ratio
      const otherWeight = weights[i];
      const proportionalAmount = (desiredAmount * otherWeight) / chosenWeight;
      amountsIn.push(proportionalAmount);
    }
  }

  console.log(`📋 Calculated amounts:`, amountsIn.map((amount, i) => 
    `${ethers.formatUnits(amount, 18)} ${poolTokens[i] === somniaTokens.USDTG ? 'USDTG' : 'WSTT'}`
  ));

  // Check token balances
  console.log('\n💰 Checking token balances...');
  for (let i = 0; i < poolTokens.length; i++) {
    const token = await ethers.getContractAt('IERC20', poolTokens[i]);
    const balance = await token.balanceOf(sender.address);
    const amount = amountsIn[i];
    
    console.log(`📋 Token ${i}: ${ethers.formatUnits(balance, 18)} (need ${ethers.formatUnits(amount, 18)})`);
    
    if (balance < amount) {
      throw new Error(`Insufficient balance for token ${i}: ${ethers.formatUnits(balance, 18)} < ${ethers.formatUnits(amount, 18)}`);
    }
  }

  // Approve tokens using the same pattern as the working script
  console.log('\n🔐 Approving tokens for router through Permit2...');
  
  for (let i = 0; i < poolTokens.length; i++) {
    const tokenAddr = poolTokens[i];
    const amount = amountsIn[i];
    
    if (amount > 0n) {
      const token = await ethers.getContractAt('IERC20', tokenAddr);
      
      // Step 1: Approve tokens for Permit2
      console.log(`🔐 Approving Permit2 for token ${i}...`);
      const approvePermit2 = await token.approve(permit2Addr, amount);
      await approvePermit2.wait();

      // Step 2: Approve Permit2 to spend tokens for Router
      console.log(`🔐 Approving Permit2 to spend token ${i} for Router...`);
      const approveRouter = await permit2.approve(tokenAddr, routerAddr, amount, MAX_UINT48);
      await approveRouter.wait();
      console.log(`✅ Token ${i} approved for Router via Permit2`);
    }
  }

  // Add liquidity using the working addLiquidityUnbalanced function
  console.log('\n💧 Adding liquidity to pool...');
  
  try {
    // Use addLiquidityUnbalanced since addLiquidityProportional wasn't working
    console.log('🔄 Adding single-token liquidity via addLiquidityUnbalanced...');
    
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