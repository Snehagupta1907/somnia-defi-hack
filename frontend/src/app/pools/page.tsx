'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  const [selectedChain, setSelectedChain] = useState("all");
  const [sortBy, setSortBy] = useState("tvl");

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

  const filterAndSortPools = (pools: Pool[] | undefined) => {
    if (!pools) return [];
    let filtered = pools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(pool =>
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.tokens.some(token =>
          token.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Chain filter (placeholder, adapt when pools have chain field)
    if (selectedChain !== "all") {
      filtered = filtered.filter(pool => pool.type.toLowerCase().includes(selectedChain));
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "tvl") return Number(b.tvl) - Number(a.tvl);
      if (sortBy === "apr") return Number(b.apr) - Number(a.apr);
      if (sortBy === "volume") return Number(b.volume24h) - Number(a.volume24h);
      return 0;
    });

    return filtered;
  };

  const renderPools = (pools: Pool[] | undefined, loading: boolean, label: string) => {
    if (loading) {
      return <div className="text-center py-8 text-gray-500">Loading {label} pools...</div>;
    }

    const filtered = filterAndSortPools(pools);
    if (!filtered.length) {
      return <div className="text-center py-8 text-gray-400">No pools found</div>;
    }

    return (
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filtered.map((pool, i) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PoolCard pool={pool} />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-[10%]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-text-primary"
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
      
      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-morphism rounded-xl p-4 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Chain Filter */}
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="w-[160px] bg-white/80 border-gray-200">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="ethereum">Somnia Testnet</SelectItem>
              <SelectItem value="polygon">Somnia Mainnet</SelectItem>
       
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-white/80 border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tvl">TVL</SelectItem>
              <SelectItem value="apr">APR</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
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

        <TabsContent value="all">
          {renderPools(balancerPools, balancerLoading, "Balancer")}
          {renderPools(uniswapPools, uniswapLoading, "Uniswap")}
        </TabsContent>

        <TabsContent value="balancer">
          {renderPools(balancerPools, balancerLoading, "Balancer")}
        </TabsContent>

        <TabsContent value="uniswap">
          {renderPools(uniswapPools, uniswapLoading, "Uniswap")}
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
