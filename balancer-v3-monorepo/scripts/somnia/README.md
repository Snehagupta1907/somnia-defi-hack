# Somnia Chain Deployment Scripts

This folder contains deployment scripts for deploying Balancer V3 components on the Somnia chain.

## Deployment Order

The scripts must be run in the following order:

1. **`00-deploy-vault-from-scratch.ts`** - Deploys the complete vault infrastructure
   - BasicAuthorizerMock
   - ProtocolFeeController  
   - VaultAdmin
   - VaultExtension
   - Vault

2. **`00-deploy-weighted-pool-factory.ts`** - Deploys the WeightedPoolFactory
   - Requires vault deployment from step 1

3. **`01-deploy-weighted-pool-wstt-only.ts`** - Creates the weighted pool (USDTG + WSTT)
   - Requires factory deployment from step 2

4. **`02-deploy-router.ts`** - Deploys the Router for pool operations
   - Requires pool deployment from step 3

5. **`03-add-initial-liquidity.ts`** - Adds initial liquidity (0.5 USDTG + 0.5 WSTT)
   - Requires router deployment from step 4

6. **`04-swap-tokens.ts`** - Performs a test swap (0.1 USDTG → WSTT)
   - Requires liquidity from step 5

## Token Configuration

The weighted pool will be created with these tokens:

- **USDTG**: `0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76`
- **WSTT**: `0xF22eF0085f6511f70b01a68F360dCc56261F768a`  
- **STT**: Native token (0x0000000000000000000000000000000000000000)

## Pool Configuration

- **Pool Type**: Weighted Pool
- **Weights**: USDTG(40%) WSTT(30%) STT(30%)
- **Swap Fee**: 0.3%
- **Pool Name**: Somnia USDTG-WSTT-STT Weighted Pool
- **Pool Symbol**: SOMNIA-WP

## Running the Deployment

### Prerequisites

1. Ensure you have a Hardhat environment configured for Somnia chain
2. Have sufficient balance in your deployer account
3. Install dependencies: `npm install`

### Step 1: Deploy Vault Infrastructure

```bash
npx hardhat run scripts/somnia/00-deploy-vault-from-scratch.ts --network somnia
```

This will create `scripts/somnia/deployment-vault.json` with all vault addresses.

### Step 2: Deploy Weighted Pool Factory

```bash
npx hardhat run scripts/somnia/00-deploy-weighted-pool-factory.ts --network somnia
```

This will create `scripts/somnia/deployment-weighted-pool-factory.json`.

### Step 3: Create the Weighted Pool

```bash
npx hardhat run scripts/somnia/01-deploy-weighted-pool-wstt-only.ts --network somnia
```

This will create `scripts/somnia/deployment-weighted-pool-2t.json` with the pool address.

### Step 4: Deploy Router

```bash
npx hardhat run scripts/somnia/02-deploy-router.ts --network somnia
```

This will deploy the Router contract for pool operations.

### Step 5: Add Initial Liquidity

```bash
npx hardhat run scripts/somnia/03-add-initial-liquidity.ts --network somnia
```

This will add 0.5 USDTG and 0.5 WSTT as initial liquidity.

### Step 6: Test Swap

```bash
npx hardhat run scripts/somnia/04-swap-tokens.ts --network somnia
```

This will perform a test swap of 0.1 USDTG for WSTT.

## Important Notes

- **Native Token Handling**: The STT native token is handled specially by the vault system
- **Address Prediction**: The vault deployment uses address prediction to handle circular dependencies
- **No Existing Vault**: Unlike other deployments, this creates the vault from scratch for Somnia
- **Pause Windows**: Set to 0 for Somnia (no pause windows)

## Verification

After deployment, you can verify the contracts on Somnia's block explorer using the addresses saved in the deployment JSON files.

## Troubleshooting

- **Insufficient Balance**: Ensure your deployer account has enough STT for gas fees
- **Network Issues**: Verify your Hardhat configuration is correct for Somnia
- **Contract Errors**: Check that all previous deployment steps completed successfully 