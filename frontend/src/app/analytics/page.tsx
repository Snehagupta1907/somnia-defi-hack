'use client'

import { motion } from "framer-motion";
import { BarChart2, Coins, TrendingUp, PieChart } from "lucide-react";
import AnalyticsChart from "@/components/analytics-chart";

export default function Analytics() {
  // ✅ Dummy stats
  const stats = {
    totalValueLocked: 1250000,
    volume24h: 85600,
    activePools: 3,
    totalFees: 4300,
  };

  // ✅ Dummy analytics chart data
  const analytics = [
    { date: "2025-08-01", totalVolumeUsd: 120000, tvl: 800000 },
    { date: "2025-08-02", totalVolumeUsd: 150000, tvl: 900000 },
    { date: "2025-08-03", totalVolumeUsd: 180000, tvl: 1000000 },
    { date: "2025-08-04", totalVolumeUsd: 140000, tvl: 950000 },
    { date: "2025-08-05", totalVolumeUsd: 200000, tvl: 1100000 },
    { date: "2025-08-06", totalVolumeUsd: 220000, tvl: 1250000 },
  ];

  const statsConfig = [
    {
      title: "Total Value Locked",
      value: `$${parseFloat(stats.totalValueLocked.toString()).toLocaleString()}`,
      icon: Coins,
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "24h Volume",
      value: `$${parseFloat(stats.volume24h.toString()).toLocaleString()}`,
      icon: BarChart2,
      color: "from-blue-400 to-indigo-500",
    },
    {
      title: "Active Pools",
      value: stats.activePools,
      icon: PieChart,
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Total Fees",
      value: `$${parseFloat(stats.totalFees.toString()).toLocaleString()}`,
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
          data={analytics}
          dataKey="totalVolumeUsd"
          color="#10B981"
          loading={false}
        />
      </motion.div>
    </div>
  );
}
