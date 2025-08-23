/* eslint-disable comma-spacing */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Permit2 ABI for token approvals
const permit2abi=[{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"AllowanceExpired","type":"error"},{"inputs":[],"name":"ExcessiveInvalidation","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"}],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidContractSignature","type":"error"},{"inputs":[],"name":"InvalidNonce","type":"error"},{"inputs":[],"name":"InvalidSignature","type":"error"},{"inputs":[],"name":"InvalidSignatureLength","type":"error"},{"inputs":[],"name":"InvalidSigner","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"signatureDeadline","type":"uint256"}],"name":"SignatureExpired","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"}],"name":"Lockdown","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint48","name":"newNonce","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"oldNonce","type":"uint48"}],"name":"NonceInvalidation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"nonce","type":"uint48"}],"name":"Permit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"word","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"mask","type":"uint256"}],"name":"UnorderedNonceInvalidation","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint48","name":"newNonce","type":"uint48"}],"name":"invalidateNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wordPos","type":"uint256"},{"internalType":"uint256","name":"mask","type":"uint256"}],"name":"invalidateUnorderedNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"internalType":"struct IAllowanceTransfer.TokenSpenderPair[]","name":"approvals","type":"tuple[]"}],"name":"lockdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"nonceBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails[]","name":"details","type":"tuple[]"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitBatch","name":"permitBatch","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitSingle","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"internalType":"struct IAllowanceTransfer.AllowanceTransferDetails[]","name":"transferDetails","type":"tuple[]"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]

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

// Initial liquidity amounts (in wei) - will be adjusted based on actual balances
const INITIAL_LIQUIDITY_AMOUNTS = {
  shMON: ethers.parseUnits("1", 18), // 1 shMON (will be adjusted)
  sMON: ethers.parseUnits("1", 18),  // 1 sMON (will be adjusted)
  gMON: ethers.parseUnits("1", 18),  // 1 gMON (will be adjusted)
  aprMON: ethers.parseUnits("1", 18) // 1 aprMON (will be adjusted)
};

