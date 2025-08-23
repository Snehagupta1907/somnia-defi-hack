import { type Token, type InsertToken, type Pool, type InsertPool, type Swap, type InsertSwap, type Analytics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tokens
  getTokens(): Promise<Token[]>;
  getToken(id: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;

  // Pools
  getPools(): Promise<Pool[]>;
  getPool(id: string): Promise<Pool | undefined>;
  getPoolsByType(type: string): Promise<Pool[]>;
  createPool(pool: InsertPool): Promise<Pool>;

  // Swaps
  getSwaps(): Promise<Swap[]>;
  createSwap(swap: InsertSwap): Promise<Swap>;
  updateSwapStatus(id: string, status: string, txHash?: string): Promise<Swap | undefined>;

  // Analytics
  getAnalytics(): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private tokens: Map<string, Token>;
  private pools: Map<string, Pool>;
  private swaps: Map<string, Swap>;
  private analytics: Analytics[];

  constructor() {
    this.tokens = new Map();
    this.pools = new Map();
    this.swaps = new Map();
    this.analytics = [];
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock tokens
    const mockTokens: Token[] = [
      {
        id: "eth",
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        decimals: "18",
        logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        createdAt: new Date(),
      },
      {
        id: "usdc",
        symbol: "USDC",
        name: "USD Coin",
        address: "0xA0b86a33E6441cc8a2A446e8a4C0094DF1aF1b27",
        decimals: "6",
        logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        createdAt: new Date(),
      },
      {
        id: "usdt",
        symbol: "USDT",
        name: "Tether",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: "6",
        logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",
        createdAt: new Date(),
      },
      {
        id: "dai",
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: "18",
        logoUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
        createdAt: new Date(),
      },
    ];

    mockTokens.forEach(token => this.tokens.set(token.id, token));

    // Mock pools
    const mockPools: Pool[] = [
      {
        id: "eth-usdc-balancer",
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
        createdAt: new Date(),
      },
      {
        id: "btc-eth-usdc-balancer",
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
        createdAt: new Date(),
      },
      {
        id: "eth-usdc-uniswap",
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
        createdAt: new Date(),
      },
    ];

    mockPools.forEach(pool => this.pools.set(pool.id, pool));

    // Mock analytics data
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      this.analytics.push({
        id: `analytics-${i}`,
        date,
        totalVolumeUsd: `${(2100000 + Math.random() * 1400000).toFixed(0)}`,
        totalTvlUsd: `${(20100000 + i * 700000 + Math.random() * 500000).toFixed(0)}`,
        totalFeesUsd: `${(35000 + Math.random() * 15000).toFixed(0)}`,
        activePools: `${150 + Math.floor(Math.random() * 10)}`,
      });
    }
  }

  async getTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getToken(id: string): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = { 
      ...insertToken, 
      id,
      createdAt: new Date(),
    };
    this.tokens.set(id, token);
    return token;
  }

  async getPools(): Promise<Pool[]> {
    return Array.from(this.pools.values());
  }

  async getPool(id: string): Promise<Pool | undefined> {
    return this.pools.get(id);
  }

  async getPoolsByType(type: string): Promise<Pool[]> {
    return Array.from(this.pools.values()).filter(pool => pool.type === type);
  }

  async createPool(insertPool: InsertPool): Promise<Pool> {
    const id = randomUUID();
    const pool: Pool = {
      ...insertPool,
      id,
      createdAt: new Date(),
    };
    this.pools.set(id, pool);
    return pool;
  }

  async getSwaps(): Promise<Swap[]> {
    return Array.from(this.swaps.values());
  }

  async createSwap(insertSwap: InsertSwap): Promise<Swap> {
    const id = randomUUID();
    const swap: Swap = {
      ...insertSwap,
      id,
      createdAt: new Date(),
    };
    this.swaps.set(id, swap);
    return swap;
  }

  async updateSwapStatus(id: string, status: string, txHash?: string): Promise<Swap | undefined> {
    const swap = this.swaps.get(id);
    if (swap) {
      swap.status = status;
      if (txHash) swap.txHash = txHash;
      this.swaps.set(id, swap);
    }
    return swap;
  }

  async getAnalytics(): Promise<Analytics[]> {
    return this.analytics;
  }
}

// Conditionally export storage based on environment
let storage: IStorage;

if (process.env.MONGO_URI) {
  // Import MongoDB storage dynamically to avoid issues when MONGO_URI is not set
  import('./mongo-storage').then(({ MongoStorage }) => {
    storage = new MongoStorage();
  }).catch(() => {
    console.warn('Failed to load MongoDB storage, falling back to in-memory storage');
    storage = new MemStorage();
  });
} else {
  storage = new MemStorage();
}

// Fallback to in-memory storage if MongoDB fails to load
if (!storage) {
  storage = new MemStorage();
}

export { storage };
