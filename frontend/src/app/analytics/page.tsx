'use client'

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Coins, TrendingUp, PieChart } from "lucide-react";
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
      <div className="max-w-6xl mx-auto px-4 py-8 mt-[10%]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse bg-gray-200/40"
            />
          ))}
        </div>
        <div className="h-96 rounded-xl mt-8 animate-pulse bg-gray-200/40" />
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Total Value Locked",
      value: `$${parseFloat(stats?.totalValueLocked || 0).toLocaleString()}`,
      icon: Coins,
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "24h Volume",
      value: `$${parseFloat(stats?.volume24h || 0).toLocaleString()}`,
      icon: BarChart2,
      color: "from-blue-400 to-indigo-500",
    },
    {
      title: "Active Pools",
      value: stats?.activePools || 0,
      icon: PieChart,
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Total Fees",
      value: `$${parseFloat(stats?.totalFees || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-mono mt-[10%]">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-12 text-text-primary"
      >
        Platform Analytics
      </motion.h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statsConfig.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className=" p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
          >
            <div
              className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r ${stat.color}`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-medium text-text-secondary">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-text-primary mt-2">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className=" p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-6 text-text-primary">
          Trading Volume & TVL Trends
        </h2>
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
