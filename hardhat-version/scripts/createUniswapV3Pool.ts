import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(__dirname, "uniswap.config.json");

// read config
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

// replacer for BigInt
function replacer(_key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}

// save config
function saveConfig(updatedConfig: any) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, replacer, 2));
  console.log("✅ Config updated at:", CONFIG_PATH);
}

async function createPool() {
  const config = loadConfig();

  const CONTRACT_NAME = "UniswapV3Factory";
  const UTILS_CONTRACT_NAME = "TestUtils";

  // token list
  const tokens = {
    USDTG: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
    PUMPAZ: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58",
    NIA: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311",
    CHECK: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8",
    WSTT: "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
  };

  // pool setup
  const token0Symbol = "WSTT";
  const token1Symbol = "NIA";
  const token0 = tokens[token0Symbol];
  const token1 = tokens[token1Symbol];
  const poolName = `${token0Symbol}-${token1Symbol}`;
  const factoryAddress = config.uniswap.factory;
  const fee = 3000;
  const initPrice = 5000;

  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as string,
    ethers.provider
  );

  console.log("Deployer address:", sender.address);

  const factoryContract = await ethers.getContractAt(CONTRACT_NAME, factoryAddress, sender);
  const utilsContract = await ethers.getContractAt(UTILS_CONTRACT_NAME, config.uniswap.testutils, sender);

  // check if pool exists
  let poolAddress = await factoryContract.pools(token0, token1, fee);
  let poolInstance;

  if (poolAddress !== ethers.ZeroAddress) {
    console.log(`✅ Pool already exists at: ${poolAddress}`);
    poolInstance = await ethers.getContractAt("UniswapV3Pool", poolAddress, sender);

    const slot0 = await poolInstance.slot0();
    if (slot0.sqrtPriceX96 === 0n) {
      let sqrtPrice = await utilsContract.sqrtP(initPrice);
      console.log("Initializing pool with sqrtPrice:", sqrtPrice.toString());
      let tx = await poolInstance.initialize(sqrtPrice);
      await tx.wait();
      console.log("Transaction sent:", tx.hash);
    }
  } else {
    console.log("⏳ Pool not found, creating new pool...");
    const tx = await factoryContract.createPool(token0, token1, fee);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("📦 Tx confirmed in block:", receipt.blockNumber);

    poolAddress = await factoryContract.pools(token0, token1, fee);
    console.log("🎉 New Pool Address:", poolAddress);

    poolInstance = await ethers.getContractAt("UniswapV3Pool", poolAddress, sender);

    let sqrtPrice = await utilsContract.sqrtP(initPrice);
    console.log("Initializing pool with sqrtPrice:", sqrtPrice.toString());
    let poolTx = await poolInstance.initialize(sqrtPrice);
    await poolTx.wait();
  }

  // fetch slot0 details
  const slot0 = await poolInstance.slot0();
  console.log("📊 Slot0 details:", slot0);

  // update config with poolName
  const updatedConfig = {
    ...config,
    pools: {
      ...(config.pools || {}),
      [poolName]: {
        address: poolAddress,
        token0,
        token1,
        fee,
        slot0: {
          sqrtPriceX96: slot0[0].toString(),
          tick: slot0[1].toString(),
          observationIndex: slot0[2].toString(),
          observationCardinality: slot0[3].toString(),
          observationCardinalityNext: slot0[4].toString(),
        },
        timestamp: Date.now(),
      },
    },
  };

  saveConfig(updatedConfig);
}

async function main() {
  await createPool();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
