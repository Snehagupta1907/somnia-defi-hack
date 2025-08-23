import { type Token, type InsertToken, type Pool, type InsertPool, type Swap, type InsertSwap, type Analytics } from "@shared/schema";
import { Token as MongoToken, Pool as MongoPool, Swap as MongoSwap, Analytics as MongoAnalytics } from "@shared/mongo-schema";
import { randomUUID } from "crypto";

export class MongoStorage implements IStorage {
  constructor() {
    // Initialize with mock data if collections are empty
    this.initializeMockData();
  }

  private async initializeMockData() {
    try {
      // Check if we already have data
      const tokenCount = await MongoToken.countDocuments();
      if (tokenCount === 0) {
        await this.seedMockData();
      }
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  private async seedMockData() {
    // Mock tokens
    const mockTokens: InsertToken[] = [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        decimals: "18",
        logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xA0b86a33E6441cc8a2A446e8a4C0094DF1aF1b27",
        decimals: "6",
        logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: "6",
        logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: "18",
        logoUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
      },
    ];

    for (const tokenData of mockTokens) {
      await this.createToken(tokenData);
    }

    // Mock pools
    const mockPools: InsertPool[] = [
      {
        name: "ETH/USDC",
        type: "balancer",
        tokens: [
          { address: "0x0000000000000000000000000000000000000000", weight: 50, symbol: "ETH" },
          { address: "0xA0b86a33E6441cc8a2A446e8a4C0094DF1aF1b27", weight: 50, symbol: "USDC" }
        ],
        tvl: "2400000",
        apr: "18.5",
        volume24h: "145000",
        fees24h: "2250",
        isActive: true,
      },
      {
        name: "BTC/ETH/USDC",
        type: "balancer",
        tokens: [
          { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", weight: 33, symbol: "BTC" },
          { address: "0x0000000000000000000000000000000000000000", weight: 33, symbol: "ETH" },
          { address: "0xA0b86a33E6441cc8a2A446e8a4C0094DF1aF1b27", weight: 34, symbol: "USDC" }
        ],
        tvl: "5800000",
        apr: "24.2",
        volume24h: "298000",
        fees24h: "4650",
        isActive: true,
      },
      {
        name: "ETH/USDC",
        type: "uniswap-v3",
        tokens: [
          { address: "0x0000000000000000000000000000000000000000", weight: 50, symbol: "ETH" },
          { address: "0xA0b86a33E6441cc8a2A446e8a4C0094DF1aF1b27", weight: 50, symbol: "USDC" }
        ],
        tvl: "12300000",
        apr: "15.7",
        volume24h: "867000",
        fees24h: "13500",
        isActive: true,
      },
    ];

    for (const poolData of mockPools) {
      await this.createPool(poolData);
    }

    // Mock analytics data
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await this.createAnalytics({
        date,
        totalVolumeUsd: `${(2100000 + Math.random() * 1400000).toFixed(0)}`,
        totalTvlUsd: `${(20100000 + i * 700000 + Math.random() * 500000).toFixed(0)}`,
        totalFeesUsd: `${(35000 + Math.random() * 15000).toFixed(0)}`,
        activePools: `${150 + Math.floor(Math.random() * 10)}`,
      });
    }
  }

  private async createAnalytics(data: Omit<Analytics, 'id' | 'createdAt'>) {
    const analytics = new MongoAnalytics({
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    });
    return await analytics.save();
  }

  // Token methods
  async getTokens(): Promise<Token[]> {
    const mongoTokens = await MongoToken.find().lean();
    return mongoTokens.map(token => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      decimals: token.decimals,
      logoUrl: token.logoUrl,
      createdAt: token.createdAt,
    }));
  }

  async getToken(id: string): Promise<Token | undefined> {
    const mongoToken = await MongoToken.findOne({ id }).lean();
    if (!mongoToken) return undefined;
    
    return {
      id: mongoToken.id,
      symbol: mongoToken.symbol,
      name: mongoToken.name,
      address: mongoToken.address,
      decimals: mongoToken.decimals,
      logoUrl: mongoToken.logoUrl,
      createdAt: mongoToken.createdAt,
    };
  }

  async createToken(token: InsertToken): Promise<Token> {
    const mongoToken = new MongoToken({
      id: randomUUID(),
      ...token,
      createdAt: new Date(),
    });
    
    const savedToken = await mongoToken.save();
    return {
      id: savedToken.id,
      symbol: savedToken.symbol,
      name: savedToken.name,
      address: savedToken.address,
      decimals: savedToken.decimals,
      logoUrl: savedToken.logoUrl,
      createdAt: savedToken.createdAt,
    };
  }

  // Pool methods
  async getPools(): Promise<Pool[]> {
    const mongoPools = await MongoPool.find().lean();
    return mongoPools.map(pool => ({
      id: pool.id,
      name: pool.name,
      type: pool.type,
      tokens: pool.tokens,
      tvl: pool.tvl,
      apr: pool.apr,
      volume24h: pool.volume24h,
      fees24h: pool.fees24h,
      isActive: pool.isActive,
      createdAt: pool.createdAt,
    }));
  }

  async getPool(id: string): Promise<Pool | undefined> {
    const mongoPool = await MongoPool.findOne({ id }).lean();
    if (!mongoPool) return undefined;
    
    return {
      id: mongoPool.id,
      name: mongoPool.name,
      type: mongoPool.type,
      tokens: mongoPool.tokens,
      tvl: mongoPool.tvl,
      apr: mongoPool.apr,
      volume24h: mongoPool.volume24h,
      fees24h: mongoPool.fees24h,
      isActive: mongoPool.isActive,
      createdAt: mongoPool.createdAt,
    };
  }

  async getPoolsByType(type: string): Promise<Pool[]> {
    const mongoPools = await MongoPool.find({ type }).lean();
    return mongoPools.map(pool => ({
      id: pool.id,
      name: pool.name,
      type: pool.type,
      tokens: pool.tokens,
      tvl: pool.tvl,
      apr: pool.apr,
      volume24h: pool.volume24h,
      fees24h: pool.fees24h,
      isActive: pool.isActive,
      createdAt: pool.createdAt,
    }));
  }

  async createPool(pool: InsertPool): Promise<Pool> {
    const mongoPool = new MongoPool({
      id: randomUUID(),
      ...pool,
      createdAt: new Date(),
    });
    
    const savedPool = await mongoPool.save();
    return {
      id: savedPool.id,
      name: savedPool.name,
      type: savedPool.type,
      tokens: savedPool.tokens,
      tvl: savedPool.tvl,
      apr: savedPool.apr,
      volume24h: savedPool.volume24h,
      fees24h: savedPool.fees24h,
      isActive: savedPool.isActive,
      createdAt: savedPool.createdAt,
    };
  }

  // Swap methods
  async getSwaps(): Promise<Swap[]> {
    const mongoSwaps = await MongoSwap.find().lean();
    return mongoSwaps.map(swap => ({
      id: swap.id,
      fromToken: swap.fromToken,
      toToken: swap.toToken,
      fromAmount: swap.fromAmount,
      toAmount: swap.toAmount,
      rate: swap.rate,
      slippage: swap.slippage,
      networkFee: swap.networkFee,
      userAddress: swap.userAddress,
      txHash: swap.txHash,
      status: swap.status,
      createdAt: swap.createdAt,
    }));
  }

  async createSwap(swap: InsertSwap): Promise<Swap> {
    const mongoSwap = new MongoSwap({
      id: randomUUID(),
      ...swap,
      createdAt: new Date(),
    });
    
    const savedSwap = await mongoSwap.save();
    return {
      id: savedSwap.id,
      fromToken: savedSwap.fromToken,
      toToken: savedSwap.toToken,
      fromAmount: savedSwap.fromAmount,
      toAmount: savedSwap.toAmount,
      rate: savedSwap.rate,
      slippage: savedSwap.slippage,
      networkFee: savedSwap.networkFee,
      userAddress: savedSwap.userAddress,
      txHash: savedSwap.txHash,
      status: savedSwap.status,
      createdAt: savedSwap.createdAt,
    };
  }

  async updateSwapStatus(id: string, status: string, txHash?: string): Promise<Swap | undefined> {
    const updateData: any = { status };
    if (txHash) updateData.txHash = txHash;
    
    const updatedSwap = await MongoSwap.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    ).lean();
    
    if (!updatedSwap) return undefined;
    
    return {
      id: updatedSwap.id,
      fromToken: updatedSwap.fromToken,
      toToken: updatedSwap.toToken,
      fromAmount: updatedSwap.fromAmount,
      toAmount: updatedSwap.toAmount,
      rate: updatedSwap.rate,
      slippage: updatedSwap.slippage,
      networkFee: updatedSwap.networkFee,
      userAddress: updatedSwap.userAddress,
      txHash: updatedSwap.txHash,
      status: updatedSwap.status,
      createdAt: updatedSwap.createdAt,
    };
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics[]> {
    const mongoAnalytics = await MongoAnalytics.find().sort({ date: 1 }).lean();
    return mongoAnalytics.map(analytics => ({
      id: analytics.id,
      date: analytics.date,
      totalVolumeUsd: analytics.totalVolumeUsd,
      totalTvlUsd: analytics.totalTvlUsd,
      totalFeesUsd: analytics.totalFeesUsd,
      activePools: analytics.activePools,
    }));
  }
}

// Import the interface from storage.ts
import { IStorage } from "./storage"; 