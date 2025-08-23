/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Load deployment info from the latest deployment
const deploymentInfo = JSON.parse(fs.readFileSync('deployment-vault-router-pool-1754348917626.json', 'utf8'));

// Use the LST tokens from the deployment info
const LST_TOKENS = deploymentInfo.configuration.lstTokens;
const RATE_PROVIDERS = deploymentInfo.configuration.rateProviders;

// ============================================================================
// POOL INITIALIZATION CLASS
// ============================================================================

class PoolInitializer {
  private deployer: any = null;
  private deployedContracts: any = {};

  constructor() {
    console.log("🚀 Pool Initializer for Balancer V3");
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    console.log("\n🔧 Initializing pool initialization...");
    
    [this.deployer] = await ethers.getSigners();
    console.log(`📋 Deployer: ${this.deployer.address}`);
    
    const balance = await ethers.provider.getBalance(this.deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.1")) {
      throw new Error("Insufficient balance for initialization");
    }

    // Connect to existing contracts
    this.deployedContracts.vault = await ethers.getContractAt("Vault", deploymentInfo.contracts.vault);
    this.deployedContracts.router = await ethers.getContractAt("Router", deploymentInfo.contracts.router);
    this.deployedContracts.permit2 = await ethers.getContractAt("BasicAuthorizerMock", deploymentInfo.contracts.permit2);
    this.deployedContracts.pool = await ethers.getContractAt("StablePool", deploymentInfo.contracts.pool);
    
    console.log(`✅ Connected to existing Vault: ${deploymentInfo.contracts.vault}`);
    console.log(`✅ Connected to existing Router: ${deploymentInfo.contracts.router}`);
    console.log(`✅ Connected to existing Permit2: ${deploymentInfo.contracts.permit2}`);
    console.log(`✅ Connected to existing Pool: ${deploymentInfo.contracts.pool}`);
  }

  // ============================================================================
  // INITIALIZE POOL
  // ============================================================================

