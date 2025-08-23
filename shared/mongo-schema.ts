import mongoose, { Schema, Document } from 'mongoose';

// Token Schema
export interface IToken extends Document {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: string;
  logoUrl?: string;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>({
  id: { type: String, required: true, unique: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true, unique: true },
  decimals: { type: String, required: true },
  logoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Pool Schema
export interface IPool extends Document {
  id: string;
  name: string;
  type: string;
  tokens: Array<{ address: string; weight: number; symbol: string }>;
  tvl: string;
  apr: string;
  volume24h: string;
  fees24h: string;
  isActive: boolean;
  createdAt: Date;
}

const PoolSchema = new Schema<IPool>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  tokens: [{
    address: { type: String, required: true },
    weight: { type: Number, required: true },
    symbol: { type: String, required: true }
  }],
  tvl: { type: String, required: true },
  apr: { type: String, required: true },
  volume24h: { type: String, required: true },
  fees24h: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Swap Schema
export interface ISwap extends Document {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  slippage: string;
  networkFee: string;
  userAddress?: string;
  txHash?: string;
  status: string;
  createdAt: Date;
}

const SwapSchema = new Schema<ISwap>({
  id: { type: String, required: true, unique: true },
  fromToken: { type: String, required: true },
  toToken: { type: String, required: true },
  fromAmount: { type: String, required: true },
  toAmount: { type: String, required: true },
  rate: { type: String, required: true },
  slippage: { type: String, required: true },
  networkFee: { type: String, required: true },
  userAddress: { type: String },
  txHash: { type: String },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Analytics Schema
export interface IAnalytics extends Document {
  id: string;
  date: Date;
  totalVolumeUsd: string;
  totalTvlUsd: string;
  totalFeesUsd: string;
  activePools: string;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  totalVolumeUsd: { type: String, required: true },
  totalTvlUsd: { type: String, required: true },
  totalFeesUsd: { type: String, required: true },
  activePools: { type: String, required: true }
});

// Create and export models
export const Token = mongoose.model<IToken>('Token', TokenSchema);
export const Pool = mongoose.model<IPool>('Pool', PoolSchema);
export const Swap = mongoose.model<ISwap>('Swap', SwapSchema);
export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

// Export types for use in storage
export type MongoToken = Omit<IToken, keyof Document>;
export type MongoPool = Omit<IPool, keyof Document>;
export type MongoSwap = Omit<ISwap, keyof Document>;
export type MongoAnalytics = Omit<IAnalytics, keyof Document>; 