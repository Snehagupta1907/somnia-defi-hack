import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSwapSchema, insertPoolSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Token routes
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.getToken(req.params.id);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token" });
    }
  });

  // Pool routes
  app.get("/api/pools", async (req, res) => {
    try {
      const { type } = req.query;
      let pools;
      
      if (type && typeof type === "string") {
        pools = await storage.getPoolsByType(type);
      } else {
        pools = await storage.getPools();
      }
      
      res.json(pools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pools" });
    }
  });

  app.get("/api/pools/:id", async (req, res) => {
    try {
      const pool = await storage.getPool(req.params.id);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }
      res.json(pool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pool" });
    }
  });

  app.post("/api/pools", async (req, res) => {
    try {
      const poolData = insertPoolSchema.parse(req.body);
      const pool = await storage.createPool(poolData);
      res.status(201).json(pool);
    } catch (error) {
      res.status(400).json({ message: "Invalid pool data" });
    }
  });

  // Swap routes
  app.get("/api/swaps", async (req, res) => {
    try {
      const swaps = await storage.getSwaps();
      res.json(swaps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch swaps" });
    }
  });

  app.post("/api/swaps", async (req, res) => {
    try {
      const swapData = insertSwapSchema.parse(req.body);
      const swap = await storage.createSwap(swapData);
      
      // Simulate transaction processing
      setTimeout(async () => {
        await storage.updateSwapStatus(swap.id, "completed", `0x${Math.random().toString(16).substr(2, 64)}`);
      }, 2000);
      
      res.status(201).json(swap);
    } catch (error) {
      res.status(400).json({ message: "Invalid swap data" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get current DEX statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const pools = await storage.getPools();
      const analytics = await storage.getAnalytics();
      const latestAnalytics = analytics[analytics.length - 1];
      
      const stats = {
        totalValueLocked: latestAnalytics.totalTvlUsd,
        volume24h: latestAnalytics.totalVolumeUsd,
        activePools: pools.filter(p => p.isActive).length,
        totalFees: latestAnalytics.totalFeesUsd,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
