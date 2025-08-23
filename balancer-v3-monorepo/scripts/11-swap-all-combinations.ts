/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Minimal Permit2 ABI (approve only)
const PERMIT2_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

function getDeadline(secsFromNow = 1800): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + secsFromNow);
}

function pct(amount: bigint, bps: number): bigint {
  // bps = basis points of 10_000
  return (amount * BigInt(bps)) / 10000n;
}

function makeTxUrl(hash: string): string {
  return `https://testnet.monadexplorer.com/tx/${hash}`;
}

async function main() {
  console.log('🔁 Swapping all ordered pairs (exact-in and exact-out) via Router');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  const deployFile = 'deployment-08-router.json';
  if (!fs.existsSync(deployFile)) {
    throw new Error('deployment-08-router.json not found. Run 08-deploy-router.ts first.');
  }
  const info = JSON.parse(fs.readFileSync(deployFile, 'utf8'));

  const routerAddr: string = info.router;
  const vaultAddr: string = info.vault;
  const poolAddr: string = info.lstPool;
  const permit2Addr: string = info.permit2;
  const tokensMap: Record<string, string> = info.lstTokens;

  const tokenAddrs = Object.values(tokensMap);
  if (tokenAddrs.length < 2) throw new Error('Need at least 2 tokens in pool');

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Vault: ${vaultAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Permit2: ${permit2Addr}`);

  const router = await ethers.getContractAt('Router', routerAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // One-time Permit2 approvals per token (sufficient allowance for all swaps)
  const allowancePerToken = ethers.parseUnits('10', 18); // 10 tokens allowance
  const MAX_UINT48 = 281474976710655n;
  console.log('🔐 Setting up Permit2 approvals per token...');
  for (const t of tokenAddrs) {
    const erc20 = await ethers.getContractAt('IERC20', t);
    const bal = await erc20.balanceOf(sender.address);
    if (bal === 0n) {
      console.warn(`⚠️ Skipping allowance for ${t}: balance is 0`);
      continue;
    }

    const approvePermit2 = await erc20.approve(permit2Addr, allowancePerToken);
    await approvePermit2.wait();
    await (await permit2.approve(t, routerAddr, allowancePerToken, MAX_UINT48)).wait();
    console.log(`✅ Permit2 allowance set for ${t}`);
  }

  const results: any[] = [];

  // Iterate ordered pairs (tokenIn != tokenOut)
  for (let i = 0; i < tokenAddrs.length; i++) {
    for (let j = 0; j < tokenAddrs.length; j++) {
      if (i === j) continue;
      const tokenIn = tokenAddrs[i];
      const tokenOut = tokenAddrs[j];

      const ercIn = await ethers.getContractAt('IERC20', tokenIn);
      const ercOut = await ethers.getContractAt('IERC20', tokenOut);

      console.log(`\n➡️ Pair: ${tokenIn} -> ${tokenOut}`);

      // Exact In
      try {
        const exactIn = ethers.parseUnits('0.5', 18); // 0.5 tokenIn
        const balIn = await ercIn.balanceOf(sender.address);
        if (balIn < exactIn) {
          console.warn(`⚠️ Skipping exact-in: insufficient balance ${ethers.formatUnits(balIn, 18)} < 0.5`);
        } else {
          // Preview
          let quotedOut = 0n;
          try {
            quotedOut = await router.swapSingleTokenExactIn.staticCall(
              poolAddr,
              tokenIn,
              tokenOut,
              exactIn,
              0n,
              getDeadline(),
              false,
              '0x'
            );
          } catch (e) {
            console.warn('⚠️ Preview exact-in failed, attempting tx anyway with minAmountOut = 0');
          }

          const minOut = quotedOut > 0n ? quotedOut - pct(quotedOut, 100) : 0n; // 1% slippage
          const tx = await router.swapSingleTokenExactIn(
            poolAddr,
            tokenIn,
            tokenOut,
            exactIn,
            minOut,
            getDeadline(),
            false,
            '0x'
          );
          const rcpt = await tx.wait();
          const outBal = await ercOut.balanceOf(sender.address);
          console.log(`✅ Exact-in ok. New ${tokenOut} balance: ${ethers.formatUnits(outBal, 18)}`);
          console.log(`🔗 Tx: ${makeTxUrl(tx.hash)}`);
          results.push({ kind: 'exactIn', tokenIn, tokenOut, exactIn: exactIn.toString(), minOut: minOut.toString(), tx: tx.hash, txUrl: makeTxUrl(tx.hash), block: rcpt?.blockNumber });
        }
      } catch (e) {
        console.warn('❌ Exact-in failed:', e);
      }

      // Exact Out
      try {
        const exactOut = ethers.parseUnits('0.5', 18);
        // Safer: use query function for preview
        let quotedIn = 0n;
        try {
          quotedIn = await router.querySwapSingleTokenExactOut.staticCall(
            poolAddr,
            tokenIn,
            tokenOut,
            exactOut,
            sender.address,
            '0x'
          );
        } catch (e) {
          console.warn('⚠️ Preview exact-out failed, skipping');
          continue;
        }

        const balIn2 = await ercIn.balanceOf(sender.address);
        const maxIn = quotedIn + pct(quotedIn, 100); // +1%
        if (balIn2 < maxIn) {
          console.warn(`⚠️ Skipping exact-out: insufficient balance for maxIn ${ethers.formatUnits(balIn2, 18)} < ${ethers.formatUnits(maxIn, 18)}`);
          continue;
        }

        const tx2 = await router.swapSingleTokenExactOut(
          poolAddr,
          tokenIn,
          tokenOut,
          exactOut,
          maxIn,
          getDeadline(),
          false,
          '0x'
        );
        const rcpt2 = await tx2.wait();
        const outBal2 = await ercOut.balanceOf(sender.address);
        console.log(`✅ Exact-out ok. New ${tokenOut} balance: ${ethers.formatUnits(outBal2, 18)}`);
        console.log(`🔗 Tx: ${makeTxUrl(tx2.hash)}`);
        results.push({ kind: 'exactOut', tokenIn, tokenOut, exactOut: exactOut.toString(), maxIn: maxIn.toString(), tx: tx2.hash, txUrl: makeTxUrl(tx2.hash), block: rcpt2?.blockNumber });
      } catch (e) {
        console.warn('❌ Exact-out failed:', e);
      }
    }
  }

  const outFile = 'swap-all-combinations-results.json';
  fs.writeFileSync(outFile, JSON.stringify({ timestamp: Date.now(), results }, null, 2));
  console.log(`\n💾 Results saved to ${outFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

