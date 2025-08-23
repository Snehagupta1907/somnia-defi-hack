/* eslint-disable prettier/prettier */
import { ethers, network } from 'hardhat';
import * as fs from 'fs';

async function main() {
  console.log('🛣️ Step 8: Deploying Router...');

  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  // Load previous deployment info
  if (!fs.existsSync('deployment-07-lst-pool.json')) {
    throw new Error('Please run 07-deploy-lst-pool.ts first');
  }
  
  const previousInfo = JSON.parse(fs.readFileSync('deployment-07-lst-pool.json', 'utf8'));
  console.log(`📋 Using Vault: ${previousInfo.vault}`);
  

  
  const wethAddress ="0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  console.log(`✅ WETH deployed to: ${wethAddress}`);
  

  
  const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
  console.log(`✅ Permit2 deployed to: ${permit2Address}`);

  // Deploy Router
  console.log('🛣️ Deploying Router...');
  const Router = await ethers.getContractFactory('Router');
  const router = await Router.deploy(
    previousInfo.vault,
    wethAddress,
    permit2Address,
    'Router v9' // routerVersion
  );
  await router.waitForDeployment();
  
  const routerAddress = await router.getAddress();
  console.log(`✅ Router deployed to: ${routerAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    ...previousInfo,
    weth: wethAddress,
    permit2: permit2Address,
    router: routerAddress,
    timestamp: Date.now()
  };
  
  fs.writeFileSync('deployment-08-router.json', JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to deployment-08-router.json`);
  
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