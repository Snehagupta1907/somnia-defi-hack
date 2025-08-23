'use client'

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AnalyticsChart from "@/components/analytics-chart";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center mb-8 text-text-primary"
      >
        Platform Analytics
      </motion.h1>

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-morphism p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Value Locked</h3>
            <p className="text-2xl font-bold text-text-primary">${parseFloat(stats.totalValueLocked).toLocaleString()}</p>
          </div>
          <div className="glass-morphism p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-text-secondary mb-2">24h Volume</h3>
            <p className="text-2xl font-bold text-text-primary">${parseFloat(stats.volume24h).toLocaleString()}</p>
          </div>
          <div className="glass-morphism p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-text-secondary mb-2">Active Pools</h3>
            <p className="text-2xl font-bold text-text-primary">{stats.activePools}</p>
          </div>
          <div className="glass-morphism p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Fees</h3>
            <p className="text-2xl font-bold text-text-primary">${parseFloat(stats.totalFees).toLocaleString()}</p>
          </div>
        </motion.div>
      )}

      {/* Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-morphism p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Trading Volume & TVL Trends</h2>
        <AnalyticsChart 
          title="Trading Volume"
          data={analytics || []}
          dataKey="totalVolumeUsd"
          color="#10B981"
          loading={isLoading}
        />
      </motion.div>
    </div>
  );
} 