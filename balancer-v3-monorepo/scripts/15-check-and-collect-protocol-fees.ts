/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🔎 Check protocol fee settings and collect accrued fees');

  const [sender] = await ethers.getSigners();
  console.log(`📋 Sender: ${sender.address}`);

  if (!fs.existsSync('deployment-02-protocol-fee-controller.json')) {
    throw new Error('deployment-02-protocol-fee-controller.json not found. Run 02-deploy-protocol-fee-controller.ts first.');
  }
  if (!fs.existsSync('deployment-07-lst-pool.json')) {
    throw new Error('deployment-07-lst-pool.json not found. Run 07-deploy-lst-pool.ts first.');
  }

  const d2 = JSON.parse(fs.readFileSync('deployment-02-protocol-fee-controller.json', 'utf8'));
  const d7 = JSON.parse(fs.readFileSync('deployment-07-lst-pool.json', 'utf8'));

  const feeAddr: string = d2.protocolFeeController;
  const vaultAddr: string = d2.predictedVaultAddress;
  const poolAddr: string = d7.lstPool;
  const tokens: string[] = Object.values<string>(d7.lstTokens || {});

  const fee = await ethers.getContractAt('ProtocolFeeController', feeAddr);
  const vault = await ethers.getContractAt('Vault', vaultAddr);

  const globalSwap = await fee.getGlobalProtocolSwapFeePercentage();
  const globalYield = await fee.getGlobalProtocolYieldFeePercentage();
  console.log(`🌐 Global protocol swap fee: ${globalSwap.toString()}`);
  console.log(`🌐 Global protocol yield fee: ${globalYield.toString()}`);

  // Aggregate fees currently set on the pool
  // Read PoolConfig via VaultExtension.getPoolConfig
  const vaultExt = await ethers.getContractAt('VaultExtension', vaultAddr);
  const poolConfig = await vaultExt.getPoolConfig(poolAddr);
  console.log(`📊 Pool aggregate swap fee: ${poolConfig.aggregateSwapFeePercentage.toString()}`);
  console.log(`📊 Pool aggregate yield fee: ${poolConfig.aggregateYieldFeePercentage.toString()}`);

  // Collect accrued aggregate fees to the controller (permissionless)
  console.log('🧹 Collecting accrued aggregate fees to ProtocolFeeController...');
  const tx = await fee.collectAggregateFees(poolAddr);
  const rcpt = await tx.wait();
  console.log(`✅ Fees collected in block ${rcpt?.blockNumber}`);

  // Show balances of each pool token held by the controller
  console.log('💰 ProtocolFeeController balances per token:');
  for (const t of tokens) {
    const erc = await ethers.getContractAt('IERC20', t);
    const bal = await erc.balanceOf(feeAddr);
    console.log(`  - ${t}: ${bal.toString()}`);
  }
}


main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

