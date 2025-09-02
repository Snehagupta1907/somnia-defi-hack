import { motion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pool } from "@/types/schema";

interface PoolCardProps {
  pool: Pool;
}

export default function PoolCard({ pool }: PoolCardProps) {
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const getPoolTypeColor = (type: string) => {
    return type === "balancer" 
      ? "bg-color-mint text-color-black" 
      : "bg-color-sage text-white";
  };

  const getPoolTypeLabel = (type: string) => {
    return type === "balancer" ? "Balancer" : "Uniswap V3";
  };

  const renderTokenIcons = (tokens: any[]) => {
    if (!Array.isArray(tokens)) return null;
    
    const colors = ["bg-color-sage", "bg-color-mint", "bg-color-black", "bg-color-light-gray"];
    
    return (
      <div className="flex -space-x-2">
        {tokens.slice(0, 3).map((token, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${colors[index % colors.length]}`}
          >
            <span className="text-white text-xs font-bold">
              {token.symbol?.charAt(0) || "?"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const getPoolDescription = (pool: Pool) => {
    if (!Array.isArray(pool.tokens)) return "Pool";
    
    if (pool.type === "balancer") {
      const weights = pool.tokens.map((token: any) => token.weight).join("/");
      return `${weights} Weighted`;
    } else {
      return "0.05% Fee Tier";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="glass-morphism rounded-xl p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {renderTokenIcons(pool.tokens as any[])}
          <div>
            <h3 className="font-semibold">{pool.name}</h3>
            <p className="text-sm text-gray-600">{getPoolDescription(pool)}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getPoolTypeColor(pool.type)}`}>
          {getPoolTypeLabel(pool.type)}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">TVL</span>
          <span className="font-semibold">{formatCurrency(pool.tvl)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">APR</span>
          <span className="font-semibold text-green-600">{pool.apr}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">24h Volume</span>
          <span className="font-semibold">{formatCurrency(pool.volume24h)}</span>
        </div>
        {pool.type === "uniswap-v3" && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Price Range</span>
            <span className="font-semibold text-color-sage">1800-2100</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex space-x-2">
        <Button className="flex-1 gradient-bg text-white hover:opacity-90 transition-opacity duration-200">
          <Plus className="w-4 h-4 mr-1" />
          Add Liquidity
        </Button>
        <Button variant="outline" size="icon" className="glass-morphism hover-lift">
          <ExternalLink className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    </motion.div>
  );
}
