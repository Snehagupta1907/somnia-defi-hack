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
import { useAccount, useBalance, useWriteContract } from "wagmi"; // Import wagmi hooks
import { config, PERMIT2_ABI, SWAP_CONFIG, TokenAbi, RouterAbi, getDeadline } from "@/balancer-config";
import { parseUnits } from "viem";
const tokens: Token[] = [
  { id: "somnia_native", symbol: "STT", name: "Somnia Native Token", address: "0x0000000000000000000000000000000000000000", decimals: 18, image: "https://somnia.exchange/stt-logo.png" },
  { id: "usdtg", symbol: "USDT Ginger", name: "USDT Ginger", address: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76", decimals: 18, image: "https://raw.githubusercontent.com/Ensar2318/v2-sdk/refs/heads/main/images/0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76.png" },
  { id: "wstt", symbol: "WSTT", name: "Wrapped STT", address: "0xF22eF0085f6511f70b01a68F360dCc56261F768a", decimals: 18, image: "https://somnia.exchange/stt-logo.png" },
  { id: "pumpaz", symbol: "PUMPAZ", name: "PumpAz", address: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58", decimals: 18, image: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58.jpg" },
  { id: "nia", symbol: "NIA", name: "Nia Token", address: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311", decimals: 18, image: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xF2F773753cEbEFaF9b68b841d80C083b18C69311.png" },
  { id: "check", symbol: "CHECK", name: "Check Token", address: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8", decimals: 18, image: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8.png" },
];

export default function SwapForm() {
  const [fromToken, setFromToken] = useState("wstt");
  const [toToken, setToToken] = useState("usdtg");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [showUniswap, setShowUniswap] = useState(true);
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const { address } = useAccount();
  const { data: userNativeBalance } = useBalance({
    address,
  });

  const { data: fromTokenBalance } = useBalance({
    address,
    token: fromToken === "somnia_native" ? undefined : tokens.find(t => t.id === fromToken)?.address,
    watch: true,
  });

  const { data: toTokenBalance } = useBalance({
    address,
    token: toToken === "somnia_native" ? undefined : tokens.find(t => t.id === toToken)?.address,
    watch: true,
  });

  // Render conditionally instead of returning early



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

  async function approveToken(tokenIn: string, amount: string) {
    // Step 1: Token approve → Permit2
    await writeContractAsync({
      abi: TokenAbi,
      address: tokenIn as `0x${string}`,
      functionName: "approve",
      args: [config?.permit2, parseUnits(amount, 18)]
    });
  
    // Step 2: Permit2 approve → Router
    await writeContractAsync({
      abi: PERMIT2_ABI,
      address: config.permit2 as `0x${string}`,
      functionName: "approve",
      args: [
        tokenIn,
        config.router,
        parseUnits(amount, 18),
        BigInt("281474976710655") // MAX_UINT48
      ]
    });
  }
  async function executeSwap(tokenIn: string, tokenOut: string, amount: string) {
    const minAmountOut = 0; // TODO: calculate based on slippage
    const deadline = getDeadline(1800);
  
    const tx = await writeContractAsync({
      abi: RouterAbi,
      address: config.router as `0x${string}`,
      functionName: "swapSingleTokenExactIn",
      args: [
        config.somniaWeightedPool,
        tokenIn,
        tokenOut,
        parseUnits(amount, 18),
        minAmountOut,
        deadline,
        false, // wethIsEth
        "0x"
      ]
    });
  
    return tx;
  }
  
  const handleConfirmSwap = async () => {
    if (!fromAmount || !toAmount) return;
  
    const swapData = {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      rate: calculateRate().toString(),
      slippage: slippage.toString(),
      networkFee: "12.50",
      userAddress: address,
      status: "pending",
    };
    let fromTokenInfo = tokens.find(t => t.id === fromToken);
    let toTokenInfo = tokens.find(t => t.id === toToken);
    try {
      await approveToken(fromTokenInfo.address, swapData.fromAmount);
      const txHash = await executeSwap(
        fromTokenInfo.address,
        toTokenInfo.address,
        swapData.fromAmount
      );
  
      console.log("✅ Swap sent:", txHash);
    } catch (err) {
      console.error("❌ Swap failed:", err);
    }
  };

  const selectedFromToken = tokens.find(t => t.id === fromToken);
  const selectedToToken = tokens.find(t => t.id === toToken);
  if (!address) {
    return (
      <div className="text-red-500">
        Please connect your wallet to swap tokens.
      </div>
    );
  }
  if (!selectedFromToken || !selectedToToken) {
    return (
      <div className="text-red-500">
        Invalid token selection. Please choose valid tokens.
      </div>
    );
  }

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
                    <div className="flex items-center gap-2">
                      <img
                        src={token.image}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{token.symbol} - {token.name}</span>
                    </div>
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
          <div className="text-sm text-text-muted mt-1">
            Balance: {fromToken === "somnia_native"
              ? (userNativeBalance?.formatted ? Number(userNativeBalance.formatted).toFixed(2) : "0.00")
              : (fromTokenBalance?.formatted ? Number(fromTokenBalance.formatted).toFixed(2) : "0.00")} {selectedFromToken?.symbol}
          </div>
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
                    <div className="flex items-center gap-2">
                      <img
                        src={token.image}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{token.symbol} - {token.name}</span>
                    </div>
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
          <div className="text-sm text-text-muted mt-1">
            Balance: {toToken === "somnia_native"
              ? (userNativeBalance?.formatted ? Number(userNativeBalance.formatted).toFixed(2) : "0.00")
              : (toTokenBalance?.formatted ? Number(toTokenBalance.formatted).toFixed(2) : "0.00")} {selectedToToken?.symbol}
          </div>
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
          disabled={!fromAmount || !toAmount}
          className="w-full  text-white py-4 rounded-xl font-semibold text-lg hover:bg-color-black transition-colors duration-200"
        >
          Swap Tokens
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
        {/* <div className="flex mb-4">
        <label className="flex items-center gap-2">
          
          <motion.div
            className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
              showUniswap ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => setShowUniswap(!showUniswap)}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-md"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                transform: showUniswap ? "translateX(24px)" : "translateX(0px)",
              }}
            />
          </motion.div>
        </label>
      </div> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-4 mt-6"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200">
            <img
              src={selectedFromToken?.image}
              alt={selectedFromToken?.symbol}
              className="w-12 h-12 rounded-full"
            />
          </div>
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200">
            {showUniswap ? (
              <img
                src="https://pbs.twimg.com/profile_images/1948110735919206400/k0A_9Gix_400x400.jpg"
                alt="Uniswap"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">Balance</span>
            )}
          </div>
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200">
            <img
              src={selectedToToken?.image}
              alt={selectedToToken?.symbol}
              className="w-12 h-12 rounded-full"
            />
          </div>
        </motion.div>
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