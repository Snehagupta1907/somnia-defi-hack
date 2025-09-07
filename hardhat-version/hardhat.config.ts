import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

const ACCOUNTS = process.env.DEPLOYER_ACCOUNT_PRIV_KEY
  ? [`${process.env.DEPLOYER_ACCOUNT_PRIV_KEY}`]
  : [];

module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: false,
  },
  networks: {
    hardhat: { 
      chainId: 31337,
      allowUnlimitedContractSize: true, // 🔥 allow bigger contracts in local testing
    },
    somniaTestnet: {
      chainId: 50312,
      url: "http://dream-rpc.somnia.network/",
      accounts: ACCOUNTS,
      allowUnlimitedContractSize: true, // 🔥 useful if contract is very large
    }
  },
  etherscan: {
    apiKey: {},
    customChains: [
      {
        network: "somniaTestnet",
        chainId: 50312,
        urls: {
          apiURL: "https://explorer.evm.iota.org/api",
          browserURL: "https://shannon-explorer.somnia.network/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // ⚡ helps reduce contract size
    },
  },
  mocha: {
    timeout: 100000000, // ⏳ increase test timeout
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
