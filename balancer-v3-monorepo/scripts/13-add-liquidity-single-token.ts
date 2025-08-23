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

const MAX_UINT48 = 281474976710655n; // 2^48 - 1

function makeTxUrl(hash: string): string {
  return `https://testnet.monadexplorer.com/tx/${hash}`;
}

async function main() {
  console.log('💧 Add liquidity for a single token via Router (unbalanced)');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  // Load previous Router deployment info
  const file = 'deployment-08-router.json';
  if (!fs.existsSync(file)) throw new Error('deployment-08-router.json not found. Run 08-deploy-router.ts first.');
  const info = JSON.parse(fs.readFileSync(file, 'utf8'));

  const routerAddr: string = info.router;
  const poolAddr: string = info.lstPool;
  const permit2Addr: string = info.permit2;
  const lstTokens: Record<string, string> = info.lstTokens || {};

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Permit2: ${permit2Addr}`);

  // Contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('StablePool', poolAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // Pool token order
  const poolTokens: string[] = await pool.getTokens();
  console.log('📋 Pool token order:', poolTokens);

  // Choose which single token to add
  // Priority: TOKEN_ADDR env -> TOKEN_KEY env (shMON/sMON/gMON/aprMON) -> first pool token
  const envTokenAddr = process.env.TOKEN_ADDR?.toLowerCase();
  const envTokenKey = process.env.TOKEN_KEY as keyof typeof lstTokens | undefined;
  const chosenAddr = envTokenAddr
    || (envTokenKey && lstTokens[envTokenKey] ? lstTokens[envTokenKey] : undefined)
    || poolTokens[0];

  if (!poolTokens.map(t => t.toLowerCase()).includes(chosenAddr.toLowerCase())) {
    throw new Error(`Chosen token ${chosenAddr} is not part of the pool token list`);
  }

  const amountStr = process.env.AMOUNT || '1.0';
  const desiredAmount = ethers.parseUnits(amountStr, 18);

  console.log(`🔎 Adding only this token: ${chosenAddr}`);
  console.log(`🔎 Amount: ${amountStr}`);

  // Build exactAmountsIn array: zero for others, desiredAmount for chosen token
  const exactAmountsIn: bigint[] = poolTokens.map(addr => addr.toLowerCase() === chosenAddr.toLowerCase() ? desiredAmount : 0n);

  // Ensure approvals for chosen token
  const token = await ethers.getContractAt('IERC20', chosenAddr);
  const bal = await token.balanceOf(sender.address);
  if (bal < desiredAmount) {
    throw new Error(`Insufficient balance for ${chosenAddr}: have ${ethers.formatUnits(bal, 18)}, need ${amountStr}`);
  }

  console.log('🔐 Approving Permit2 for chosen token...');
  const approvePermit2 = await token.approve(permit2Addr, desiredAmount);
  await approvePermit2.wait();

  const approveRouter = await permit2.approve(chosenAddr, routerAddr, desiredAmount, MAX_UINT48);
  await approveRouter.wait();
  console.log('✅ Permit2 approved for Router');

  // Add liquidity unbalanced with minBptOut = 0
  console.log('🚀 Adding single-token liquidity (unbalanced)...');
  const tx = await router.addLiquidityUnbalanced(
    poolAddr,
    exactAmountsIn,
    0n,
    false,
    '0x'
  );
  console.log(`📋 Tx: ${tx.hash}`);
  console.log(`🔗 ${makeTxUrl(tx.hash)}`);
  const rcpt = await tx.wait();
  console.log(`✅ Mined in block ${rcpt?.blockNumber}`);

  const bpt = await pool.balanceOf(sender.address);
  console.log(`🏊 BPT balance now: ${ethers.formatUnits(bpt, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

