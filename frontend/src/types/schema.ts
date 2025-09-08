// Frontend-only types without database dependencies
export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: string;
  logoUrl: string | null;
  createdAt: Date;
}

export interface Pool {
  id: string;
  name: string;
  type: string; // 'balancer' or 'uniswap-v3'
  address: string;
  tokens: any; // array of token addresses with weights
  tvl: string;
  apr: string;
  volume24h: string;
  fees24h: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Swap {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  slippage: string;
  networkFee: string;
  userAddress: string | null;
  txHash: string | null;
  status: string; // 'pending', 'completed', 'failed'
  createdAt: Date;
}

export interface Analytics {
  id: string;
  date: Date;
  totalVolumeUsd: string;
  totalTvlUsd: string;
  totalFeesUsd: string;
  activePools: string;
}