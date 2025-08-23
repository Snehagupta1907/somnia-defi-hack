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
  return `https://shannon-explorer.somnia.network/tx/${hash}`;
}

async function main() {
  console.log('💧 Add more liquidity (unbalanced) via Router');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  // Load previous Router deployment info
  const file = 'deployment-08-router.json';
  if (!fs.existsSync(file)) throw new Error('deployment-08-router.json not found. Run 08-deploy-router.ts first.');
  const info = JSON.parse(fs.readFileSync(file, 'utf8'));

  const routerAddr: string = info.router;
  const poolAddr: string = info.lstPool;
  const permit2Addr: string = info.permit2;

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Permit2: ${permit2Addr}`);

  // Contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const pool = await ethers.getContractAt('StablePool', poolAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // 1) Get pool token order
  const poolTokens: string[] = await pool.getTokens();
  console.log('📋 Pool token order:', poolTokens);

  // 2) Decide amounts per token (edit here)
  const desiredPerToken = ethers.parseUnits('1.0', 18); // add 1.0 per token

  // 3) Ensure approvals via Permit2 and build amounts array
  const exactAmountsIn: bigint[] = [];
  for (const tokenAddr of poolTokens) {
    const token = await ethers.getContractAt('IERC20', tokenAddr);
    const bal = await token.balanceOf(sender.address);

    if (bal < desiredPerToken) {
      throw new Error(`Insufficient balance for ${tokenAddr}: have ${ethers.formatUnits(bal, 18)}, need ${ethers.formatUnits(desiredPerToken, 18)}`);
    }

    // Approve token -> Permit2
    console.log(`🔐 Approving Permit2 for token ${tokenAddr}...`);
    const approvePermit2 = await token.approve(permit2Addr, desiredPerToken);
    await approvePermit2.wait();

    // Approve Permit2 -> Router
    const approveRouter = await permit2.approve(tokenAddr, routerAddr, desiredPerToken, MAX_UINT48);
    await approveRouter.wait();
    console.log(`✅ Permit2 approved for Router on ${tokenAddr}`);

    exactAmountsIn.push(desiredPerToken);
  }

  // 4) Add liquidity (unbalanced): exact amounts in, minBptOut = 0
  console.log('🚀 Adding liquidity via router.addLiquidityUnbalanced...');
  const tx = await router.addLiquidityUnbalanced(
    poolAddr,
    exactAmountsIn,
    0n,       // minBptAmountOut
    false,    // wethIsEth
    '0x'      // userData
  );
  console.log(`📋 Tx: ${tx.hash}`);
  console.log(`🔗 ${makeTxUrl(tx.hash)}`);
  const rcpt = await tx.wait();
  console.log(`✅ Mined in block ${rcpt?.blockNumber}`);

  // 5) Show BPT received
  const bpt = await pool.balanceOf(sender.address);
  console.log(`🏊 BPT balance now: ${ethers.formatUnits(bpt, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

