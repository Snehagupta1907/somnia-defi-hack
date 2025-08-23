/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function authorizeFactory() {
  console.log("🔐 Authorizing Factory...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  
  try {
    // Use hardcoded addresses from deployment
    const authorizerAddress = "0xEa76c80bCF049Dff1aCB72B99590e081f8Bcc93f";
    const vaultAddress = "0x4c19304A0fd8D77aADa27e2dB1B2Eb97C0a870C6";
    const vaultExtensionAddress = "0xC008313B0D387CF4C03565CC2c99d8a4216E3027";
    
    console.log(`📋 Authorizer: ${authorizerAddress}`);
    console.log(`📋 Vault: ${vaultAddress}`);
    
    // Connect to authorizer
    const authorizer = await ethers.getContractAt("BasicAuthorizerMock", authorizerAddress);
    
    // Get the factory address (use the latest one from the deployment)
    const factoryAddress = "0xDC19F3F5ee8D470Bd530BCfD38Aa9febD79c6f88"; // Latest factory
    
    console.log(`📋 Factory to authorize: ${factoryAddress}`);
    
    // Get the action ID for registerPool function
    const vaultExtension = await ethers.getContractAt("VaultExtension", vaultExtensionAddress);
    
    // The action ID is the function selector for registerPool
    const registerPoolSelector = vaultExtension.interface.getFunction("registerPool").selector;
    console.log(`📋 RegisterPool selector: ${registerPoolSelector}`);
    
    // Create action ID with the factory as the disambiguator
    const actionId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes4", "bytes32"],
        [registerPoolSelector, ethers.zeroPadValue(factoryAddress, 32)]
      )
    );
    
    console.log(`📋 Action ID: ${actionId}`);
    
    // Check if factory is already authorized
    const isAuthorized = await authorizer.canPerform(actionId, factoryAddress, vaultAddress);
    console.log(`📋 Factory already authorized: ${isAuthorized}`);
    
    if (!isAuthorized) {
      // Grant permission to the factory
      console.log("🔐 Granting permission to factory...");
      const tx = await authorizer.grantSpecificRole(actionId, factoryAddress, vaultAddress);
      await tx.wait();
      console.log("✅ Factory authorized successfully!");
      console.log(`Transaction hash: ${tx.hash}`);
    } else {
      console.log("✅ Factory is already authorized!");
    }
    
    // Verify the authorization
    const isNowAuthorized = await authorizer.canPerform(actionId, factoryAddress, vaultAddress);
    console.log(`📋 Factory authorization verified: ${isNowAuthorized}`);
    
  } catch (error) {
    console.error("❌ Authorization failed:", error);
    throw error;
  }
}

authorizeFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 