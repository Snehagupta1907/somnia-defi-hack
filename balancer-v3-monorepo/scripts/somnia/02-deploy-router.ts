/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🛣️ Step 2: Deploying Router for Somnia...');

  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('scripts/somnia/deployment-weighted-pool-2t.json')) {
    throw new Error('Please run 01-deploy-weighted-pool-wstt-only.ts first');
  }
  
  const poolInfo = JSON.parse(fs.readFileSync('scripts/somnia/deployment-weighted-pool-2t.json', 'utf8'));
  console.log(`📋 Using Vault: ${poolInfo.vault}`);
  
  // For Somnia, we'll use a placeholder WETH address since it's not deployed yet
  // In production, you'd deploy WETH or use an existing one'
  //wstt address
  const wethAddress = "0xF22eF0085f6511f70b01a68F360dCc56261F768a"; // PLACEHOLDER - UPDATE THIS
  console.log(`⚠️  WETH Address (placeholder): ${wethAddress}`);
  console.log(`💡 Please update this script with the correct WETH address for Somnia`);
  
  // For Somnia, we'll use a placeholder Permit2 address
  // In production, you'd deploy Permit2 or use an existing one
  const permit2Address = "0xb012c6B0f0Ce47eB7Da3B542A18aBBa355458826"; // PLACEHOLDER - UPDATE THIS
  console.log(`⚠️  Permit2 Address (placeholder): ${permit2Address}`);
  console.log(`💡 Please update this script with the correct Permit2 address for Somnia`);

  // Deploy Router
  console.log('🛣️ Deploying Router...');
  const Router = await ethers.getContractFactory('Router');
  const router = await Router.deploy(
    poolInfo.vault,
    wethAddress,
    permit2Address,
    'Router v9' // routerVersion
  );
  await router.waitForDeployment();
  
  const routerAddress = await router.getAddress();
  console.log(`✅ Router deployed to: ${routerAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...poolInfo,
    weth: wethAddress,
    permit2: permit2Address,
    router: routerAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('scripts/somnia/deployment-weighted-pool-2t.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Updated deployment info saved`);
  
  console.log('\n🎉 Router deployment completed successfully!');
  console.log(`🛣️ Router Address: ${routerAddress}`);
  console.log(`🌊 WETH Address: ${wethAddress}`);
  console.log(`🔐 Permit2 Address: ${permit2Address}`);
  
  return router;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 