/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Initial liquidity amounts (0.5 of each token)
const INITIAL_LIQUIDITY = {
  USDTG: ethers.parseUnits('3', 18),  // 0.5 USDTG
  PUMPAZ: ethers.parseUnits('3', 18)    // 0.5 WSTT
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
  console.log('💧 Step 3: Adding Initial Liquidity to Somnia Weighted Pool...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load deployment info
  if (!fs.existsSync('scripts/somnia/deployment-weighted-pool-2t.json')) {
    throw new Error('Please run 01-deploy-weighted-pool-wstt-only.ts first');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-weighted-pool-2t.json', 'utf8'));
  console.log(`📋 Using Pool: ${poolInfo.somniaWeightedPool}`);
  console.log(`📋 Using Router: ${poolInfo.router}`);
  console.log(`📋 Using Vault: ${poolInfo.vault}`);
  
  // Check if router exists
  if (!poolInfo.router || poolInfo.router === "0x0000000000000000000000000000000000000000") {
    throw new Error('Router not deployed. Please run 02-deploy-router.ts first');
  }
  
  // Get token addresses
  const usdtgAddress = poolInfo.somniaTokens.USDTG;
  const pumpazAddress = poolInfo.somniaTokens.PUMPAZ;
  
  console.log(`📋 USDTG Address: ${usdtgAddress}`);
  console.log(`📋 WSTT Address: ${pumpazAddress}`);
  
  // Connect to the pool
  const pool = await ethers.getContractAt('WeightedPool', poolInfo.somniaWeightedPool);
  
  // Connect to the router
  const router = await ethers.getContractAt('Router', poolInfo.router);
  
  // Check if pool is already initialized by checking BPT total supply
  const totalSupply = await pool.totalSupply();
  console.log(`📋 Pool total supply: ${ethers.formatEther(totalSupply)} BPT`);
  
  if (totalSupply > 0n) {
    console.log('✅ Pool is already initialized!');
    console.log('🔄 Adding more liquidity...');
  } else {
    console.log('📋 Pool is registered but not initialized - proceeding with initialization');
  }
  
  // Get pool tokens
  const poolTokens = await pool.getTokens();
  console.log(`📋 Pool tokens: ${poolTokens.length}`);
  
  // Create sorted token array for router operations
  const sortedTokens = [usdtgAddress, pumpazAddress].sort();
  console.log(`📋 Sorted tokens for router: ${sortedTokens}`);
  
  // Create initial balances array (must match sorted token order)
  const initialBalances = sortedTokens.map(token => {
    if (token === usdtgAddress) return INITIAL_LIQUIDITY.USDTG;
    if (token === pumpazAddress) return INITIAL_LIQUIDITY.PUMPAZ;
    return 0n;
  });
  
  console.log(`📋 Initial balances:`, initialBalances.map((bal, i) => 
    `${ethers.formatUnits(bal, 18)} ${sortedTokens[i] === usdtgAddress ? 'USDTG' : 'WSTT'}`
  ));
  
  // Check token balances
  console.log('\n💰 Checking token balances...');
  
  // For now, we'll assume the deployer has enough tokens
  // In production, you'd need to mint or transfer tokens to the deployer first
  console.log(`⚠️  Note: Deployer must have at least 0.5 USDTG and 0.5 WSTT to add liquidity`);
  
  // Approve tokens for the router through Permit2
  console.log('\n🔐 Approving tokens for router through Permit2...');
  
  try {
    // Get Permit2 address from deployment info
    const permit2Address = poolInfo.permit2 || "0xb012c6B0f0Ce47eB7Da3B542A18aBBa355458826"; // Use placeholder if not in deployment
    console.log(`📋 Using Permit2: ${permit2Address}`);
    
    const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Address);
    
    // Approve USDTG
    const usdtg = await ethers.getContractAt('IERC20', usdtgAddress);
    console.log('🔐 Approving USDTG for Permit2...');
    const usdtgApprovePermit2Tx = await usdtg.approve(permit2Address, ethers.MaxUint256);
    await usdtgApprovePermit2Tx.wait();
    console.log('✅ USDTG approved for Permit2');
    
    console.log('🔐 Approving Permit2 to spend USDTG for Router...');
    const usdtgApproveRouterTx = await permit2.approve(
      usdtgAddress,
      poolInfo.router,
      INITIAL_LIQUIDITY.USDTG, // Use exactly 0.5 USDTG
      MAX_UINT48
    );
    await usdtgApproveRouterTx.wait();
    console.log('✅ Permit2 approved to spend USDTG for Router');
    
    // Approve WSTT
    const wstt = await ethers.getContractAt('IERC20', pumpazAddress);
    console.log('🔐 Approving PUMPAZ for Permit2...');
    const wsttApprovePermit2Tx = await wstt.approve(permit2Address, ethers.MaxUint256);
    await wsttApprovePermit2Tx.wait();
    console.log('✅ PUMPAZ approved for Permit2');
    
    console.log('🔐 Approving Permit2 to spend PUMPAZ for Router...');
    const wsttApproveRouterTx = await permit2.approve(
      pumpazAddress,
      poolInfo.router,
      INITIAL_LIQUIDITY.PUMPAZ, // Use exactly 0.5 WSTT
      MAX_UINT48
    );
    await wsttApproveRouterTx.wait();
    console.log('✅ Permit2 approved to spend PUMPAZ for Router');
    
  } catch (error: any) {
    console.error('❌ Error approving tokens:', error);
    console.log('💡 This might be due to:');
    console.log('   - Token contracts not existing');
    console.log('   - Insufficient token balance');
    console.log('   - Network issues');
    throw error;
  }
  
  // Add liquidity to the pool
  console.log('\n💧 Adding liquidity to pool...');
  
  try {
    if (totalSupply === 0n) {
      // Initialize pool with initial liquidity through Router
      console.log('🚀 Initializing pool with liquidity through Router...');
      
      const initializeTx = await router.initialize(
        poolInfo.somniaWeightedPool,
        sortedTokens,
        initialBalances,
        0, // minBptAmountOut (0 for initialization)
        false, // wethIsEth (false since we're not using WETH)
        '0x' // userData (empty for weighted pools)
      );
      
      console.log(`📋 Initialize transaction: ${initializeTx.hash}`);
      const receipt = await initializeTx.wait();
      
      if (receipt) {
        console.log(`✅ Pool initialized successfully!`);
        console.log(`📋 Pool initialized with ${sortedTokens.length} tokens`);
        
        // Get BPT balance
        const bptBalance = await pool.balanceOf(deployer.address);
        console.log(`✅ BPT received: ${ethers.formatEther(bptBalance)}`);
      }
      
    } else {
      // Add more liquidity through Router
      console.log('🔄 Adding more liquidity through Router...');
      
      const addLiquidityTx = await router.addLiquidityProportional(
        poolInfo.somniaWeightedPool,
        initialBalances,
        0, // exactBptAmountOut (0 for proportional)
        false, // wethIsEth
        '0x' // userData
      );
      
      console.log(`📋 Add liquidity transaction: ${addLiquidityTx.hash}`);
      await addLiquidityTx.wait();
      console.log(`✅ Liquidity added successfully!`);
    }
    
    // Get updated pool info
    const updatedTotalSupply = await pool.totalSupply();
    const poolTokens = await pool.getTokens();
    
    console.log('\n📊 Pool status after adding liquidity:');
    console.log(`   Total BPT Supply: ${ethers.formatEther(updatedTotalSupply)}`);
    console.log(`   Pool tokens: ${poolTokens.length}`);
    
    // Save updated deployment info
    const deploymentInfo = {
      ...poolInfo,
      initialLiquidityAdded: true,
      initialLiquidityAmounts: {
        USDTG: INITIAL_LIQUIDITY.USDTG.toString(),
        WSTT: INITIAL_LIQUIDITY.PUMPAZ.toString()
      },
      poolInitialized: updatedTotalSupply > 0n,
      timestamp: Date.now()
    };
    
    fs.writeFileSync('scripts/somnia/deployment-weighted-pool-2t.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Updated deployment info saved`);
    
    console.log('\n🎉 Initial liquidity added successfully!');
    console.log(`🏊 Pool: ${poolInfo.somniaWeightedPool}`);
    console.log(`💧 USDTG: ${ethers.formatUnits(INITIAL_LIQUIDITY.USDTG, 18)}`);
    console.log(`💧 WSTT: ${ethers.formatUnits(INITIAL_LIQUIDITY.PUMPAZ, 18)}`);
    console.log(`📊 Pool initialized: ${updatedTotalSupply > 0n}`);
    
  } catch (error: any) {
    console.error('❌ Error adding liquidity:', error);
    
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might be due to:');
      console.log('   - Insufficient token balance');
      console.log('   - Pool not properly deployed');
      console.log('   - Router not properly configured');
      console.log('   - Token approval issues');
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