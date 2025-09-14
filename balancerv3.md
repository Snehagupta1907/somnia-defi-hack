## Balancer Pools V3 Somnia Testnet Config 

```
{
  weightedPoolFactory: "0xddf223827D0c769CA06Bc2837dBa86d5677A50e5",
  vault: "0x343EE6164822460Fb84065F24C8296AFaeC47a5b",
  factoryConfig: {
    factoryVersion: "1.0.0",
    poolVersion: "1.0.0",
    pauseWindowDuration: 0
  },
  deployer: "0xdAF0182De86F904918Db8d07c7340A1EfcDF8244",
  timestamp: 1757190460483,
  pools: [
    {
      id: "USDTG-WSTT",
      address: "0xe995729FCB0AE05d86bb89c5b0b13b95CAF6f097",
      tokens: {
        USDTG: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
        WSTT: "0xF22eF0085f6511f70b01a68F360dCc56261F768a"
      },
      config: {
        name: "Somnia USDTG-WSTT Weighted Pool",
        symbol: "SOMNIA-WP-2T",
        swapFeePercentage: "3000000000000000",
        enableDonation: true,
        disableUnbalancedLiquidity: false,
        weights: [
          "500000000000000000",
          "500000000000000000"
        ]
      },
      initialLiquidityAdded: true,
      initialLiquidityAmounts: {
        USDTG: "500000000000000000",
        WSTT: "500000000000000000"
      },
      poolInitialized: true,
      slippageTolerance: 0.01
    },
    {
      id: "USDTG-PUMPAZ",
      address: "0xdc44d410c0bC107aa37FEAbec72B346f03DbA9eD",
      tokens: {
        USDTG: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
        PUMPAZ: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58"
      },
      config: {
        name: "Somnia USDTG-PUMPAZ Weighted Pool",
        symbol: "SOMNIA-WP-2T",
        swapFeePercentage: "3000000000000000",
        enableDonation: true,
        disableUnbalancedLiquidity: false,
        weights: [
          "500000000000000000",
          "500000000000000000"
        ]
      },
      initialLiquidityAdded: true,
      poolInitialized: true,
      slippageTolerance: 0.01
    },
    {
      id: "WSTT-NIA",
      address: "0x0899615f8f4620ea7E54319bcEa7F48175025870",
      tokens: {
        WSTT: "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
        NIA: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311"
      },
      config: {
        name: "Somnia WSTT-NIA Weighted Pool",
        symbol: "SOMNIA-WP-2T",
        swapFeePercentage: "3000000000000000",
        enableDonation: true,
        disableUnbalancedLiquidity: false,
        weights: [
          "500000000000000000",
          "500000000000000000"
        ]
      },
      poolInitialized: true,
      slippageTolerance: 0.01
    }
  ],
  weth: "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
  permit2: "0xb012c6B0f0Ce47eB7Da3B542A18aBBa355458826",
  router: "0x20371AD0921151682AEEA67C16db38144ebEaa8E",
  somniaTokens: {
    USDTG: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76",
    WSTT: "0xF22eF0085f6511f70b01a68F360dCc56261F768a",
    PUMPAZ: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58",
    NIA: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311",
    CHECK: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8",
    STT: "0x0000000000000000000000000000000000000000"
  }
};
```