async function main() {
  console.log('💧 Step 9: Adding Initial Liquidity to LST Pool...');
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-08-router.json')) {
    throw new Error('Please run 08-deploy-router.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-08-router.json', 'utf8'));
  console.log(`📋 Using Router: ${previousInfo.router}`);
  console.log(`📋 Using LST Pool: ${previousInfo.lstPool}`);
  console.log(`📋 Using Vault: ${previousInfo.vault}`);
  
  // Check if Permit2 is available
  if (!previousInfo.permit2 || previousInfo.permit2 === '0x0000000000000000000000000000000000000000') {
    throw new Error('Permit2 not found in deployment info. Router.initialize() requires Permit2 for token approvals.');
  }
  console.log(`📋 Using Permit2: ${previousInfo.permit2}`);
  
  // Connect to contracts
  const router = await ethers.getContractAt('Router', previousInfo.router);
  const pool = await ethers.getContractAt('StablePool', previousInfo.lstPool);
  const vault = await ethers.getContractAt('Vault', previousInfo.vault);
  const vaultExtension = await ethers.getContractAt('VaultExtension', previousInfo.vaultExtension);
  const permit2 = await ethers.getContractAt(permit2abi, previousInfo.permit2);
  console.log(previousInfo);
  
  // Check if pool is registered with Vault before proceeding
  console.log('🔍 Checking pool registration status...');
  try {
    // Try to get pool tokens - this will fail if pool is not registered
    const poolTokens = await pool.getTokens();
    console.log(`📋 Pool is registered and has ${poolTokens.length} tokens`);
    
    // Check if pool is already initialized by checking BPT total supply
    const totalSupply = await pool.totalSupply();
    console.log(`📋 Pool BPT total supply: ${ethers.formatEther(totalSupply)}`);
    
    if (totalSupply > 0) {
      console.log('✅ Pool is already initialized!');
      console.log('💡 No need to add initial liquidity.');
      return;
    }
    
    console.log('📋 Pool is registered but not initialized - proceeding with initialization');
    
  } catch (error) {
    console.error('❌ Error checking pool status:', error);
    console.error('💡 This suggests the pool is not properly registered with the Vault.');
    console.error('🔧 You need to register the pool first. Try running:');
    console.error('   npx hardhat run scripts/register-pool-with-vault.ts --network monad');
    throw error;
  }
  
  // Create sorted token configuration matching the pool
  const sortedTokens = sortAddresses(Object.values(LST_TOKENS));
  
  // Debug: Check rate providers for each token
  console.log('🔍 Checking rate providers...');
  console.log('💡 NOTE: Now using STANDARD tokens (no rate providers) like the tests do.');
  console.log('💡 This should avoid the rate provider revert issues.');
  
  for (let i = 0; i < sortedTokens.length; i++) {
    const tokenAddress = sortedTokens[i];
    const tokenName = Object.keys(LST_TOKENS).find(key => LST_TOKENS[key as keyof typeof LST_TOKENS] === tokenAddress);
    console.log(`📋 Token ${i}: ${tokenName || 'Unknown'} (${tokenAddress})`);
    
    // Note: Rate provider info would be available through the Vault's token configuration
    // but we can't access it directly from the token contract
  }
  
  // Check token balances and approve router
  console.log('🔍 Checking token balances and approvals...');
  
  // Use exactly 1.0 tokens of each LST token (increased from 0.1)
  const adjustedAmounts = [];
  for (let i = 0; i < sortedTokens.length; i++) {
    const tokenAddress = sortedTokens[i];
    const token = await ethers.getContractAt('IERC20', tokenAddress);
    const balance = await token.balanceOf(deployer.address);
    
    // Use exactly 1.0 tokens of each
    const finalAmount = ethers.parseUnits("1.0", 18);
    
    adjustedAmounts.push(finalAmount);
    
    console.log(`📋 Token ${i}: ${tokenAddress}`);
    console.log(`   Balance: ${ethers.formatEther(balance)}`);
    console.log(`   Amount to add: ${ethers.formatEther(finalAmount)}`);
    
    if (balance >= finalAmount) {
      // Step 1: Approve tokens for Router through Permit2 (like the tests do)
      console.log(`🔐 Approving tokens for Router through Permit2...`);
      
      // First approve tokens for Permit2
      const permit2ApproveTx = await token.approve(previousInfo.permit2, finalAmount);
      await permit2ApproveTx.wait();
      console.log(`✅ Tokens approved for Permit2`);
      
      // Then approve Permit2 to spend tokens on behalf of Router
      const permit2ApproveRouterTx = await permit2.approve(
        tokenAddress,
        previousInfo.router,
        finalAmount,
        281474976710655n // MAX_UINT48 = 2^48 - 1
      );
      await permit2ApproveRouterTx.wait();
      console.log(`✅ Permit2 approved to spend tokens for Router`);

    } else {
      throw new Error(`Insufficient balance for token ${i}: ${ethers.formatEther(balance)} < ${ethers.formatEther(finalAmount)}`);
    }
  }

  // Use adjusted amounts for pool initialization
  const sortedAmounts = adjustedAmounts;
  
  console.log(`📋 Sorted tokens:`, sortedTokens);
  console.log(`📋 Sorted amounts:`, sortedAmounts.map((amount, i) => `${ethers.formatEther(amount)} of ${sortedTokens[i]}`));
  
  // Initialize pool with initial liquidity through Router
  console.log('🚀 Initializing pool with liquidity through Router...');
  
  try {
    // Use Router.initialize() - this is the correct way to initialize pools
    const initializeTx = await router.initialize(
      previousInfo.lstPool,
      sortedTokens, // Ensure proper address format
      sortedAmounts,
      0, // minBptAmountOut (0 for initialization)
      false, // wethIsEth (false since we're not using WETH)
      '0x' // userData (empty for stable pools)
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
    
  } catch (error) {
    console.error('❌ Error initializing pool:', error);
    
    // Try alternative approach - add liquidity proportional through Router
    console.log('🔄 Trying proportional liquidity addition through Router...');
    try {
      const addLiquidityTx = await router.addLiquidityProportional(
        previousInfo.lstPool,
        sortedAmounts,
        0, // exactBptAmountOut (0 for proportional)
        false, // wethIsEth
        '0x' // userData
      );
      
      console.log(`📋 Add liquidity transaction: ${addLiquidityTx.hash}`);
      await addLiquidityTx.wait();
      console.log(`✅ Liquidity added successfully!`);
      
    } catch (addError) {
      console.error('❌ Error adding liquidity:', addError);
      throw addError;
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    initialLiquidity: {
      tokens: sortedTokens,
      amounts: sortedAmounts.map(amount => amount.toString()),
      timestamp: Date.now()
    },
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-09-initial-liquidity.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-09-initial-liquidity.json`);
  
  console.log('\n🎉 Initial liquidity addition completed!');
  console.log(`🏊 Pool Address: ${previousInfo.lstPool}`);
  console.log(`🛣️ Router Address: ${previousInfo.router}`);
  console.log(`🏦 Vault Address: ${previousInfo.vault}`);
  console.log(`💧 Liquidity added for ${sortedTokens.length} tokens`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 