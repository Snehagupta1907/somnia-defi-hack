/* eslint-disable comma-spacing */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@nomicfoundation/hardhat-ethers';
import "hardhat-dependency-compiler";
import '@nomicfoundation/hardhat-chai-matchers';
import dotenv from 'dotenv';

dotenv.config();

const config: any = {
  solidity: {
    version: '0.8.25',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
    },
  },
  paths: {
    sources: "./pkg/pool-weighted/contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 60000,
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
    },
    monad: {
      url: 'https://testnet-rpc.monad.xyz',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10143,
      maxFeePerGas: 20000000000,
      maxPriorityFeePerGas: 1000000000,
      timeout: 60000,
    },
    monadTestnet: {
      url: 'https://testnet-rpc.monad.xyz',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10144,
      gasPrice: 1000000000,
      timeout: 60000,
    },
    somnia: {
      url: 'https://dream-rpc.somnia.network',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 50312,
      timeout: 60000,
    },
  },
 
};

export default config;