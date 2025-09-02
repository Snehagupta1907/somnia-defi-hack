/* eslint-disable @next/next/no-img-element */
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
import type { Token } from "@/types/schema";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { config, PERMIT2_ABI, TokenAbi, RouterAbi, getDeadline } from "@/balancer-config";
import { parseUnits } from "viem";
import { Switch } from "./ui/switch";

const tokens: Token[] = [
  { id: "somnia_native", symbol: "STT", name: "Somnia Native Token", address: "0x0000000000000000000000000000000000000000", decimals: "18", logoUrl: "https://somnia.exchange/stt-logo.png", createdAt: new Date() },
  { id: "usdtg", symbol: "USDT Ginger", name: "USDT Ginger", address: "0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ensar2318/v2-sdk/refs/heads/main/images/0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76.png", createdAt: new Date() },
  { id: "wstt", symbol: "WSTT", name: "Wrapped STT", address: "0xF22eF0085f6511f70b01a68F360dCc56261F768a", decimals: "18", logoUrl: "https://somnia.exchange/stt-logo.png", createdAt: new Date() },
  { id: "pumpaz", symbol: "PUMPAZ", name: "PumpAz", address: "0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0x4eF3C7cd01a7d2FB9E34d6116DdcB9578E8f5d58.jpg", createdAt: new Date() },
  { id: "nia", symbol: "NIA", name: "Nia Token", address: "0xF2F773753cEbEFaF9b68b841d80C083b18C69311", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xF2F773753cEbEFaF9b68b841d80C083b18C69311.png", createdAt: new Date() },
  { id: "check", symbol: "CHECK", name: "Check Token", address: "0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8", decimals: "18", logoUrl: "https://raw.githubusercontent.com/Ginger3Labs/gingerswap-v2sdk/refs/heads/main/images/0xA356306eEd1Ec9b1b9cdAed37bb7715787ae08A8.png", createdAt: new Date() },
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
  const [routeProvider, setRouteProvider] = useState<"uniswap" | "balancer">(
    "uniswap"
  );

  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const { address } = useAccount();

  const { data: userNativeBalance } = useBalance({ address });
  const { data: fromTokenBalance } = useBalance({
    address,
    token: fromToken === "somnia_native" ? undefined : (tokens.find(t => t.id === fromToken)?.address as `0x${string}` | undefined)
  });
  const { data: toTokenBalance } = useBalance({
    address,
    token: toToken === "somnia_native" ? undefined : (tokens.find(t => t.id === toToken)?.address as `0x${string}` | undefined)
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
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  async function approveToken(tokenIn: string, amount: string) {
    await writeContractAsync({
      abi: TokenAbi,
      address: tokenIn as `0x${string}`,
      functionName: "approve",
      args: [config?.permit2, parseUnits(amount, 18)],
    });
    await writeContractAsync({
      abi: PERMIT2_ABI,
      address: config.permit2 as `0x${string}`,
      functionName: "approve",
      args: [tokenIn, config.router, parseUnits(amount, 18), BigInt("281474976710655")],
    });
  }

  async function executeSwap(tokenIn: string, tokenOut: string, amount: string) {
    const minAmountOut = 0;
    const deadline = getDeadline(1800);
    return await writeContractAsync({
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
        false,
        "0x",
      ],
    });
  }

  const handleConfirmSwap = async () => {
    if (!fromAmount || !toAmount) return;
    let fromTokenInfo = tokens.find(t => t.id === fromToken);
    let toTokenInfo = tokens.find(t => t.id === toToken);
    try {
      if (fromTokenInfo?.address && toTokenInfo?.address) {
      await approveToken(fromTokenInfo?.address, fromAmount);
      const txHash = await executeSwap(fromTokenInfo?.address, toTokenInfo?.address, fromAmount);
      console.log("✅ Swap sent:", txHash);
      }
    } catch (err) {
      console.error("❌ Swap failed:", err);
    }
  };

  const selectedFromToken = tokens.find(t => t.id === fromToken);
  const selectedToToken = tokens.find(t => t.id === toToken);

  if (!address) {
    return <div className="text-red-500">Please connect your wallet to swap tokens.</div>;
  }
  if (!selectedFromToken || !selectedToToken) {
    return <div className="text-red-500">Invalid token selection. Please choose valid tokens.</div>;
  }

  return (
    <>
      {/* SWAP CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl 
                   shadow-lg hover:shadow-2xl border border-white/30 transition-all duration-300 hover:-translate-y-1"
      >
        {/* FROM TOKEN */}
        <div className="mb-4">
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">From</Label>
          <div className="relative flex items-center rounded-xl border border-gray-200 bg-white/70 
                          backdrop-blur px-3 py-2 shadow-inner">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-44 border-none bg-transparent focus:ring-0 font-medium">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {tokens.map(token => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <img src={token.logoUrl || ""} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      <span className="font-medium">{token.symbol}</span>
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
              className="ml-auto w-32 bg-transparent border-none text-right text-3xl font-semibold focus:ring-0"
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Balance: {fromToken === "somnia_native"
              ? (userNativeBalance?.formatted ? Number(userNativeBalance.formatted).toFixed(2) : "0.00")
              : (fromTokenBalance?.formatted ? Number(fromTokenBalance.formatted).toFixed(2) : "0.00")}{" "}
            {selectedFromToken?.symbol}
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="flex justify-center my-5">
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={handleSwapTokens}
            className="w-12 h-12 flex items-center justify-center rounded-full 
                       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                       text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ArrowUpDown className="w-5 h-5" />
          </motion.button>
        </div>

        {/* TO TOKEN */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">To</Label>
          <div className="relative flex items-center rounded-xl border border-gray-200 bg-white/70 
                          backdrop-blur px-3 py-2 shadow-inner">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-44 border-none bg-transparent focus:ring-0 font-medium">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {tokens.map(token => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <img src={token.logoUrl || ""} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      <span className="font-medium">{token.symbol}</span>
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
              className="ml-auto w-32 bg-transparent border-none text-right text-3xl font-semibold focus:ring-0"
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Balance: {toToken === "somnia_native"
              ? (userNativeBalance?.formatted ? Number(userNativeBalance.formatted).toFixed(2) : "0.00")
              : (toTokenBalance?.formatted ? Number(toTokenBalance.formatted).toFixed(2) : "0.00")}{" "}
            {selectedToToken?.symbol}
          </div>
        </div>

        {/* DETAILS */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Rate</span>
            <span className="font-medium text-gray-800">
              1 {selectedFromToken?.symbol} = {calculateRate().toFixed(2)} {selectedToToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Slippage</span>
            <button
              onClick={() => setIsSlippageModalOpen(true)}
              className="flex items-center gap-1 font-medium text-purple-600 hover:text-purple-800"
            >
              {slippage}% <Settings className="w-3 h-3" />
            </button>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Network Fee</span>
            <span className="font-medium text-gray-800">~$12.50</span>
          </div>
        </div>

        {/* CONFIRM BUTTON */}
        <Button
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={!fromAmount || !toAmount}
          className="w-full py-4 rounded-xl font-semibold text-lg 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                     text-white shadow-md hover:shadow-lg hover:scale-[1.02] 
                     transition-all duration-300"
        >
          Swap Tokens
        </Button>
      </motion.div>

      {/* OPTIMAL ROUTE CARD */}


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-3xl p-6 mt-6 bg-gradient-to-br from-white/60 to-white/20 
                   backdrop-blur-xl shadow-lg hover:shadow-2xl border border-white/30 
                   transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center text-gray-800">
            <Route className="w-4 h-4 mr-2 text-purple-600" />
            Optimal Route
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Balancer</span>
            <Switch
              checked={routeProvider === "uniswap"}
              onCheckedChange={(checked) =>
                setRouteProvider(checked ? "uniswap" : "balancer")
              }
            />
            <span className="text-xs text-gray-600">Uniswap</span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-4 mt-6"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 
                          backdrop-blur border border-gray-200 shadow-inner">
            <img src={selectedFromToken?.logoUrl || ""} alt={selectedFromToken?.symbol} className="w-12 h-12 rounded-full" />
          </div>
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 
                        backdrop-blur border border-gray-200 shadow-inner">
            {routeProvider === "uniswap" ? (
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/1200px-Uniswap_Logo.svg.png"
                alt="Uniswap"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <img
                src="https://pbs.twimg.com/profile_images/1948110735919206400/k0A_9Gix_400x400.jpg"
                alt="Balancer"
                className="w-12 h-12 rounded-full"
              />
            )}
          </div>
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80 
                          backdrop-blur border border-gray-200 shadow-inner">
            <img src={selectedToToken?.logoUrl || ""} alt={selectedToToken?.symbol} className="w-12 h-12 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* MODALS */}
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
