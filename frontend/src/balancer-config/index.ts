import type { Token } from "@/types/schema";
export const SWAP_CONFIG = {
    amountIn: 0.1, // 0.1 USDTG
    tokenIn: 'USDTG', // USDTG -> WSTT
    tokenOut: 'WSTT',
    slippageTolerance: 0.01 // 1% slippage tolerance
  };
  
  // Permit2 ABI for token approvals
  export const PERMIT2_ABI = [
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

  export function getDeadline(secondsFromNow = 1800): bigint {
    return BigInt(Math.floor(Date.now() / 1000) + secondsFromNow);
  }

  export const RouterAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "maxAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "addLiquidityCustom",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "bptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "maxAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "addLiquidityProportional",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsIn",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "addLiquiditySingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "exactAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "addLiquidityUnbalanced",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "amountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "donate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20[]",
          "name": "tokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "exactAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "initialize",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "maxAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryAddLiquidityCustom",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "bptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryAddLiquidityProportional",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsIn",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryAddLiquiditySingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "exactAmountsIn",
          "type": "uint256[]"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryAddLiquidityUnbalanced",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minAmountsOut",
          "type": "uint256[]"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryRemoveLiquidityCustom",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryRemoveLiquidityProportional",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        }
      ],
      "name": "queryRemoveLiquidityRecovery",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryRemoveLiquiditySingleTokenExactIn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "queryRemoveLiquiditySingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "querySwapSingleTokenExactIn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "querySwapSingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minAmountsOut",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "removeLiquidityCustom",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minAmountsOut",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "removeLiquidityProportional",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minAmountsOut",
          "type": "uint256[]"
        }
      ],
      "name": "removeLiquidityRecovery",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amountsOut",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "minAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "removeLiquiditySingleTokenExactIn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxBptAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "removeLiquiditySingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bptAmountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "swapSingleTokenExactIn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exactAmountOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "wethIsEth",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "name": "swapSingleTokenExactOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

  export const config  = {
    "weightedPoolFactory": "0x3bC6E3327A32b09EB47d0D6933100dc2e54FD7ad",
    "vault": "0xD847c07D1Ae5Ebe202cB54B7152BbeA89d9895aF",
    "factoryConfig": {
      "factoryVersion": "1.0.0",
      "poolVersion": "1.0.0",
      "pauseWindowDuration": 0
    },
    "deployer": "0xcfa038455b54714821f291814071161c9870B891",
    "timestamp": 1755975695267,
    "somniaWeightedPool": "0x4c422208B7b307D523DE40573cfa01A7F1F81373",
    "somniaTokens": {
      "USDTG": "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
      "WSTT": "0xF22eF0085f6511f70b01a68F360dCc56261F768a"
    },
    "poolConfig": {
      "name": "Somnia USDTG-WSTT Weighted Pool",
      "symbol": "SOMNIA-WP-2T",
      "swapFeePercentage": "3000000000000000",
      "enableDonation": true,
      "disableUnbalancedLiquidity": false,
      "weights": [
        "500000000000000000",
        "500000000000000000"
      ]
    },
    "weth": "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
    "permit2": "0xb012c6B0f0Ce47eB7Da3B542A18aBBa355458826",
    "router": "0x56AbBf7c1335192360f9d3B99018D2E3A3E4B19A",
    "initialLiquidityAdded": true,
    "initialLiquidityAmounts": {
      "USDTG": "500000000000000000",
      "WSTT": "500000000000000000"
    },
    "poolInitialized": true
  };

export const TokenAbi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
 
  export const tokens: Token[] = [
    { id: "somnia_native", symbol: "STT", name: "Somnia Native Token", address: "0x0000000000000000000000000000000000000000", decimals: "18", logoUrl: "https://somnia.exchange/stt-logo.png", createdAt: new Date() },
    { id: "usdtg", symbol: "USDT Ginger", name: "USDT Ginger", address: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ensar2318/v2-sdk/refs/heads/main/images/0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76.png", createdAt: new Date() },
    { id: "wstt", symbol: "WSTT", name: "Wrapped STT", address: "0xF22eF0085f6511f70b01a68F360dCc56261F768a", decimals: "18", logoUrl: "https://somnia.exchange/stt-logo.png", createdAt: new Date() },
    { id: "pumpaz", symbol: "PUMPAZ", name: "PumpAz", address: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58.jpg", createdAt: new Date() },
    { id: "nia", symbol: "NIA", name: "Nia Token", address: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xF2F773753cEbEFaF9b68b841d80C083b18C69311.png", createdAt: new Date() },
    { id: "check", symbol: "CHECK", name: "Check Token", address: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8.png", createdAt: new Date() },
  ];