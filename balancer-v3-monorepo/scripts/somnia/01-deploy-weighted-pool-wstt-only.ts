/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Custom sorting function for addresses (like the one in sortingHelper)
function sortAddresses(addresses: string[]): string[] {
  return addresses.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// Somnia Token Configuration (USDTG and PUMPAZ only)
const SOMNIA_TOKENS = {
  USDTG: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
  WSTT: "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
  PUMPAZ: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58",
  NIA: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311",
  CHECK: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8",
  STT: "0x0000000000000000000000000000000000000000" // Native token (special handling)
};

// Pool Configuration for Weighted Pool
const POOL_CONFIG = {
  name: 'Somnia WSTT-NIA Weighted Pool',
  symbol: 'SOMNIA-WP-2T',
  swapFeePercentage: ethers.parseUnits('0.003', 18), // 0.3% - standard for weighted pools
  enableDonation: true,
  disableUnbalancedLiquidity: false
};

// Weights for the 2 tokens (must sum to 1e18)
const WEIGHTS = [
  ethers.parseUnits('0.5', 18),  // PUMPAZ: 50%
  ethers.parseUnits('0.5', 18)   // USDTG: 50%
];

// Verify weights sum to 1e18
const totalWeight = WEIGHTS.reduce((sum, weight) => sum + weight, 0n);
if (totalWeight !== ethers.parseUnits('1', 18)) {
  throw new Error(`Weights must sum to 1e18, got ${totalWeight}`);
}

async function main() {
  console.log('🚀 Step 1: Creating Somnia Weighted Pool (WSTT + NIA)...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Check if we have deployment info from previous steps
  let previousInfo = {};
  if (fs.existsSync('scripts/somnia/deployment-weighted-pool-factory.json')) {
    previousInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-weighted-pool-factory.json', 'utf8'));
    console.log(`📋 Using WeightedPoolFactory: ${previousInfo.weightedPoolFactory}`);
  } else {
    console.log('⚠️  No previous deployment info found. Please run the factory deployment first.');
    return;
  }
  
  // Connect to the factory
  const factory = await ethers.getContractAt('WeightedPoolFactory', previousInfo.weightedPoolFactory);
  
  // Verify factory is ready
  const isDisabled = await factory.isDisabled();
  if (isDisabled) {
    throw new Error('Factory is disabled!');
  }
  
  console.log(`✅ Factory is enabled and ready`);
  
  // Create sorted token configuration (must be sorted by address)
  const sortedTokens = sortAddresses([
    SOMNIA_TOKENS.WSTT,
    SOMNIA_TOKENS.NIA
  ]);
  
  console.log(`📋 Sorted token addresses:`, sortedTokens);
  
  // Create token configuration for the factory
  const tokenConfig = sortedTokens.map((tokenAddress, index) => {
    console.log(`📋 Token ${index}: ${tokenAddress} (ERC20)`);
    
    return {
      token: tokenAddress,
      tokenType: 0, // STANDARD for all tokens
      rateProvider: ethers.ZeroAddress, // No rate providers needed
      paysYieldFees: false
    };
  });
  
  console.log(`📋 Token config:`, tokenConfig);
  
  // Verify tokens are properly sorted
  const isSorted = sortedTokens.every((token, i) => 
    i === 0 || token > sortedTokens[i - 1]
  );
  
  if (!isSorted) {
    throw new Error('Tokens are not properly sorted by address!');
  }
  
  console.log(`✅ Token sorting verified`);
  
  // Create the pool
  console.log('🚀 Creating Somnia weighted pool...');
  
  try {
    const tx = await factory.create(
      POOL_CONFIG.name,
      POOL_CONFIG.symbol,
      tokenConfig,
      WEIGHTS,
      {
        poolCreator: ethers.ZeroAddress,
        swapFeeManager: ethers.ZeroAddress,
        pauseManager: ethers.ZeroAddress
      },
      POOL_CONFIG.swapFeePercentage,
      ethers.ZeroAddress, // no hooks
      POOL_CONFIG.enableDonation,
      POOL_CONFIG.disableUnbalancedLiquidity,
      ethers.keccak256(ethers.toUtf8Bytes('somnia-weighted-pool-2t-v1'))
    );
    
    console.log(`📋 Pool creation transaction: ${tx.hash}`);
    console.log(`⏳ Waiting for transaction confirmation...`);
    
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Find the PoolCreated event
    const poolCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === 'PoolCreated';
      } catch {
        return false;
      }
    });
    
    if (!poolCreatedEvent) {
      throw new Error('PoolCreated event not found in transaction logs');
    }
    
    const parsedEvent = factory.interface.parseLog(poolCreatedEvent);
    if (!parsedEvent) {
      throw new Error('Failed to parse PoolCreated event');
    }
    
    const poolAddress = parsedEvent.args.pool;
    
    console.log(`✅ Somnia Weighted Pool created at: ${poolAddress}`);
    
    // Verify pool was created by this factory
    const isFromFactory = await factory.isPoolFromFactory(poolAddress);
    if (!isFromFactory) {
      throw new Error('Pool was not created by this factory!');
    }
    
    console.log(`✅ Pool verified as created by this factory`);
    
    // Get pool info
    const pool = await ethers.getContractAt('WeightedPool', poolAddress);
    const poolTokens = await pool.getTokens();
    const weights = await pool.getNormalizedWeights();
    
    console.log(`📋 Pool tokens: ${poolTokens.length}`);
    console.log(`📋 Pool name: ${await pool.name()}`);
    console.log(`📋 Pool symbol: ${await pool.symbol()}`);
    console.log(`📋 Pool weights:`, weights.map(w => ethers.formatUnits(w, 18)));
    
    // Save deployment info
    const deploymentInfo = {
      ...previousInfo,
      somniaWeightedPool: poolAddress,
      somniaTokens: SOMNIA_TOKENS,
      poolConfig: {
        ...POOL_CONFIG,
        swapFeePercentage: POOL_CONFIG.swapFeePercentage.toString(),
        weights: WEIGHTS.map(w => w.toString())
      },
      timestamp: Date.now()
    };
    
    fs.writeFileSync('scripts/somnia/deployment-weighted-pool-2t.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to scripts/somnia/deployment-weighted-pool-2t.json`);
    
    console.log('\n🎉 Somnia Weighted Pool deployment completed successfully!');
    console.log(`📊 Pool Address: ${poolAddress}`);
    console.log(`🪙 Tokens: ${poolTokens.length}`);
    console.log(`🏭 Factory: ${previousInfo.weightedPoolFactory}`);
    console.log(`⚖️  Weights: USDTG(50%) PUMPAZ(50%)`);
    
    return pool;
    
  } catch (error: any) {
    console.error('❌ Error creating pool:', error);
    
    // Additional debugging info
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might be due to:');
      console.log('   - Factory not having permission to register pools');
      console.log('   - Invalid token configuration');
      console.log('   - Pool already exists');
      console.log('   - Invalid weights configuration');
      console.log('   - Native token not supported (try using PUMPAZ only)');
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