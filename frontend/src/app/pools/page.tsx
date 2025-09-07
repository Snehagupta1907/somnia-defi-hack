'use client'

import { use, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Link2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePoolModal from "@/components/modals/create-pool-modal";
import { config, TokenAbi } from "@/balancer-config";
import { uniswapConfig } from "@/uniswap-config";
import AddLiquidityModal from "@/components/modals/add-liquidity-modal";
import RemoveLiquidityModal from "@/components/modals/remove-liquidity-modal";
import { useAccount, useReadContracts } from "wagmi";

interface Pool {
  id: string;
  name: string;
  type: string;
  tokens: Array<{ address: string; weight: number; symbol: string }>;
  tvl?: number;
  apr?: string;
  volume24h?: string;
  fees24h?: string;
  isActive?: boolean;
  createdAt?: Date;
  bptBalance?: number;
}

export default function Pools() {
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [sortBy, setSortBy] = useState("tvl");
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false);
  const [isRemoveLiquidityOpen, setIsRemoveLiquidityOpen] = useState(false);
  const { address } = useAccount();
  // Use pools from config


  const poolContracts = config.pools.map((pool) => ({
    abi: TokenAbi,
    address: pool.address as `0x${string}`,
    functionName: "balanceOf",
    args: [address!],
  }));

  const poolTvlContracts = config.pools.map((pool) => ({
    abi: TokenAbi,
    address: pool.address as `0x${string}`,
    functionName: "totalSupply"
  }));

  const { data: poolTvlBalances, isLoading: pooltvlLoading } = useReadContracts({
    contracts: poolTvlContracts,
  });

  const { data: poolBPTBalances, isLoading } = useReadContracts({
    contracts: poolContracts,
  });

  const balancerPools: Pool[] = config.pools.map((pool, index) => ({
    id: pool.id,
    name: pool.config.name,
    address: pool.address,
    type: "balancer",
    tokens: Object.entries(pool.tokens).map(([symbol, address]) => ({
      address,
      symbol,
      weight: 50, // placeholder
    })),
    tvl: poolTvlBalances?.[index]?.result
      ? Number(poolTvlBalances[index].result) / 1e18 // assuming 18 decimals
      : 0,
    apr: "0",
    volume24h: "0",
    fees24h: "0",
    isActive: pool.poolInitialized,
    createdAt: new Date(),
    // 🟢 Attach balance from wagmi response
    bptBalance: poolBPTBalances?.[index]?.result
      ? Number(poolBPTBalances[index].result) / 1e18 // assuming 18 decimals
      : 0,
  }));

  const uniswapPools: Pool[] = Object.entries(uniswapConfig.uniswap.pools).map(
    ([poolName, poolData]) => {
      const [token0Symbol, token1Symbol] = poolName.split("-");
      const tokens = [
        { address: poolData.token0, symbol: token0Symbol.toUpperCase(), weight: 50 },
        { address: poolData.token1, symbol: token1Symbol.toUpperCase(), weight: 50 },
      ];

      return {
        id: poolName,
        name: poolName,
        type: "uniswap",
        tokens,
        tvl: 0, // optional, can be updated via on-chain calls
        apr: "0",
        volume24h: "0",
        fees24h: "0",
        isActive: true,
        createdAt: new Date(poolData.timestamp),
        bptBalance: 0,
        slot0: poolData.slot0,
      };
    }
  );


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

    // Chain filter
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

  const renderTable = (pools: Pool[] | undefined, label: string) => {
    const filtered = filterAndSortPools(pools);
    if (!filtered.length) {
      return (
        <div className="text-center py-8 text-gray-400">
          No {label} pools found
        </div>
      );
    }

    return (
      <motion.div
        layout
        className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm"
      >
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">BPT Shares</th>
              <th className="px-4 py-3">TVL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
              <th className="px-4 py-3">Deployment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((pool, i) => (
              <motion.tr
                key={pool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">{pool.name}</td>
                <td className="px-4 py-3">
                  {pool.tokens.map(t => t.symbol).join(", ")}
                </td>
                <td className="px-4 py-3">
                  {pool.bptBalance?.toFixed(1)} BPT
                </td>
                <td className="px-4 py-3">
                  {pool.tvl?.toFixed(1)} BPT
                </td>
                <td className="px-4 py-3">
                  {pool.isActive ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-600 font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => { setSelectedPool(pool); setIsAddLiquidityOpen(true); }}
                    className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  >
                    <ArrowUp size={20} />

                  </button>
                  <button
                    onClick={() => { setSelectedPool(pool); setIsRemoveLiquidityOpen(true); }}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    <ArrowDown size={20} />
                  </button>
                </td>
                <td className="px-4 py-3 text-blue-500 cursor-pointer">
                  <a
                    href={`https://shannon-explorer.somnia.network/address/${pool.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link2 size={20} />
                  </a>
                </td>

              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto font-mono px-4 py-8 mt-[10%]">
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
          className="flex gap-4"
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
        className="rounded-xl p-4 mb-8"
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
          <TabsTrigger value="uniswap">Uniswap</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderTable(balancerPools, "Balancer")}
          <div className="mt-6">{renderTable(uniswapPools, "Uniswap")}</div>
        </TabsContent>

        <TabsContent value="balancer">
          {renderTable(balancerPools, "Balancer")}
        </TabsContent>

        <TabsContent value="uniswap">
          {renderTable(uniswapPools, "Uniswap")}
        </TabsContent>
      </Tabs>

      {/* Create Pool Modal */}
      <CreatePoolModal
        open={isCreatePoolModalOpen}
        onClose={() => setIsCreatePoolModalOpen(false)}
      />
      <AddLiquidityModal
        open={isAddLiquidityOpen}
        onClose={() => setIsAddLiquidityOpen(false)}
        pool={selectedPool}
      />
      <RemoveLiquidityModal
        open={isRemoveLiquidityOpen}
        onClose={() => setIsRemoveLiquidityOpen(false)}
        pool={selectedPool}
      />
    </div>
  );
}