  async initializePool() {
    console.log('\n🚀 Initializing Pool...');
    
    const poolAddress = await this.deployedContracts.pool.getAddress();
    
    try {
      console.log('📋 Proceeding with pool initialization...');
      
      // Check if pool is already initialized
      try {
        const totalSupply = await this.deployedContracts.pool.totalSupply();
        console.log(`📋 Pool total supply: ${ethers.formatEther(totalSupply)}`);
        if (totalSupply > 0) {
          console.log('✅ Pool is already initialized!');
          return;
        }
      } catch (error) {
        console.log('📋 Pool not initialized yet');
      }
      
      // Check if pool is registered with vault
      try {
        const isRegistered = await this.deployedContracts.vault.isPoolRegistered(poolAddress);
        console.log(`📋 Pool registered with vault: ${isRegistered}`);
        if (!isRegistered) {
          console.log('❌ Pool is not registered with vault!');
          return;
        }
      } catch (error) {
        console.log('⚠️  Could not check pool registration status');
      }
      
      // Use the known LST tokens from the deployment
      const poolTokenAddresses = Object.values(LST_TOKENS);
      const poolTokens = await Promise.all(poolTokenAddresses.map(address => ethers.getContractAt('IERC20', address)));
      console.log(`📋 Pool tokens: ${poolTokens.length}`);
      
      // Check token balances
      console.log('📋 Checking token balances:');
      for (let i = 0; i < poolTokens.length; i++) {
        const token = poolTokens[i];
        const balance = await token.balanceOf(this.deployer.address);
        console.log(`   Token ${i + 1}: ${ethers.formatEther(balance)}`);
      }
      
      // Prepare initialization amounts (small amounts for testing)
      const amountsIn = poolTokens.map(() => ethers.parseEther('1')); // 1 token each
      console.log(`📋 Initialization amounts: ${amountsIn.map((amount: any) => ethers.formatEther(amount))}`);
      
      // Approve tokens for Permit2
      console.log('🔐 Approving tokens for Permit2...');
      for (let i = 0; i < poolTokens.length; i++) {
        const token = poolTokens[i];
        const amount = amountsIn[i];
        
        // Check allowance for Permit2
        const allowance = await token.allowance(this.deployer.address, await this.deployedContracts.permit2.getAddress());
        if (allowance < amount) {
          console.log(`📋 Approving ${ethers.formatEther(amount)} tokens for Permit2...`);
          const approveTx = await token.approve(await this.deployedContracts.permit2.getAddress(), amount);
          await approveTx.wait();
          console.log(`✅ Approved tokens for Permit2`);
        } else {
          console.log(`✅ Tokens already approved for Permit2`);
        }
      }
      
      // Approve tokens directly for Router
      console.log('🔐 Approving tokens directly for Router...');
      for (let i = 0; i < poolTokens.length; i++) {
        const token = poolTokens[i];
        const amount = amountsIn[i];
        
        // Check allowance for Router
        const allowance = await token.allowance(this.deployer.address, await this.deployedContracts.router.getAddress());
        if (allowance < amount) {
          console.log(`📋 Approving ${ethers.formatEther(amount)} tokens for Router...`);
          const approveTx = await token.approve(await this.deployedContracts.router.getAddress(), amount);
          await approveTx.wait();
          console.log(`✅ Approved tokens for Router`);
        } else {
          console.log(`✅ Tokens already approved for Router`);
        }
      }
      
      // Approve pool tokens for Router
      console.log('🔐 Approving pool tokens for Router...');
      const poolApproveTx = await this.deployedContracts.pool.approve(await this.deployedContracts.router.getAddress(), ethers.MaxUint256);
      await poolApproveTx.wait();
      console.log('✅ Pool tokens approved for Router');
      
      // Initialize the pool through Router
      console.log('🚀 Initializing pool with liquidity through Router...');
      const initializeTx = await this.deployedContracts.router.initialize(
        poolAddress,
        poolTokens,
        amountsIn,
        0n, // minBptAmountOut (FP_ZERO from test)
        false, // wethIsEth (false since we're not using WETH)
        '0x' // userData (empty for stable pools)
      );
      
      const receipt = await initializeTx.wait();
      console.log(`✅ Pool initialization transaction: ${receipt.hash}`);
      
      // Get BPT balance
      const bptBalance = await this.deployedContracts.pool.balanceOf(this.deployer.address);
      console.log(`✅ BPT received: ${ethers.formatEther(bptBalance)}`);
      
      console.log('✅ Pool initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Pool initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // VERIFY BALANCES
  // ============================================================================

  async verifyBalances() {
    console.log('\n🔍 Verifying Balances...');
    
    try {
      // Get pool tokens
      const poolTokenAddresses = Object.values(LST_TOKENS);
      const poolTokens = await Promise.all(poolTokenAddresses.map(address => ethers.getContractAt('IERC20', address)));
      
      console.log('📋 Token balances:');
      for (let i = 0; i < poolTokens.length; i++) {
        const token = poolTokens[i];
        const balance = await token.balanceOf(this.deployer.address);
        console.log(`   Token ${i + 1}: ${ethers.formatEther(balance)}`);
      }
      
      // Get BPT balance
      const bptBalance = await this.deployedContracts.pool.balanceOf(this.deployer.address);
      console.log(`📋 BPT balance: ${ethers.formatEther(bptBalance)}`);
      
      // Get pool total supply
      const totalSupply = await this.deployedContracts.pool.totalSupply();
      console.log(`📋 Pool total supply: ${ethers.formatEther(totalSupply)}`);
      
    } catch (error) {
      console.error('❌ Balance verification failed:', error);
    }
  }

  // ============================================================================
  // MAIN INITIALIZATION METHOD
  // ============================================================================

  async run() {
    try {
      await this.initialize();
      
      // Initialize Pool
      await this.initializePool();
      
      // Verify Balances
      await this.verifyBalances();
      
      console.log('\n🎉 Pool initialization completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   Vault: ${deploymentInfo.contracts.vault}`);
      console.log(`   Router: ${deploymentInfo.contracts.router}`);
      console.log(`   Pool: ${deploymentInfo.contracts.pool}`);
      
    } catch (error) {
      console.error('❌ Pool initialization failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const initializer = new PoolInitializer();
  await initializer.run();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 