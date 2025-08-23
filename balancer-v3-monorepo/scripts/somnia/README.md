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

7. **`05-remove-liquidity.ts`** - Removes liquidity from the pool
   - Requires liquidity to be present in the pool

8. **`06-add-more-liquidity.ts`** - Adds balanced liquidity to the pool
   - Adds equal amounts of all tokens in the pool

9. **`07-add-liquidity-single-token.ts`** - Adds liquidity for a single token
   - Adds liquidity for only one specific token

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

### Step 7: Remove Liquidity

```bash
# Remove liquidity proportionally (default)
npx hardhat run scripts/somnia/05-remove-liquidity.ts --network somnia

# Remove liquidity for a specific token (exact amount out)
MODE=singleExactOut TOKEN_KEY=USDTG AMOUNT_TOKEN=0.25 npx hardhat run scripts/somnia/05-remove-liquidity.ts --network somnia

# Remove liquidity with specific BPT amount (exact amount in)
MODE=singleExactIn TOKEN_KEY=WSTT AMOUNT_BPT=0.3 npx hardhat run scripts/somnia/05-remove-liquidity.ts --network somnia

### Step 8: Add More Liquidity

```bash
# Add balanced liquidity (equal amounts of all tokens)
npx hardhat run scripts/somnia/06-add-more-liquidity.ts --network somnia

# Add balanced liquidity with custom amount per token
AMOUNT_PER_TOKEN=2.0 npx hardhat run scripts/somnia/06-add-more-liquidity.ts --network somnia

### Step 9: Add Single Token Liquidity

```bash
# Add liquidity for USDTG only (default amount 1.0)
TOKEN_KEY=USDTG npx hardhat run scripts/somnia/07-add-liquidity-single-token.ts --network somnia

# Add liquidity for WSTT only with custom amount
TOKEN_KEY=WSTT AMOUNT=1.5 npx hardhat run scripts/somnia/07-add-liquidity-single-token.ts --network somnia

# Add liquidity for specific token address
TOKEN_ADDR=0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76 AMOUNT=0.5 npx hardhat run scripts/somnia/07-add-liquidity-single-token.ts --network somnia
```

## Liquidity Management Modes

### Liquidity Removal Modes

The `05-remove-liquidity.ts` script supports three modes:

1. **`proportional`** (default): Removes liquidity proportionally from all tokens in the pool
   - Use `AMOUNT_BPT` to specify how much BPT to burn
   - All tokens are withdrawn in proportion to their pool weights

2. **`singleExactIn`**: Removes liquidity for a specific token by burning a specific amount of BPT
   - Use `AMOUNT_BPT` to specify BPT amount to burn
   - Use `TOKEN_KEY` (USDTG/WSTT) or `TOKEN_ADDR` to specify which token to receive
   - Calculates slippage tolerance automatically

3. **`singleExactOut`**: Removes liquidity to receive a specific amount of a token
   - Use `AMOUNT_TOKEN` to specify exact token amount to receive
   - Use `TOKEN_KEY` (USDTG/WSTT) or `TOKEN_ADDR` to specify which token to receive
   - Automatically calculates required BPT amount with slippage tolerance

### Liquidity Addition Modes

The liquidity addition scripts support two modes:

1. **`06-add-more-liquidity.ts`**: Adds balanced liquidity to the pool
   - Adds equal amounts of all tokens in the pool
   - Use `AMOUNT_PER_TOKEN` environment variable to specify amount per token
   - Automatically handles Permit2 approvals for all tokens
   - Uses `addLiquidityProportional` for weighted pools

2. **`07-add-liquidity-single-token.ts`**: Adds liquidity for a single token
   - Calculates proportional amounts for all tokens to maintain pool weights
   - Use `TOKEN_KEY` (USDTG/WSTT) or `TOKEN_ADDR` to specify which token
   - Use `AMOUNT` environment variable to specify token amount
   - Automatically calculates required amounts for other tokens
   - Uses `addLiquidityProportional` for weighted pools

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