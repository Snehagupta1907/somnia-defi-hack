import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(__dirname, "uniswap.config.json");

// Utility: read config or create default
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  }
  return {
    network: "somnia",
    uniswap: {},
  };
}

// Utility: save config
function saveConfig(config: any) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function deployUniswapV3Factory() {
  console.log("Deploying Factory Contract...");

  const FactoryContractName = "UniswapV3Factory";
  const factoryContract = await ethers.deployContract(FactoryContractName, []);
  await factoryContract.waitForDeployment();

  const address = await factoryContract.getAddress();
  console.log("Deployed Factory Contract:", address);

  // Load + update config
  const config = loadConfig();
  config.network = (await ethers.provider.getNetwork()).name || "unknown";
  config.uniswap.factory = address;

  saveConfig(config);
  console.log("✅ Config updated at:", CONFIG_PATH);
}

async function main() {
  await deployUniswapV3Factory();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
