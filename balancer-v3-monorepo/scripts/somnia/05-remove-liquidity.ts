/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

type Mode = 'proportional' | 'singleExactIn' | 'singleExactOut';

function pct(amount: bigint, bps: number): bigint {
  return (amount * BigInt(bps)) / 10000n;
}

function makeTxUrl(hash: string): string {
  return `https://shannon-explorer.somnia.network/tx/${hash}`;
}

async function main() {
  console.log('🧺 Remove liquidity from Somnia Pool via Router');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  // Load Somnia deployment info
  const deploymentFile = 'scripts/somnia/deployment-weighted-pool-2t.json';
  if (!fs.existsSync(deploymentFile)) {
    throw new Error('deployment-weighted-pool-2t.json not found. Please run the deployment scripts first.');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const routerAddr: string = poolInfo.router;
  const poolAddr: string = poolInfo.somniaWeightedPool;
  const vaultAddr: string = poolInfo.vault;
  const somniaTokens: Record<string, string> = poolInfo.somniaTokens || {};

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Vault: ${vaultAddr}`);
  console.log(`📋 Somnia Tokens:`, somniaTokens);

  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('WeightedPool', poolAddr);

  const mode = (process.env.MODE as Mode) || 'proportional';
  console.log(`📋 Mode: ${mode}`);

  // BPT balance and allowance
  const bptBal: bigint = await pool.balanceOf(sender.address);
  console.log(`📋 BPT balance: ${ethers.formatUnits(bptBal, 18)}`);

  if (bptBal === 0n) throw new Error('No BPT to remove');

  if (mode === 'proportional') {
    const amountStr = process.env.AMOUNT_BPT || '0.5';
    let exactBptIn = ethers.parseUnits(amountStr, 18);
    if (exactBptIn > bptBal) exactBptIn = bptBal;

    // Ensure allowance to Router for BPT (Router spends BPT via Vault)
    const currentAllowance: bigint = await pool.allowance(sender.address, routerAddr);
    if (currentAllowance < exactBptIn) {
      console.log('🔐 Approving BPT to Router...');
      const txA = await pool.approve(routerAddr, exactBptIn);
      await txA.wait();
    }

    // minAmountsOut = zeros (accept any)
    const poolTokens: string[] = await pool.getTokens();
    const minAmountsOut = poolTokens.map(() => 0n);

    // Preview
    try {
      const preview = await router.removeLiquidityProportional.staticCall(
        poolAddr,
        exactBptIn,
        minAmountsOut,
        false,
        '0x'
      );
      console.log('🔍 Preview amountsOut:', preview.map((v: bigint) => ethers.formatUnits(v, 18)));
    } catch (e) {
      console.warn('⚠️ Preview proportional remove failed (continuing).');
    }

    console.log('🚀 Removing liquidity (proportional)...');
    const tx = await router.removeLiquidityProportional(
      poolAddr,
      exactBptIn,
      minAmountsOut,
      false,
      '0x'
    );
    console.log(`📋 Tx: ${tx.hash}`);
    console.log(`🔗 ${makeTxUrl(tx.hash)}`);
    const rcpt = await tx.wait();
    console.log(`✅ Mined in block ${rcpt?.blockNumber}`);
  } else if (mode === 'singleExactIn') {
    const tokenKey = process.env.TOKEN_KEY as keyof typeof somniaTokens | undefined;
    const tokenAddrEnv = process.env.TOKEN_ADDR;
    const tokenOutAddr = tokenAddrEnv || (tokenKey && somniaTokens[tokenKey]);
    if (!tokenOutAddr) throw new Error('Provide TOKEN_ADDR or TOKEN_KEY for tokenOut');

    const amountStr = process.env.AMOUNT_BPT || '0.5';
    let exactBptIn = ethers.parseUnits(amountStr, 18);
    if (exactBptIn > bptBal) exactBptIn = bptBal;

    // Ensure allowance for BPT to Router
    const currentAllowance: bigint = await pool.allowance(sender.address, routerAddr);
    if (currentAllowance < exactBptIn) {
      console.log('🔐 Approving BPT to Router...');
      const txA = await pool.approve(routerAddr, exactBptIn);
      await txA.wait();
    }

    // Preview to get token out and set min with 1% slippage
    let quotedOut = 0n;
    try {
      // Use the sender's address for the query (like the working tests do)
      quotedOut = await router.queryRemoveLiquiditySingleTokenExactIn.staticCall(
        poolAddr,
        exactBptIn,
        tokenOutAddr,
        sender.address,
        '0x'
      );
      console.log(`🔍 Preview amountOut: ${ethers.formatUnits(quotedOut, 18)}`);
    } catch (e) {
      console.warn('⚠️ Preview single exact-in failed (using minAmountOut=1 wei fallback).');
      console.log('💡 Error details:', e);
    }
    const minAmountOut = quotedOut > 0n ? quotedOut - pct(quotedOut, 100) : 1n; // 1% slippage or 1 wei fallback

    console.log('🚀 Removing liquidity (single token exact-in)...');
    const tx = await router.removeLiquiditySingleTokenExactIn(
      poolAddr,
      exactBptIn,
      tokenOutAddr,
      minAmountOut,
      false,
      '0x'
    );
    console.log(`📋 Tx: ${tx.hash}`);
    console.log(`🔗 ${makeTxUrl(tx.hash)}`);
    const rcpt = await tx.wait();
    console.log(`✅ Mined in block ${rcpt?.blockNumber}`);
  } else if (mode === 'singleExactOut') {
    const tokenKey = process.env.TOKEN_KEY as keyof typeof somniaTokens | undefined;
    const tokenAddrEnv = process.env.TOKEN_ADDR;
    const tokenOutAddr = tokenAddrEnv || (tokenKey && somniaTokens[tokenKey]);
    if (!tokenOutAddr) throw new Error('Provide TOKEN_ADDR or TOKEN_KEY for tokenOut');

    const amountStr = process.env.AMOUNT_TOKEN || '0.25';
    const exactAmountOut = ethers.parseUnits(amountStr, 18);

    // Preview to estimate required BPT in using the query function
    let quotedBptIn = 0n;
    try {
      quotedBptIn = await router.queryRemoveLiquiditySingleTokenExactOut.staticCall(
        poolAddr,
        tokenOutAddr,
        exactAmountOut,
        ethers.ZeroAddress,
        '0x'
      );
      console.log(`🔍 Preview bptAmountIn: ${ethers.formatUnits(quotedBptIn, 18)}`);
    } catch (e) {
      console.warn('⚠️ Exact-out quote failed. Lower AMOUNT_TOKEN or use MODE=singleExactIn.');
      throw e;
    }

    let maxBptIn = quotedBptIn + pct(quotedBptIn, 100); // +1%
    if (maxBptIn > bptBal) maxBptIn = bptBal; // cap to balance

    // Ensure allowance to Router for BPT
    const currentAllowance: bigint = await pool.allowance(sender.address, routerAddr);
    if (currentAllowance < maxBptIn) {
      console.log('🔐 Approving BPT to Router...');
      const txA = await pool.approve(routerAddr, maxBptIn);
      await txA.wait();
    }

    console.log('🚀 Removing liquidity (single token exact-out)...');
    const tx = await router.removeLiquiditySingleTokenExactOut(
      poolAddr,
      maxBptIn,
      tokenOutAddr,
      exactAmountOut,
      false,
      '0x'
    );
    console.log(`📋 Tx: ${tx.hash}`);
    console.log(`🔗 ${makeTxUrl(tx.hash)}`);
    const rcpt = await tx.wait();
    console.log(`✅ Mined in block ${rcpt?.blockNumber}`);
  } else {
    throw new Error(`Unsupported MODE: ${mode}`);
  }

  const newBpt = await pool.balanceOf(sender.address);
  console.log(`🏊 BPT balance now: ${ethers.formatUnits(newBpt, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 