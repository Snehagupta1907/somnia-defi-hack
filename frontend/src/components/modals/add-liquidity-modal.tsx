import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { TokenAbi, config, PERMIT2_ABI } from "@/balancer-config";

import type { Pool } from "@/types/schema";

const MAX_UINT48 = BigInt("281474976710655");

interface AddLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  pool: Pool | null;
}

export default function AddLiquidityModal({ open, onClose, pool }: AddLiquidityModalProps) {
  const { address } = useAccount();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // batch ERC20 balances
  const erc20Contracts =
    pool?.tokens.map((token) => ({
      abi: TokenAbi,
      address: token.address as `0x${string}`,
      functionName: "balanceOf",
      args: [address!],
    })) ?? [];

  const { data: balancesData, isLoading } = useReadContracts({
    contracts: erc20Contracts,
    query: { enabled: !!address && !!pool },
  });

  const balances = useMemo(() => {
    if (!balancesData || !pool) return {};
    const map: Record<string, string> = {};
    pool.tokens.forEach((token, i) => {
      const value = balancesData[i]?.result as bigint | undefined;
      map[token.symbol] = value ? formatUnits(value, 18) : "0";
    });
    return map;
  }, [balancesData, pool]);

  // 🔑 handle liquidity
  const handleAddLiquidity = async () => {
    if (!pool) return;

    setLoading(true);

    try {
      for (const token of pool.tokens) {
        const entered = amounts[token.symbol] || "0";
        if (parseFloat(entered) <= 0) continue;

        const parsedAmount = parseUnits(entered, 18);

        // ✅ Step 1: approve ERC20 → Permit2
        await writeContractAsync({
          abi: TokenAbi,
          address: token.address as `0x${string}`,
          functionName: "approve",
          args: [config.permit2, parsedAmount],
        });

        // ✅ Step 2: approve Permit2 → Router
        await writeContractAsync({
          abi: PERMIT2_ABI,
          address: config.permit2 as `0x${string}`,
          functionName: "approve",
          args: [token.address, config.router, parsedAmount, MAX_UINT48],
        });
      }

      // ✅ Step 3: call Router.addLiquidityProportional
      const sortedTokens = pool.tokens.map((t) => t.address).sort();
      const initialBalances = sortedTokens.map((tokenAddr) => {
        const token = pool.tokens.find((t) => t.address === tokenAddr)!;
        return parseUnits(amounts[token.symbol] || "0", token.decimals);
      });

      await writeContractAsync({
        abi: [
          {
            inputs: [
              { type: "address", name: "pool" },
              { type: "uint256[]", name: "maxAmountsIn" },
              { type: "uint256", name: "minBptAmountOut" },
              { type: "bool", name: "wethIsEth" },
              { type: "bytes", name: "userData" },
            ],
            name: "addLiquidityProportional",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        address: config.router as `0x${string}`,
        functionName: "addLiquidityProportional",
        args: [pool.address, initialBalances, 0n, false, "0x"],
      });

      alert("✅ Liquidity added successfully!");
    } catch (err) {
      console.error("❌ Error adding liquidity", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md rounded-xl overflow-hidden">
        <Card className="border-none shadow-none">
          <CardContent className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-center">
                Add Liquidity to {pool?.name}
              </DialogTitle>
            </DialogHeader>

            {pool?.tokens.map((token) => {
              const balance = balances[token.symbol] || "0";
              const entered = amounts[token.symbol] || "";
              const isOverflow = parseFloat(entered || "0") > parseFloat(balance);

              return (
                <div key={token.address} className="space-y-1">
                  <Label className="text-sm font-medium">{token.symbol} Amount</Label>
                  <Input
                    type="number"
                    placeholder={`Enter ${token.symbol} amount`}
                    value={entered}
                    onChange={(e) =>
                      setAmounts((prev) => ({ ...prev, [token.symbol]: e.target.value }))
                    }
                    className={isOverflow ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      Balance: {isLoading ? "Loading..." : Number(balance).toFixed(2)} {token.symbol}
                    </span>
                    {isOverflow && <span className="text-red-600">Exceeds balance!</span>}
                  </div>
                </div>
              );
            })}

            <Button
              onClick={handleAddLiquidity}
              disabled={loading || isLoading}
              className="w-full"
            >
              {loading ? "Adding..." : "Add Liquidity"}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
