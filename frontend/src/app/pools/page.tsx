'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PoolCard from "@/components/pool-card";
import CreatePoolModal from "@/components/modals/create-pool-modal";

interface Pool {
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

export default function Pools() {
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: balancerPools, isLoading: balancerLoading } = useQuery<Pool[]>({
    queryKey: ["/api/pools", "balancer"],
    queryFn: async () => {
      const response = await fetch("/api/pools?type=balancer");
      if (!response.ok) throw new Error("Failed to fetch Balancer pools");
      return response.json();
    },
  });

  const { data: uniswapPools, isLoading: uniswapLoading } = useQuery<Pool[]>({
    queryKey: ["/api/pools", "uniswap-v3"],
    queryFn: async () => {
      const response = await fetch("/api/pools?type=uniswap-v3");
      if (!response.ok) throw new Error("Failed to fetch Uniswap V3 pools");
      return response.json();
    },
  });

  const filterPools = (pools: Pool[] | undefined) => {
    if (!pools) return [];
    if (!searchQuery) return pools;
    return pools.filter(pool => 
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(pool.tokens) && pool.tokens.some((token: any) => 
        token.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-text-primary"
        >
          Liquidity Pools
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            onClick={() => setIsCreatePoolModalOpen(true)}
            className="gradient-bg text-white hover:opacity-90 transition-opacity duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Pool</span>
          </Button>
        </motion.div>
      </div>
      
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-morphism rounded-xl p-4 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Pools Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Pools</TabsTrigger>
          <TabsTrigger value="balancer">Balancer</TabsTrigger>
          <TabsTrigger value="uniswap">Uniswap V3</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterPools(balancerPools)?.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
            {filterPools(uniswapPools)?.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balancer" className="space-y-6">
          {balancerLoading ? (
            <div className="text-center py-8">Loading Balancer pools...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterPools(balancerPools)?.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="uniswap" className="space-y-6">
          {uniswapLoading ? (
            <div className="text-center py-8">Loading Uniswap V3 pools...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterPools(uniswapPools)?.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Pool Modal */}
      <CreatePoolModal
        open={isCreatePoolModalOpen}
        onClose={() => setIsCreatePoolModalOpen(false)}
      />
    </div>
  );
} 