# Balancer V3 LST Vault & Pool Deployment Guide

This guide explains how to deploy a Balancer V3 vault and create an LST (Liquid Staking Token) stable pool using the provided deployment script.

## 🎯 What You'll Deploy

1. **Authorizer** - Manages permissions for the vault
2. **Protocol Fee Controller** - Handles protocol fees
3. **Vault Factory** - Factory for deploying vaults
4. **Vault** - Main Balancer V3 vault
5. **Stable Pool Factory** - Factory for stable pools
6. **LST Stable Pool** - The actual LST trading pool

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Yarn** or **npm**
3. **Hardhat**
4. **Private key** with sufficient tokens for deployment
5. **LST tokens** and their **rate providers**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Your Environment

Edit the configuration in `deploy-lst-vault-pool.ts`:

```typescript
// Chain Configuration
const CHAIN_CONFIG = {
  chainId: 1337, // Replace with your chain ID
  rpcUrl: "https://rpc.monad.xyz", // Replace with your RPC
  blockTime: 1,
  gasPrice: ethers.parseUnits("0.000000001", "gwei"),
};

// LST Token Configuration
const LST_TOKENS = {
  stETH: "0x...", // Replace with actual stETH address
  rETH: "0x...",  // Replace with actual rETH address
  cbETH: "0x...", // Replace with actual cbETH address
  // Add more LST tokens as needed
};

// Rate Providers for LST tokens (required for stable pools)
const RATE_PROVIDERS = {
  stETH: "0x...", // Replace with stETH rate provider
  rETH: "0x...",  // Replace with rETH rate provider
  cbETH: "0x...", // Replace with cbETH rate provider
  // Add rate providers for your LST tokens
};
```

### 3. Configure Pool Settings

```typescript
const POOL_CONFIG = {
  name: "LST Stable Pool",
  symbol: "LSTSP",
  swapFeePercentage: ethers.parseUnits("0.0004", 18), // 0.04% - typical for stable pools
  amplificationParameter: ethers.parseUnits("100", 18), // Controls curve flatness
  tokenRateCacheDuration: 900, // 15 minutes cache for rate providers
  enableDonation: true, // Allow donations to pool
  disableUnbalancedLiquidity: false, // Allow unbalanced liquidity
};
```

### 4. Run Deployment

```bash
npx hardhat run deploy-lst-vault-pool.ts --network <your-network>
```

## 🔧 Configuration Details

### LST Tokens

LST tokens are Liquid Staking Tokens that represent staked assets. Examples:
- **stETH** (Lido staked ETH)
- **rETH** (Rocket Pool staked ETH)
- **cbETH** (Coinbase staked ETH)

### Rate Providers

Rate providers are contracts that provide the current exchange rate for LST tokens. They're essential for stable pools to:
- Calculate accurate token ratios
- Handle rebasing tokens
- Maintain pool stability

### Pool Configuration

#### Swap Fee
- **0.04%** - Typical for stable pools (low slippage)
- **0.1%** - Standard for most pools
- **0.3%** - Higher fee for volatile tokens

#### Amplification Parameter
- **30-50** - High amplification (very flat curve)
- **100** - Moderate amplification (balanced)
- **200+** - Low amplification (more like weighted pools)

#### Rate Cache Duration
- **900 seconds** (15 minutes) - Standard for most LST tokens
- **3600 seconds** (1 hour) - For less volatile tokens
- **300 seconds** (5 minutes) - For highly volatile tokens

## 📊 Deployment Process

The deployment follows these steps:

### Step 1: Deploy Authorizer
```typescript
const authorizer = await Authorizer.deploy(deployer.address);
```
- Manages permissions for the vault
- Controls who can perform administrative actions

### Step 2: Deploy Protocol Fee Controller
```typescript
const protocolFeeController = await ProtocolFeeController.deploy(authorizer);
```
- Handles protocol fees
- Manages fee collection and distribution

### Step 3: Deploy Vault Factory
```typescript
const vaultFactory = await VaultFactory.deploy(authorizer);
```
- Factory for deploying vaults
- Uses deterministic deployment pattern

### Step 4: Deploy Vault
```typescript
const vault = await vaultFactory.create(salt, targetAddress, ...);
```
- Main Balancer V3 vault
- Handles all pool operations
- Uses proxy pattern for upgradeability

### Step 5: Deploy Stable Pool Factory
```typescript
const stablePoolFactory = await StablePoolFactory.deploy(vault, ...);
```
- Factory for creating stable pools
- Handles pool creation and configuration

### Step 6: Create LST Pool
```typescript
const pool = await stablePoolFactory.create(name, symbol, tokens, ...);
```
- Creates the actual LST trading pool
- Configures tokens, rates, and parameters

### Step 7: Setup Initial Liquidity
```typescript
await vault.joinPool(poolId, user, recipient, joinRequest);
```
- Adds initial liquidity if tokens are available
- Optional step (can be done later)

