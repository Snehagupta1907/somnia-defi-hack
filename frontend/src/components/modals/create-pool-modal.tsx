import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { tokens } from "@/balancer-config";

interface CreatePoolModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePoolModal({ open, onClose }: CreatePoolModalProps) {
  const [poolType, setPoolType] = useState<"balancer" | "uniswap-v3">("balancer");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [weightA, setWeightA] = useState("50");
  const [weightB, setWeightB] = useState("50");

  const { toast } = useToast();

  const resetForm = () => {
    setPoolType("balancer");
    setTokenA("");
    setTokenB("");
    setWeightA("50");
    setWeightB("50");
  };

  const handleCreatePool = () => {
    if (!tokenA || !tokenB) return;

    const selectedTokenA = tokens.find(t => t.id === tokenA);
    const selectedTokenB = tokens.find(t => t.id === tokenB);

    if (!selectedTokenA || !selectedTokenB) return;

    const poolTokens = [
      { address: selectedTokenA.address, weight: parseInt(weightA), symbol: selectedTokenA.symbol },
      { address: selectedTokenB.address, weight: parseInt(weightB), symbol: selectedTokenB.symbol }
    ];

    const poolData = {
      name: `${selectedTokenA.symbol}/${selectedTokenB.symbol}`,
      type: poolType,
      tokens: poolTokens,
      tvl: "0",
      apr: "0",
      volume24h: "0",
      fees24h: "0",
      isActive: true,
    };

    console.log("New Pool Created:", poolData);

    toast({
      title: "Pool Created",
      description: "Your liquidity pool has been created successfully.",
    });

    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 border rounded-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Pool</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Pool Type */}
          <div>
            <Label className="block text-sm mb-2">Pool Type</Label>
            <div className="flex gap-2">
              <Button
                variant={poolType === "balancer" ? "default" : "outline"}
                onClick={() => setPoolType("balancer")}
                className="flex items-center gap-2"
              >
                <Image
                  src="https://pbs.twimg.com/profile_images/1948110735919206400/k0A_9Gix_400x400.jpg"
                  alt="Balancer"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                Balancer
              </Button>
              <Button
                variant={poolType === "uniswap-v3" ? "default" : "outline"}
                onClick={() => setPoolType("uniswap-v3")}
                className="flex items-center gap-2"
              >
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/1200px-Uniswap_Logo.svg.png"
                  alt="Uniswap"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                Uniswap V3
              </Button>
            </div>
          </div>

          {/* Token A */}
          <div>
            <Label className="block text-sm mb-2">Token A</Label>
            <Select value={tokenA} onValueChange={setTokenA}>
              <SelectTrigger>
                {tokenA ? (
                  <div className="flex items-center gap-2">
                    <Image
                      src={tokens.find(t => t.id === tokenA)?.logoUrl || "/placeholder-token.png"}
                      alt={tokens.find(t => t.id === tokenA)?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokens.find(t => t.id === tokenA)?.symbol}</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select Token A" />
                )}
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <Image src={token.logoUrl || "/placeholder-token.png"} alt={token.symbol} width={20} height={20} className="w-5 h-5 rounded-full" />
                      <span>{token.symbol} - {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token B */}
          <div>
            <Label className="block text-sm mb-2">Token B</Label>
            <Select value={tokenB} onValueChange={setTokenB}>
              <SelectTrigger>
                {tokenB ? (
                  <div className="flex items-center gap-2">
                    <Image
                      src={tokens.find(t => t.id === tokenB)?.logoUrl || "/placeholder-token.png"}
                      alt={tokens.find(t => t.id === tokenB)?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokens.find(t => t.id === tokenB)?.symbol}</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select Token B" />
                )}
              </SelectTrigger>
              <SelectContent>
                {tokens.filter(t => t.id !== tokenA).map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <Image src={token.logoUrl || "/placeholder-token.png"} alt={token.symbol} width={20} height={20} className="w-5 h-5 rounded-full" />
                      <span>{token.symbol} - {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pool Weights */}
          {poolType === "balancer" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm mb-1">
                  {tokens.find(t => t.id === tokenA)?.symbol || "Token A"} Weight (%)
                </Label>
                <Input
                  type="number"
                  value={weightA}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setWeightA(e.target.value);
                    setWeightB((100 - value).toString());
                  }}
                  min="1"
                  max="99"
                />
              </div>
              <div>
                <Label className="block text-sm mb-1">
                  {tokens.find(t => t.id === tokenB)?.symbol || "Token B"} Weight (%)
                </Label>
                <Input
                  type="number"
                  value={weightB}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setWeightB(e.target.value);
                    setWeightA((100 - value).toString());
                  }}
                  min="1"
                  max="99"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleCreatePool}
            disabled={!tokenA || !tokenB}
            className="w-full"
          >
            Create Pool
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
