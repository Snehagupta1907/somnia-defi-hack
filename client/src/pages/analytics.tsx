import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Lock, BarChart3, Waves, Coins } from "lucide-react";
import AnalyticsChart from "@/components/analytics-chart";

interface Stats {
  totalValueLocked: string;
  volume24h: string;
  activePools: number;
  totalFees: string;
}

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const formatCurrency = (value: string | undefined) => {
    if (!value) return "$0";
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const keyMetrics = [
    {
      title: "Total Value Locked",
      value: formatCurrency(stats?.totalValueLocked),
      change: "+12.5% 24h",
      icon: Lock,
      color: "text-color-sage",
    },
    {
      title: "24h Volume",
      value: formatCurrency(stats?.volume24h),
      change: "+8.1% 24h",
      icon: BarChart3,
      color: "text-color-black",
    },
    {
      title: "Active Pools",
      value: stats?.activePools?.toString() || "0",
      change: "+3 new",
      icon: Waves,
      color: "text-color-sage",
    },
    {
      title: "Total Fees",
      value: formatCurrency(stats?.totalFees),
      change: "+15.3% 24h",
      icon: Coins,
      color: "text-color-black",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-8 text-text-primary"
      >
        Analytics Dashboard
      </motion.h1>
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass-morphism rounded-xl p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-muted">{metric.title}</h3>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <p className="text-2xl font-bold mb-1 text-text-primary">
              {statsLoading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                metric.value
              )}
            </p>
            <p className="text-sm text-green-600">{metric.change}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnalyticsChart
            title="Trading Volume"
            data={analytics}
            dataKey="totalVolumeUsd"
            color="#A2D5C6"
            loading={analyticsLoading}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <AnalyticsChart
            title="TVL Growth"
            data={analytics}
            dataKey="totalTvlUsd"
            color="#CFFFE2"
            loading={analyticsLoading}
          />
        </motion.div>
      </div>
      
      {/* Top Pools Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-morphism rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-6 text-text-primary">Top Performing Pools</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-text-muted">Pool</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">TVL</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">24h Volume</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">APR</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">7d Change</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-color-sage"></div>
                      <div className="w-6 h-6 rounded-full bg-color-mint"></div>
                    </div>
                    <span className="font-medium text-text-primary">ETH/USDC</span>
                  </div>
                </td>
                <td className="py-3 font-medium text-text-primary">$2.4M</td>
                <td className="py-3 font-medium text-text-primary">$145K</td>
                <td className="py-3 font-medium text-green-600">18.5%</td>
                <td className="py-3 font-medium text-green-600">+12.3%</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-color-black"></div>
                      <div className="w-6 h-6 rounded-full bg-color-sage"></div>
                      <div className="w-6 h-6 rounded-full bg-color-mint"></div>
                    </div>
                    <span className="font-medium text-text-primary">BTC/ETH/USDC</span>
                  </div>
                </td>
                <td className="py-3 font-medium text-text-primary">$5.8M</td>
                <td className="py-3 font-medium text-text-primary">$298K</td>
                <td className="py-3 font-medium text-green-600">24.2%</td>
                <td className="py-3 font-medium text-green-600">+8.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