## 🎯 LST Pool Features

### Stable Pool Benefits for LST
- **Lower Slippage**: Better for tokens that trade near parity
- **Higher Capital Efficiency**: Allows larger trades
- **Stable Swap Math**: Based on StableSwap algorithm
- **Rate Provider Integration**: Handles rebasing tokens

### Pool Parameters
- **Tokens**: Multiple LST tokens (stETH, rETH, cbETH, etc.)
- **Swap Fee**: 0.04% (optimized for stable tokens)
- **Amplification**: 100 (moderate curve flatness)
- **Rate Cache**: 15 minutes (balances accuracy vs gas costs)

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **Pool ID**: Unique identifier for the pool
2. **Token Count**: Number of tokens in the pool
3. **Swap Fee**: Confirmed fee percentage
4. **Rate Providers**: Properly configured
5. **Initial Liquidity**: If added successfully

## 💧 Adding Liquidity

### Initial Liquidity
The deployment script attempts to add initial liquidity if tokens are available. If not, you can add liquidity later:

```typescript
const joinRequest = {
  assets: tokenAddresses,
  maxAmountsIn: amounts,
  userData: ethers.defaultAbiCoder.encode(
    ["uint256", "uint256[]"],
    [0, amounts] // JOIN_KIND_INIT = 0
  ),
  fromInternalBalance: false
};

await vault.joinPool(poolId, user, recipient, joinRequest);
```

### Ongoing Liquidity Management
- **Join Pool**: Add more liquidity
- **Exit Pool**: Remove liquidity
- **Swap**: Trade between tokens
- **Donate**: Add tokens without receiving LP tokens

## 🔧 Advanced Configuration

### Custom Rate Providers
If your LST tokens don't have standard rate providers, you may need to create custom ones:

```solidity
interface IRateProvider {
    function getRate() external view returns (uint256);
}
```

### Pool Hooks
For advanced functionality, you can add hooks to your pool:

```typescript
const poolHooksContract = "0x..."; // Your custom hooks contract
```

### Fee Management
Configure different fee structures:

```typescript
// Dynamic fees based on volatility
const dynamicFees = {
  swapFeePercentage: ethers.parseUnits("0.0002", 18), // 0.02%
  yieldFeePercentage: ethers.parseUnits("0.1", 18),   // 10%
};
```

## 🚨 Important Considerations

### Security
1. **Verify Contracts**: Always verify deployed contracts
2. **Test Thoroughly**: Test on testnet before mainnet
3. **Rate Providers**: Ensure rate providers are secure and accurate
4. **Access Control**: Properly configure authorizer permissions

### Gas Optimization
1. **Batch Operations**: Use batch functions when possible
2. **Rate Caching**: Optimize cache duration for your use case
3. **Token Selection**: Choose appropriate number of tokens

### LST-Specific Considerations
1. **Rebasing**: Handle tokens that rebase (change total supply)
2. **Rate Updates**: Ensure rate providers update frequently enough
3. **Liquidity Depth**: LST pools need sufficient liquidity for stability

## 📈 Monitoring Your Pool

### Key Metrics to Track
- **Total Value Locked (TVL)**
- **Swap Volume**
- **Fee Revenue**
- **Liquidity Depth**
- **Rate Provider Accuracy**

### Tools for Monitoring
- **Balancer Analytics**: Track pool performance
- **Rate Provider Monitoring**: Ensure accurate rates
- **Liquidity Alerts**: Monitor liquidity levels

## 🆘 Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: Insufficient balance for deployment
   ```
   **Solution**: Add more tokens to your deployer account

2. **Rate Provider Issues**
   ```
   Error: Rate provider not found
   ```
   **Solution**: Verify rate provider addresses and functionality

3. **Pool Creation Failed**
   ```
   Error: Pool creation event not found
   ```
   **Solution**: Check factory deployment and parameters

4. **Token Approval Issues**
   ```
   Error: ERC20: transfer amount exceeds allowance
   ```
   **Solution**: Ensure tokens are approved for the vault

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network <network> <contract-address>

# Test pool functionality
npx hardhat test test-lst-pool.ts

# Monitor gas usage
REPORT_GAS=true npx hardhat run deploy-lst-vault-pool.ts
```

## 📚 Additional Resources

- [Balancer V3 Documentation](https://docs.balancer.fi/)
- [LST Token Information](https://ethereum.org/en/staking/)
- [Rate Provider Guide](https://docs.balancer.fi/concepts/fees/rate-providers)
- [Stable Pool Math](https://docs.balancer.fi/concepts/math/stable-math)

## 🤝 Support

For issues and questions:
- Create an issue in this repository
- Check the Balancer documentation
- Join the Balancer community

---

**Happy Deploying! 🚀** 