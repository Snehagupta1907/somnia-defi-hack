"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { TokenAbi } from "@/balancer-config";

import type { Pool } from "@/types/schema";

interface AddLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  pool: Pool | null;
}

export default function AddLiquidityModal({ open, onClose, pool }: AddLiquidityModalProps) {
  const { address } = useAccount();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // prepare batch contracts for all tokens in pool
  const erc20Contracts =
    pool?.tokens.map((token) => ({
      abi: TokenAbi,
      address: token.address as `0x${string}`,
      functionName: "balanceOf",
      args: [address!],
    })) ?? [];

  // batch balances
  const { data: balancesData, isLoading } = useReadContracts({
    contracts: erc20Contracts,
    query: { enabled: !!address && !!pool },
  });

  // map balances to { symbol: balance }
  const balances = useMemo(() => {
    if (!balancesData || !pool) return {};
    const map: Record<string, string> = {};
    pool.tokens.forEach((token, i) => {
      const value = balancesData[i]?.result as bigint | undefined;
      map[token.symbol] = value ? formatUnits(value, 18) : "0";
    });
    return map;
  }, [balancesData, pool]);

  const handleAddLiquidity = async () => {
    if (!pool) return;

    for (const token of pool.tokens) {
      const entered = parseFloat(amounts[token.symbol] || "0");
      const balance = parseFloat(balances[token.symbol] || "0");

      if (entered > balance) {
        alert(`You don’t have enough ${token.symbol}. Balance: ${balance}`);
        return;
      }
    }

    setLoading(true);
    try {
      // TODO: contract call for addLiquidity
      console.log("Adding liquidity:", amounts);
    } catch (err) {
      console.error("Error adding liquidity", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Liquidity to {pool?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {pool?.tokens.map((token, idx) => {
            const balance = balances[token.symbol] || "0";
            const entered = amounts[token.symbol] || "";
            const isOverflow = parseFloat(entered || "0") > parseFloat(balance);

            return (
              <div key={token.address}>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  {token.symbol} Amount
                </Label>
                <Input
                  type="number"
                  placeholder={`Enter ${token.symbol} amount`}
                  value={entered}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [token.symbol]: e.target.value }))
                  }
                  className={`bg-white/80 backdrop-blur border ${
                    isOverflow ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">
                    Balance: {isLoading ? "Loading..." : Number(balance).toFixed(2)} {token.symbol}
                  </span>
                  {isOverflow && (
                    <span className="text-red-600">Exceeds balance!</span>
                  )}
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleAddLiquidity}
            disabled={loading || isLoading}
            className="w-full gradient-bg text-white py-3 rounded-xl"
          >
            {loading ? "Adding..." : "Add Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
