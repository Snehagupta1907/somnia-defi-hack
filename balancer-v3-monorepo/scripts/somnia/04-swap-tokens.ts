/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Swap configuration
const SWAP_CONFIG = {
  amountIn: ethers.parseUnits('0.1', 18), // 0.1 USDTG
  tokenIn: 'USDTG', // USDTG -> WSTT
  tokenOut: 'WSTT',
  slippageTolerance: 0.01 // 1% slippage tolerance
};

// Permit2 ABI for token approvals
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

async function main() {
  console.log('🔄 Step 4: Swapping Tokens in Somnia Weighted Pool...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load deployment info
  if (!fs.existsSync('scripts/somnia/deployment-weighted-pool-2t.json')) {
    throw new Error('Please run 03-add-initial-liquidity.ts first');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-weighted-pool-2t.json', 'utf8'));
  console.log(`📋 Using Pool: ${poolInfo.somniaWeightedPool}`);
  console.log(`📋 Using Router: ${poolInfo.router}`);
  
  // Check if pool has liquidity
  if (!poolInfo.initialLiquidityAdded) {
    throw new Error('Pool has no liquidity. Please run 03-add-initial-liquidity.ts first');
  }
  
  // Get token addresses
  const usdtgAddress = poolInfo.somniaTokens.USDTG;
  const wsttAddress = poolInfo.somniaTokens.WSTT;
  
  console.log(`📋 USDTG Address: ${usdtgAddress}`);
  console.log(`📋 WSTT Address: ${wsttAddress}`);
  
  // Connect to the pool and router
  const pool = await ethers.getContractAt('WeightedPool', poolInfo.somniaWeightedPool);
  const router = await ethers.getContractAt('Router', poolInfo.router);
  
  // Determine token in and out addresses
  let tokenInAddress: string;
  let tokenOutAddress: string;
  
  if (SWAP_CONFIG.tokenIn === 'USDTG') {
    tokenInAddress = usdtgAddress;
    tokenOutAddress = wsttAddress;
  } else {
    tokenInAddress = wsttAddress;
    tokenOutAddress = usdtgAddress;
  }
  
  console.log(`📋 Swapping ${ethers.formatUnits(SWAP_CONFIG.amountIn, 18)} ${SWAP_CONFIG.tokenIn} -> ${SWAP_CONFIG.tokenOut}`);
  console.log(`📋 Token In: ${tokenInAddress}`);
  console.log(`📋 Token Out: ${tokenOutAddress}`);
  
  // Check token balances before swap
  console.log('\n💰 Checking token balances before swap...');
  
  const tokenIn = await ethers.getContractAt('IERC20', tokenInAddress);
  const tokenOut = await ethers.getContractAt('IERC20', tokenOutAddress);
  
  const balanceInBefore = await tokenIn.balanceOf(deployer.address);
  const balanceOutBefore = await tokenOut.balanceOf(deployer.address);
  
  console.log(`📋 ${SWAP_CONFIG.tokenIn} balance before: ${ethers.formatUnits(balanceInBefore, 18)}`);
  console.log(`📋 ${SWAP_CONFIG.tokenOut} balance before: ${ethers.formatUnits(balanceOutBefore, 18)}`);
  
  if (balanceInBefore < SWAP_CONFIG.amountIn) {
    throw new Error(`Insufficient ${SWAP_CONFIG.tokenIn} balance for swap`);
  }
  
  // Approve token in for router through Permit2
  console.log('\n🔐 Approving token for router through Permit2...');
  
  try {
    // Get Permit2 address from deployment info
    const permit2Address = poolInfo.permit2 || "0xb012c6B0f0Ce47eB7Da3B542A18aBBa355458826"; // Use placeholder if not in deployment
    console.log(`📋 Using Permit2: ${permit2Address}`);
    
    const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Address);
    
    // Step 1: Approve token for Permit2
    console.log(`🔐 Approving ${SWAP_CONFIG.tokenIn} for Permit2...`);
    const approvePermit2Tx = await tokenIn.approve(permit2Address, ethers.MaxUint256);
    await approvePermit2Tx.wait();
    console.log(`✅ ${SWAP_CONFIG.tokenIn} approved for Permit2`);
    
    // Step 2: Approve Permit2 to spend tokens for Router
    console.log(`🔐 Approving Permit2 to spend ${SWAP_CONFIG.tokenIn} for Router...`);
    const approveRouterTx = await permit2.approve(
      tokenInAddress,
      poolInfo.router,
      SWAP_CONFIG.amountIn, // Use exact amount needed for swap
      MAX_UINT48
    );
    await approveRouterTx.wait();
    console.log(`✅ Permit2 approved to spend ${SWAP_CONFIG.tokenIn} for Router`);
    
  } catch (error: any) {
    console.error('❌ Error approving token:', error);
    throw error;
  }
  
  // Perform the swap
  console.log('\n🔄 Performing swap...');
  
  // Add deadline function
  function getDeadline(secondsFromNow = 1800): bigint {
    return BigInt(Math.floor(Date.now() / 1000) + secondsFromNow);
  }
  
  try {
    // Use router's swapSingleTokenExactIn function
    const swapTx = await router.swapSingleTokenExactIn(
      poolInfo.somniaWeightedPool,
      tokenInAddress,
      tokenOutAddress,
      SWAP_CONFIG.amountIn,
      0, // minAmountOut (0 for now, will calculate based on slippage)
      getDeadline(1800), // deadline 30 minutes from now
      false, // wethIsEth
      '0x' // userData
    );
    
    console.log(`📋 Swap transaction: ${swapTx.hash}`);
    console.log(`⏳ Waiting for transaction confirmation...`);
    
    const receipt = await swapTx.wait();
    console.log(`✅ Swap transaction confirmed in block ${receipt.blockNumber}`);
    
    // Check token balances after swap
    console.log('\n💰 Checking token balances after swap...');
    
    const balanceInAfter = await tokenIn.balanceOf(deployer.address);
    const balanceOutAfter = await tokenOut.balanceOf(deployer.address);
    
    const amountInUsed = balanceInBefore - balanceInAfter;
    const amountOutReceived = balanceOutAfter - balanceOutBefore;
    
    console.log(`📋 ${SWAP_CONFIG.tokenIn} balance after: ${ethers.formatUnits(balanceInAfter, 18)}`);
    console.log(`📋 ${SWAP_CONFIG.tokenOut} balance after: ${ethers.formatUnits(balanceOutAfter, 18)}`);
    console.log(`📋 Amount in used: ${ethers.formatUnits(amountInUsed, 18)} ${SWAP_CONFIG.tokenIn}`);
    console.log(`📋 Amount out received: ${ethers.formatUnits(amountOutReceived, 18)} ${SWAP_CONFIG.tokenOut}`);
    
    // Calculate effective exchange rate
    const exchangeRate = Number(amountOutReceived) / Number(amountInUsed);
    console.log(`📊 Effective exchange rate: 1 ${SWAP_CONFIG.tokenIn} = ${exchangeRate.toFixed(6)} ${SWAP_CONFIG.tokenOut}`);
    
    // Save swap info
    const swapInfo = {
      ...poolInfo,
      lastSwap: {
        tokenIn: SWAP_CONFIG.tokenIn,
        tokenOut: SWAP_CONFIG.tokenOut,
        amountIn: amountInUsed.toString(),
        amountOut: amountOutReceived.toString(),
        exchangeRate: exchangeRate.toString(),
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };
    
    fs.writeFileSync('scripts/somnia/deployment-weighted-pool-2t.json', JSON.stringify(swapInfo, null, 2));
    console.log(`💾 Updated deployment info saved`);
    
    console.log('\n🎉 Swap completed successfully!');
    console.log(`🔄 Swapped ${ethers.formatUnits(amountInUsed, 18)} ${SWAP_CONFIG.tokenIn} for ${ethers.formatUnits(amountOutReceived, 18)} ${SWAP_CONFIG.tokenOut}`);
    console.log(`📊 Exchange rate: 1 ${SWAP_CONFIG.tokenIn} = ${exchangeRate.toFixed(6)} ${SWAP_CONFIG.tokenOut}`);
    
  } catch (error: any) {
    console.error('❌ Error performing swap:', error);
    
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might be due to:');
      console.log('   - Insufficient liquidity in pool');
      console.log('   - Slippage too high');
      console.log('   - Pool not properly initialized');
      console.log('   - Router not properly configured');
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 