import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  decimals: varchar("decimals").notNull(),
  logoUrl: text("logo_url")
});

export const pools = pgTable("pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'balancer' or 'uniswap-v3'
  tokens: jsonb("tokens").notNull(), // array of token addresses with weights
  tvl: decimal("tvl", { precision: 18, scale: 6 }).notNull(),
  apr: decimal("apr", { precision: 5, scale: 2 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 18, scale: 6 }).notNull(),
  fees24h: decimal("fees_24h", { precision: 18, scale: 6 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const swaps = pgTable("swaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromToken: text("from_token").notNull(),
  toToken: text("to_token").notNull(),
  fromAmount: decimal("from_amount", { precision: 18, scale: 6 }).notNull(),
  toAmount: decimal("to_amount", { precision: 18, scale: 6 }).notNull(),
  rate: decimal("rate", { precision: 18, scale: 6 }).notNull(),
  slippage: decimal("slippage", { precision: 3, scale: 2 }).notNull(),
  networkFee: decimal("network_fee", { precision: 18, scale: 6 }).notNull(),
  userAddress: text("user_address"),
  txHash: text("tx_hash"),
  status: text("status").default("pending").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalVolumeUsd: decimal("total_volume_usd", { precision: 18, scale: 6 }).notNull(),
  totalTvlUsd: decimal("total_tvl_usd", { precision: 18, scale: 6 }).notNull(),
  totalFeesUsd: decimal("total_fees_usd", { precision: 18, scale: 6 }).notNull(),
  activePools: varchar("active_pools").notNull(),
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
});

export const insertPoolSchema = createInsertSchema(pools).omit({
  id: true,
  createdAt: true,
});

export const insertSwapSchema = createInsertSchema(swaps).omit({
  id: true,
  createdAt: true,
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Pool = typeof pools.$inferSelect;
export type InsertPool = z.infer<typeof insertPoolSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Analytics = typeof analytics.$inferSelect;
