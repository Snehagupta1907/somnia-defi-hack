import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@shared/schema";

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
  const queryClient = useQueryClient();

  const { data: tokens } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
  });

  const createPoolMutation = useMutation({
    mutationFn: async (poolData: any) => {
      const response = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poolData),
      });
      if (!response.ok) throw new Error("Failed to create pool");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pool Created",
        description: "Your liquidity pool has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pools"] });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Pool Creation Failed",
        description: "There was an error creating your pool. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPoolType("balancer");
    setTokenA("");
    setTokenB("");
    setWeightA("50");
    setWeightB("50");
  };

  const handleCreatePool = () => {
    if (!tokenA || !tokenB) return;

    const selectedTokenA = tokens?.find(t => t.id === tokenA);
    const selectedTokenB = tokens?.find(t => t.id === tokenB);

    if (!selectedTokenA || !selectedTokenB) return;

    const poolTokens = [
      { 
        address: selectedTokenA.address, 
        weight: parseInt(weightA), 
        symbol: selectedTokenA.symbol 
      },
      { 
        address: selectedTokenB.address, 
        weight: parseInt(weightB), 
        symbol: selectedTokenB.symbol 
      }
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

    createPoolMutation.mutate(poolData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Pool</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Pool Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Pool Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={poolType === "balancer" ? "default" : "outline"}
                onClick={() => setPoolType("balancer")}
                className={`p-4 h-auto ${
                  poolType === "balancer" 
                    ? "border-2 border-blue-300 bg-blue-50" 
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <h4 className={`font-semibold ${poolType === "balancer" ? "text-blue-700" : ""}`}>
                    Balancer Pool
                  </h4>
                  <p className={`text-sm mt-1 ${poolType === "balancer" ? "text-blue-600" : "text-gray-600"}`}>
                    Weighted multi-token pools
                  </p>
                </div>
              </Button>
              <Button
                variant={poolType === "uniswap-v3" ? "default" : "outline"}
                onClick={() => setPoolType("uniswap-v3")}
                className={`p-4 h-auto ${
                  poolType === "uniswap-v3" 
                    ? "border-2 border-blue-300 bg-blue-50" 
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <h4 className={`font-semibold ${poolType === "uniswap-v3" ? "text-blue-700" : ""}`}>
                    Uniswap V3 Pool
                  </h4>
                  <p className={`text-sm mt-1 ${poolType === "uniswap-v3" ? "text-blue-600" : "text-gray-600"}`}>
                    Concentrated liquidity
                  </p>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Token Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Token A</Label>
              <Select value={tokenA} onValueChange={setTokenA}>
                <SelectTrigger className="bg-white/80 backdrop-blur border-gray-200">
                  <SelectValue placeholder="Select Token A" />
                </SelectTrigger>
                <SelectContent>
                  {tokens?.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Token B</Label>
              <Select value={tokenB} onValueChange={setTokenB}>
                <SelectTrigger className="bg-white/80 backdrop-blur border-gray-200">
                  <SelectValue placeholder="Select Token B" />
                </SelectTrigger>
                <SelectContent>
                  {tokens?.filter(token => token.id !== tokenA).map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Pool Weights (for Balancer pools) */}
          {poolType === "balancer" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Pool Weights</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">
                    {tokens?.find(t => t.id === tokenA)?.symbol || "Token A"} Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={weightA}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setWeightA(e.target.value);
                      setWeightB((100 - value).toString());
                    }}
                    className="bg-white/80 backdrop-blur border-gray-200"
                    min="1"
                    max="99"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">
                    {tokens?.find(t => t.id === tokenB)?.symbol || "Token B"} Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={weightB}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setWeightB(e.target.value);
                      setWeightA((100 - value).toString());
                    }}
                    className="bg-white/80 backdrop-blur border-gray-200"
                    min="1"
                    max="99"
                  />
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleCreatePool}
            disabled={!tokenA || !tokenB || createPoolMutation.isPending}
            className="w-full gradient-bg text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity duration-200"
          >
            {createPoolMutation.isPending ? "Creating..." : "Create Pool"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
