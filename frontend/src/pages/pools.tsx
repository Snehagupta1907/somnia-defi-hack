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
import type { Pool } from "@shared/schema";

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
          <Select>
            <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <SelectValue placeholder="Sort by TVL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tvl">Sort by TVL</SelectItem>
              <SelectItem value="apr">Sort by APR</SelectItem>
              <SelectItem value="volume">Sort by Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>
      
      {/* Pool Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Tabs defaultValue="balancer" className="w-full">
          <TabsList className="glass-morphism p-1 w-fit mb-8">
            <TabsTrigger value="balancer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Balancer Pools
            </TabsTrigger>
            <TabsTrigger value="uniswap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Uniswap V3 Pools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="balancer">
            {balancerLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-morphism rounded-xl p-6 animate-pulse">
                    <div className="h-24 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterPools(balancerPools)?.map((pool, index) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <PoolCard pool={pool} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="uniswap">
            {uniswapLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-morphism rounded-xl p-6 animate-pulse">
                    <div className="h-24 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterPools(uniswapPools)?.map((pool, index) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <PoolCard pool={pool} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <CreatePoolModal
        open={isCreatePoolModalOpen}
        onClose={() => setIsCreatePoolModalOpen(false)}
      />
    </div>
  );
}
