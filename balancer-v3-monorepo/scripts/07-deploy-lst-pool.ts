/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Custom sorting function for addresses (like the one in sortingHelper)
function sortAddresses(addresses: string[]): string[] {
  return addresses.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// LST Token Configuration for Monad
const LST_TOKENS = {
  shMON: "0x3a98250F98Dd388C211206983453837C8365BDc1",
  sMON: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5",
  gMON: "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3",
  aprMON: "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A"
};

// Rate Providers for LST tokens
const RATE_PROVIDERS = {
  shMON: "0x4156c42A73F8f4FA5Cdd5A3BB4840e33248Bd247",
  sMON: "0xAe3b6C92730f3321a19d30b58680D538A8Bb4b0A",
  gMON: "0x3C5184923589A81c52a9278f192a6B7Cf5bF7bB1",
  aprMON: "0x03AbF8FFee11b49EAC279C435A7513610e4e0E7f"
};

// Pool Configuration
const POOL_CONFIG = {
  name: 'Monad LST Stable Pool V4', // Changed name to avoid conflicts
  symbol: 'MLSTSP4', // Changed symbol to avoid conflicts
  amplificationParameter: 100, // Moderate curve flatness (1-50000 range)
  swapFeePercentage: ethers.parseUnits('0.0004', 18), // 0.04% - typical for stable pools
  enableDonation: true,
  disableUnbalancedLiquidity: false
};

async function main() {
  console.log('�� Step 7: Creating 4-Token LST Pool...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`�� Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-06-stable-pool-factory.json')) {
    throw new Error('Please run 06-deploy-stable-pool-factory.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-06-stable-pool-factory.json', 'utf8'));
  console.log(`📋 Using StablePoolFactory: ${previousInfo.stablePoolFactory}`);
  console.log(`📋 Using Vault: ${previousInfo.vault}`);
  
  // Connect to the factory
  const factory = await ethers.getContractAt('StablePoolFactory', previousInfo.stablePoolFactory);
  
  // Verify factory is ready
  const isDisabled = await factory.isDisabled();
  if (isDisabled) {
    throw new Error('Factory is disabled!');
  }
  
  console.log(`✅ Factory is enabled and ready`);
  
  // Create sorted token configuration (must be sorted by address)
  const sortedTokens = sortAddresses(Object.values(LST_TOKENS));
  console.log(`📋 Sorted token addresses:`, sortedTokens);
  
  // Create a mapping of token address to rate provider for easy lookup
  const tokenToRateProvider = Object.entries(LST_TOKENS).reduce((acc, [tokenName, tokenAddress]) => {
    acc[tokenAddress] = RATE_PROVIDERS[tokenName as keyof typeof RATE_PROVIDERS];
    return acc;
  }, {} as Record<string, string>);
  
  const tokenConfig = sortedTokens.map((tokenAddress) => {
    const rateProvider = tokenToRateProvider[tokenAddress] || ethers.ZeroAddress;
    
    console.log(`📋 Token ${tokenAddress} -> Rate Provider: ${rateProvider}`);
    
    return {
      token: tokenAddress,
      tokenType: 1, // WITH_RATE for LST tokens
      rateProvider: rateProvider,
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
  console.log('🚀 Creating LST pool...');
  
  try {
    const tx = await factory.create(
      POOL_CONFIG.name,
      POOL_CONFIG.symbol,
      tokenConfig,
      POOL_CONFIG.amplificationParameter,
      {
        poolCreator: ethers.ZeroAddress,
        swapFeeManager: ethers.ZeroAddress,
        pauseManager: ethers.ZeroAddress
      },
      POOL_CONFIG.swapFeePercentage,
      ethers.ZeroAddress, // no hooks
      POOL_CONFIG.enableDonation,
      POOL_CONFIG.disableUnbalancedLiquidity,
      ethers.keccak256(ethers.toUtf8Bytes('monad-lst-pools-v4')) // Changed salt to avoid conflicts
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
    
    console.log(`✅ LST Pool created at: ${poolAddress}`);
    
    // Verify pool was created by this factory
    const isFromFactory = await factory.isPoolFromFactory(poolAddress);
    if (!isFromFactory) {
      throw new Error('Pool was not created by this factory!');
    }
    
    console.log(`✅ Pool verified as created by this factory`);
    
    // Get pool info
    const pool = await ethers.getContractAt('StablePool', poolAddress);
    const poolTokens = await pool.getTokens();
    
    console.log(`📋 Pool tokens: ${poolTokens.length}`);
    console.log(`�� Pool name: ${await pool.name()}`);
    console.log(`📋 Pool symbol: ${await pool.symbol()}`);
    
    // Save deployment info
    const deploymentInfo = {
      ...previousInfo,
      lstPool: poolAddress,
      lstTokens: LST_TOKENS,
      rateProviders: RATE_PROVIDERS,
      poolConfig: {
        ...POOL_CONFIG,
        amplificationParameter: POOL_CONFIG.amplificationParameter.toString(),
        swapFeePercentage: POOL_CONFIG.swapFeePercentage.toString()
      },
      timestamp: Date.now()
    };
    
    fs.writeFileSync('deployment-07-lst-pool.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to deployment-07-lst-pool.json`);
    
    console.log('\n🎉 LST Pool deployment completed successfully!');
    console.log(`📊 Pool Address: ${poolAddress}`);
    console.log(`🪙 Tokens: ${poolTokens.length}`);
    console.log(`🏭 Factory: ${previousInfo.stablePoolFactory}`);
    console.log(`🏦 Vault: ${previousInfo.vault}`);
    
    return pool;
    
  } catch (error: any) {
    console.error('❌ Error creating pool:', error);
    
    // Additional debugging info
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might be due to:');
      console.log('   - Factory not having permission to register pools');
      console.log('   - Vault being paused');
      console.log('   - Invalid token configuration');
      console.log('   - Pool already exists');
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