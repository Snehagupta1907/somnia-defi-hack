import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowUpDown, Route, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SlippageModal from "@/components/modals/slippage-modal";
import ConfirmSwapModal from "@/components/modals/confirm-swap-modal";
import type { Token } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SwapForm() {
  const [fromToken, setFromToken] = useState("eth");
  const [toToken, setToToken] = useState("usdc");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: tokens, isLoading: tokensLoading } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
    queryFn: async () => {
      const response = await fetch("/api/tokens");
      if (!response.ok) throw new Error("Failed to fetch tokens");
      return response.json();
    },
  });

  const swapMutation = useMutation({
    mutationFn: async (swapData: any) => {
      const response = await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swapData),
      });
      if (!response.ok) throw new Error("Failed to create swap");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Swap Successful",
        description: "Your token swap has been completed successfully.",
      });
      setIsConfirmModalOpen(false);
      setFromAmount("");
      setToAmount("");
    },
    onError: () => {
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock exchange rate calculation
  const calculateRate = () => {
    if (fromToken === "eth" && toToken === "usdc") return 1932.98;
    if (fromToken === "usdc" && toToken === "eth") return 1 / 1932.98;
    return 1;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const rate = calculateRate();
      setToAmount((Number(value) * rate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleConfirmSwap = () => {
    if (!fromAmount || !toAmount) return;

    const swapData = {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      rate: calculateRate().toString(),
      slippage: slippage.toString(),
      networkFee: "12.50",
      userAddress: "0x1234567890123456789012345678901234567890",
      status: "pending",
    };

    swapMutation.mutate(swapData);
  };

  const selectedFromToken = tokens?.find(t => t.id === fromToken);
  const selectedToToken = tokens?.find(t => t.id === toToken);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-morphism rounded-2xl p-6 hover-lift"
      >
        {/* From Token */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-text-secondary mb-2">From</Label>
          <div className="relative">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-full bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="absolute right-2 top-2 h-8 w-32 bg-transparent border-none text-right text-lg font-medium focus-visible:ring-0"
            />
          </div>
          <div className="text-sm text-text-muted mt-1">Balance: 2.5 {selectedFromToken?.symbol}</div>
        </div>
        
        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            className="w-10 h-10 rounded-full glass-morphism hover:rotate-180 transition-transform duration-300"
          >
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
        
        {/* To Token */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-text-secondary mb-2">To</Label>
          <div className="relative">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-full bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="absolute right-2 top-2 h-8 w-32 bg-transparent border-none text-right text-lg font-medium focus-visible:ring-0"
            />
          </div>
          <div className="text-sm text-text-muted mt-1">Balance: 1,250.0 {selectedToToken?.symbol}</div>
        </div>
        
        {/* Swap Details */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Rate</span>
            <span className="text-text-primary">1 {selectedFromToken?.symbol} = {calculateRate().toFixed(2)} {selectedToToken?.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Slippage</span>
            <button
              onClick={() => setIsSlippageModalOpen(true)}
              className="text-color-sage hover:text-color-black flex items-center gap-1"
            >
              {slippage}% <Settings className="w-3 h-3" />
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Network Fee</span>
            <span className="text-text-primary">~$12.50</span>
          </div>
        </div>
        
        {/* Swap Button */}
        <Button
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={!fromAmount || !toAmount || swapMutation.isPending}
          className="w-full bg-color-sage text-white py-4 rounded-xl font-semibold text-lg hover:bg-color-black transition-colors duration-200"
        >
          {swapMutation.isPending ? "Processing..." : "Swap Tokens"}
        </Button>
      </motion.div>
      
      {/* Route Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6 mt-6"
      >
        <h3 className="font-semibold mb-4 flex items-center text-text-primary">
          <Route className="w-4 h-4 mr-2 text-color-sage" />
          Optimal Route
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-mint)' }}>
              <span className="text-color-black font-bold text-sm">{selectedFromToken?.symbol}</span>
            </div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-px relative" style={{ background: `linear-gradient(to right, var(--color-sage), var(--color-mint))` }}>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-sage)' }}></div>
            </div>
            <div className="text-xs text-center text-text-muted mt-1">Via Uniswap V3</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-mint)' }}>
              <span className="text-color-black font-bold text-sm">{selectedToToken?.symbol}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <SlippageModal
        open={isSlippageModalOpen}
        onClose={() => setIsSlippageModalOpen(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />

      <ConfirmSwapModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSwap}
        fromToken={selectedFromToken}
        toToken={selectedToToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        rate={calculateRate()}
        slippage={slippage}
        isLoading={swapMutation.isPending}
      />
    </>
  );
}
