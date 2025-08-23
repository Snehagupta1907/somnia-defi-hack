/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

// Minimal Permit2 ABI (only approve used)
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

function getDeadline(secondsFromNow = 1800): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + secondsFromNow);
}

async function main() {
  console.log('🔁 Router swap (single token, exact in)');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  // Load previous Router deployment info (matches your initialized pool)
  const file = 'deployment-08-router.json';
  if (!fs.existsSync(file)) throw new Error('deployment-08-router.json not found. Run 08-deploy-router.ts first.');
  const info = JSON.parse(fs.readFileSync(file, 'utf8'));

  const routerAddr: string = info.router;
  const vaultAddr: string = info.vault;
  const poolAddr: string = info.lstPool;
  const permit2Addr: string = info.permit2;
  const lstTokens: Record<string, string> = info.lstTokens;

  if (!permit2Addr) throw new Error('Permit2 address missing in deployment info');

  console.log(`📋 Router: ${routerAddr}`);
  console.log(`📋 Vault: ${vaultAddr}`);
  console.log(`📋 Pool: ${poolAddr}`);
  console.log(`📋 Permit2: ${permit2Addr}`);

  // Configure swap: shMON -> sMON
  const tokenInAddr = lstTokens.shMON;
  const tokenOutAddr = lstTokens.sMON;
  const exactAmountIn = ethers.parseUnits('1.0', 18);
  const minAmountOut = 0n; // adjust if you want slippage protection
  const deadline = getDeadline(1800);

  console.log(`📋 tokenIn: ${tokenInAddr}`);
  console.log(`📋 tokenOut: ${tokenOutAddr}`);
  console.log(`📋 exactAmountIn: ${ethers.formatUnits(exactAmountIn, 18)}`);

  // Contracts
  const router = await ethers.getContractAt('Router', routerAddr);
  const tokenIn = await ethers.getContractAt('IERC20', tokenInAddr);
  const tokenOut = await ethers.getContractAt('IERC20', tokenOutAddr);
  const permit2 = await ethers.getContractAt(PERMIT2_ABI, permit2Addr);

  // Ensure balance
  const balIn = await tokenIn.balanceOf(sender.address);
  if (balIn < exactAmountIn) {
    throw new Error(`Insufficient tokenIn balance: have ${ethers.formatUnits(balIn, 18)}, need ${ethers.formatUnits(exactAmountIn, 18)}`);
  }

  // Approvals via Permit2 (same pattern as initialization)
  console.log('🔐 Approving tokenIn for Permit2...');
  const approvePermit2Tx = await tokenIn.approve(permit2Addr, exactAmountIn);
  await approvePermit2Tx.wait();
  console.log('✅ tokenIn approved to Permit2');

  console.log('🔐 Approving Permit2 to spend tokenIn for Router...');
  const MAX_UINT48 = 281474976710655n; // 2^48 - 1
  const permit2ApproveRouterTx = await permit2.approve(tokenInAddr, routerAddr, exactAmountIn, MAX_UINT48);
  await permit2ApproveRouterTx.wait();
  console.log('✅ Permit2 approved for Router');

  // Optional: preview via static call
  try {
    const preview = await router.swapSingleTokenExactIn.staticCall(
      poolAddr,
      tokenInAddr,
      tokenOutAddr,
      exactAmountIn,
      minAmountOut,
      deadline,
      false, // wethIsEth
      '0x'
    );
    console.log(`🔍 Preview amountOut: ${preview.toString()}`);
  } catch (e) {
    console.warn('⚠️ Preview failed (continuing):', e);
  }

  console.log('🚀 Executing swap via Router.swapSingleTokenExactIn...');
  const tx = await router.swapSingleTokenExactIn(
    poolAddr,
    tokenInAddr,
    tokenOutAddr,
    exactAmountIn,
    minAmountOut,
    deadline,
    false, // wethIsEth
    '0x'
  );
  console.log(`📋 Swap tx: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ Mined in block ${receipt?.blockNumber}`);

  const outBal = await tokenOut.balanceOf(sender.address);
  console.log(`💰 tokenOut balance now: ${ethers.formatUnits(outBal, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

