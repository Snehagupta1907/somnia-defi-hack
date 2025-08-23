# Balancer V3 Deployment on Monad Chain

This repository contains a deployment script for Balancer V3 on the Monad chain, specifically designed to create a Composable Stable Pool for LST (Liquid Staking Token) tokens.

## Overview

The deployment script will:
1. Deploy the Balancer V3 Vault
2. Deploy a Stable Pool Factory
3. Create a Composable Stable Pool for LST tokens (stETH, rETH, cbETH)
4. Set up initial liquidity (if tokens are available)

## Why Composable Stable Pool for LST?

LST tokens are designed to maintain stable values relative to each other, making them perfect for stable pools rather than weighted pools. The Composable Stable Pool provides:

- **Lower slippage**: Better for tokens that trade near parity
- **Higher capital efficiency**: Allows for larger trades before significant price impact
- **Stable swap math**: Based on StableSwap (popularized by Curve)
- **Amplification parameter**: Controls the "flatness" of the price curve

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Yarn** or **npm**
3. **Hardhat**
4. **Monad RPC access**
5. **Private key** with sufficient MONAD tokens for deployment

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd balancer-monad-deployment
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
# Monad Network Configuration
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz

# Deployment Configuration
PRIVATE_KEY=your_private_key_here
MONAD_API_KEY=your_explorer_api_key_here

# Optional: Gas reporting
REPORT_GAS=true
```

## Configuration

### Update LST Token Addresses

Edit the `LST_TOKENS` object in `deploy-monad-balancer.js`:

```javascript
const LST_TOKENS = {
  stETH: "0x...", // Replace with actual stETH address on Monad
  rETH: "0x...",  // Replace with actual rETH address on Monad
  cbETH: "0x...", // Replace with actual cbETH address on Monad
};
```

### Update Monad Chain Configuration

Edit the `MONAD_CONFIG` object:

```javascript
const MONAD_CONFIG = {
  chainId: 1337, // Replace with actual Monad chain ID
  rpcUrl: "https://rpc.monad.xyz", // Replace with actual Monad RPC
  blockTime: 1, // Monad has 1-second block time
  gasPrice: ethers.parseUnits("0.000000001", "gwei"),
};
```

### Pool Configuration

The default configuration creates a stable pool with:
- **Swap fee**: 0.04% (typical for stable pools)
- **Amplification parameter**: 100 (controls curve flatness)
- **Tokens**: stETH, rETH, cbETH (40%, 30%, 30% target weights)

## Deployment

### 1. Compile Contracts

```bash
yarn compile
```

### 2. Deploy to Monad Mainnet

```bash
yarn deploy
```

### 3. Deploy to Monad Testnet (if available)

```bash
yarn deploy:testnet
```

### 4. Deploy Locally for Testing

```bash
yarn deploy:local
```

## Deployment Process

The script will deploy the following contracts in order:

1. **Authorizer** - Manages permissions for the vault
2. **ProtocolFeeController** - Handles protocol fees
3. **VaultFactory** - Factory for deploying vaults
4. **Vault** - Main Balancer V3 vault
5. **StablePoolFactory** - Factory for stable pools
6. **LST Stable Pool** - The actual LST trading pool

## Output

After successful deployment, the script will:

1. Display all deployed contract addresses
2. Save deployment information to `deployment-monad-{timestamp}.json`
3. Verify the deployment
4. Attempt to add initial liquidity (if tokens are available)

Example output:
```
🚀 Starting Balancer V3 deployment on Monad chain...
🔧 Initializing Balancer Monad Deployer...
📋 Deployer address: 0x...
💰 Deployer balance: 1.5 MONAD

🔐 Deploying Authorizer...
✅ Authorizer deployed at: 0x...

💰 Deploying ProtocolFeeController...
✅ ProtocolFeeController deployed at: 0x...

🏭 Deploying VaultFactory...
✅ VaultFactory deployed at: 0x...

🏦 Deploying Vault...
✅ Vault deployed at: 0x...

🏊 Deploying StablePoolFactory...
✅ StablePoolFactory deployed at: 0x...

🌊 Creating LST Stable Pool...
✅ LST Stable Pool created at: 0x...

💧 Setting up initial liquidity...
✅ Initial liquidity added to pool

🔍 Verifying deployment...
✅ Vault verification passed
✅ Pool verification passed
📊 Pool ID: 0x...
🎯 Pool tokens: 3

💾 Saving deployment information...
✅ Deployment info saved to: deployment-monad-1234567890.json

🎉 Deployment completed successfully!
```

## Contract Addresses

The deployment will create the following contracts:

- **Authorizer**: `0x...`
- **ProtocolFeeController**: `0x...`
- **VaultFactory**: `0x...`
- **Vault**: `0x...`
- **StablePoolFactory**: `0x...`
- **LST Stable Pool**: `0x...`

## Pool Features

The deployed LST Stable Pool includes:

- **Composable Stable Pool**: Optimized for LST tokens
- **Low swap fees**: 0.04% (typical for stable pools)
- **Amplification parameter**: 100 (configurable)
- **Donation support**: Enabled for better liquidity provision
- **Unbalanced liquidity**: Enabled for flexible liquidity management

## Verification

To verify contracts on Monad Explorer:

```bash
yarn verify
```

## Testing

Run tests to ensure everything works correctly:

```bash
yarn test
```

## Gas Optimization

The deployment is optimized for Monad's low gas costs:

- Uses minimal gas settings
- Optimized contract compilation
- Efficient deployment patterns

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure your account has enough MONAD tokens
2. **RPC Issues**: Check your Monad RPC URL
3. **Token Addresses**: Verify LST token addresses are correct
4. **Gas Issues**: Monad has very low gas costs, but ensure sufficient balance

### Error Messages

- `"Insufficient balance for deployment"`: Add more MONAD tokens to your account
- `"Pool creation event not found"`: Check if pool factory deployment was successful
- `"Vault not deployed correctly"`: Verify vault factory deployment

## Security Considerations

1. **Private Key Security**: Never commit your private key to version control
2. **Environment Variables**: Use `.env` files for sensitive data
3. **Contract Verification**: Always verify deployed contracts
4. **Testing**: Test thoroughly on testnet before mainnet deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in this repository
- Check the Balancer documentation
- Join the Monad community

## References

- [Balancer V3 Documentation](https://docs.balancer.fi/)
- [Monad Documentation](https://docs.monad.xyz/)
- [LST Token Information](https://ethereum.org/en/staking/)
