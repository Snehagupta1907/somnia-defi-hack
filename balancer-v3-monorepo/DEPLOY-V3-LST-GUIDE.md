# 🚀 Deploy Balancer V3 Vault and LST Pool

## Quick Start Guide for Your LST Tokens

This guide will help you deploy a Balancer V3 vault and create an LST pool for your tokens (shMON, sMON, gMON, aprMON).

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Yarn** or **npm**
3. **Hardhat**
4. **Private key** with sufficient MONAD tokens
5. **Your LST tokens** and rate providers (already configured)

## 🎯 What You'll Deploy

1. **Authorizer** - Permission management
2. **Protocol Fee Controller** - Fee handling
3. **Vault Factory** - Vault deployment factory
4. **Vault** - Main Balancer V3 vault
5. **Stable Pool Factory** - Pool creation factory
6. **LST Pool** - Your 4-token LST trading pool

## 🚀 Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
cd balancer-v3-monorepo
yarn install
```

### Step 2: Configure Your Environment

The deployment script is already configured with your LST tokens:

```typescript
// Your LST Tokens
const LST_TOKENS = {
  shMON: "0x3a98250F98Dd388C211206983453837C8365BDc1",
  sMON: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5", 
  gMON: "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3",
  aprMON: "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A",
};

// Your Rate Providers
const RATE_PROVIDERS = {
  shMON: "0x4156c42A73F8f4FA5Cdd5A3BB4840e33248Bd247",
  sMON: "0xAe3b6C92730f3321a19d30b58680D538A8Bb4b0A",
  gMON: "0x3C5184923589A81c52a9278f192a6B7Cf5bF7bB1",
  aprMON: "0x03AbF8FFee11b49EAC279C435A7513610e4e0E7f",
};
```

### Step 3: Set Up Hardhat Network

Create or update your `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    monad: {
      url: "https://rpc.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};

export default config;
```

### Step 4: Set Environment Variables

Create a `.env` file:

```env
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=https://rpc.monad.xyz
```

### Step 5: Deploy V3 Vault and Pool

```bash
# Deploy to Monad network
npx hardhat run deploy-lst-vault-pool.ts --network monad
```

## 📊 Expected Output

You should see output like this:

```
🚀 LST Vault & Pool Deployer for Balancer V3

🔧 Initializing deployment...
📋 Deployer: 0x...
💰 Balance: 1.5 MONAD

🔐 Step 1: Deploying Authorizer...
✅ Authorizer: 0x...

💰 Step 2: Deploying Protocol Fee Controller...
✅ Protocol Fee Controller: 0x...

🏭 Step 3: Deploying Vault Factory...
✅ Vault Factory: 0x...

🏦 Step 4: Deploying Vault...
✅ Vault: 0x...

🏊 Step 5: Deploying Stable Pool Factory...
✅ Stable Pool Factory: 0x...

🌊 Step 6: Creating LST Stable Pool...
📋 Pool Configuration:
   Name: LST Stable Pool
   Symbol: LSTSP
   Swap Fee: 0.04%
   Amplification: 100
   Tokens: 4
✅ LST Stable Pool: 0x...

💧 Step 7: Setting up initial liquidity...
✅ Initial liquidity added successfully

🔍 Step 8: Verifying deployment...
✅ Pool ID: 0x...
✅ Pool tokens: 4
✅ Swap fee: 0.04%
✅ Deployment verification passed

💾 Step 9: Saving deployment information...
✅ Deployment info saved to: deployment-lst-vault-1234567890.json

🎉 LST Vault & Pool deployment completed successfully!

📋 Summary:
   Vault: 0x...
   LST Pool: 0x...
   Pool ID: 0x...
```

## 🔍 Verify Your Deployment

### Step 6: Test Your Deployment

```bash
# Update test-lst-pool.ts with your deployed addresses
# Then run the test
npx hardhat run test-lst-pool.ts --network monad
```

## 📈 V3 Improvements Over Your V2

### **Fee Optimization**
- **V2**: 1% swap fee
- **V3**: 0.04% swap fee (25x lower!)
- **Benefit**: Higher trading volume, better for LST arbitrage

### **Amplification Optimization**
- **V2**: 30 (very flat curve)
- **V3**: 100 (moderate curve)
- **Benefit**: Better price discovery for your LST tokens

### **Advanced Features**
- **Rate caching** - Reduces gas costs
- **MEV protection** - Fair trading
- **Hooks system** - Custom LST logic
- **Batch operations** - Efficient multi-token swaps

## 🎯 Pool Configuration Details

### **Your LST Pool Settings:**
```typescript
const POOL_CONFIG = {
  name: "LST Stable Pool",
  symbol: "LSTSP",
  swapFeePercentage: ethers.parseUnits("0.0004", 18), // 0.04%
  amplificationParameter: ethers.parseUnits("100", 18), // Moderate curve
  tokenRateCacheDuration: 900, // 15 minutes
  enableDonation: true, // Allow donations
  disableUnbalancedLiquidity: false, // Flexible joins
};
```

### **Why These Settings Are Better:**

#### **0.04% Swap Fee (vs 1% in V2)**
- **Lower fees** encourage more trading
- **Better for arbitrage** between LST tokens
- **Higher volume** = more fee revenue
- **Competitive** with other DEXs

#### **100 Amplification (vs 30 in V2)**
- **30**: Very flat curve, good for identical tokens
- **100**: Balanced curve, better for LST with slight differences
- **Better price discovery** for shMON, sMON, gMON, aprMON

## 💧 Adding Liquidity

### **Initial Liquidity**
The deployment script will attempt to add initial liquidity if you have tokens:

```typescript
// The script automatically:
// 1. Checks your token balances
// 2. Approves tokens for the vault
// 3. Adds liquidity to the pool
```

### **Manual Liquidity Addition**
If you want to add liquidity later:

```typescript
const joinRequest = {
  assets: [shMON, sMON, gMON, aprMON],
  maxAmountsIn: [amount1, amount2, amount3, amount4],
  userData: ethers.defaultAbiCoder.encode(
    ["uint256", "uint256[]"],
    [0, [amount1, amount2, amount3, amount4]] // JOIN_KIND_INIT = 0
  ),
  fromInternalBalance: false
};

await vault.joinPool(poolId, user, recipient, joinRequest);
```

## 🔍 Monitoring Your Pool

### **Key Metrics to Track:**
- **TVL** - Total Value Locked
- **Swap Volume** - Trading activity
- **Fee Revenue** - Pool earnings
- **Rate Provider Accuracy** - LST rate reliability

### **Pool Information:**
```typescript
// Get pool details
const poolId = await pool.getPoolId();
const tokens = await pool.getTokens();
const swapFee = await pool.getSwapFeePercentage();
const amplification = await pool.getAmplificationParameter();
```

## 🚨 Important Notes

### **Rate Providers**
- Your rate providers are already configured
- They handle rebasing for your LST tokens
- 15-minute cache reduces gas costs

### **Security**
- **Test on testnet first** if available
- **Verify contracts** after deployment
- **Monitor rate providers** for accuracy

### **Gas Optimization**
- **Rate caching** reduces gas costs
- **Batch operations** for multiple transactions
- **Optimized for Monad** chain characteristics

## 🆘 Troubleshooting

### **Common Issues:**

1. **Insufficient Balance**
   ```
   Error: Insufficient balance for deployment
   ```
   **Solution**: Add more MONAD tokens to your account

2. **Rate Provider Issues**
   ```
   Error: Rate provider not found
   ```
   **Solution**: Verify rate provider addresses are correct

3. **Pool Creation Failed**
   ```
   Error: Pool creation event not found
   ```
   **Solution**: Check factory deployment and parameters

### **Debug Commands:**
```bash
# Check deployment
npx hardhat verify --network monad <contract-address>

# Test functionality
npx hardhat run test-lst-pool.ts --network monad

# Monitor gas usage
REPORT_GAS=true npx hardhat run deploy-lst-vault-pool.ts --network monad
```

## 🎉 Success!

After deployment, you'll have:
- ✅ **V3 Vault** with advanced features
- ✅ **LST Pool** optimized for your tokens
- ✅ **Lower fees** (0.04% vs 1%)
- ✅ **Better performance** for LST trading
- ✅ **MEV protection** and hooks system

Your V3 deployment will provide significantly better performance and features compared to your V2 setup!

---

**Ready to deploy? Run: `npx hardhat run deploy-lst-vault-pool.ts --network monad`** 