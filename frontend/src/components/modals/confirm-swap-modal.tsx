import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import type { Token } from "@shared/schema";

interface ConfirmSwapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken?: Token;
  toToken?: Token;
  fromAmount: string;
  toAmount: string;
  rate: number;
  slippage: number;
  isLoading: boolean;
}

export default function ConfirmSwapModal({
  open,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  rate,
  slippage,
  isLoading,
}: ConfirmSwapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Confirm Swap</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">From</span>
            <span className="font-semibold">
              {fromAmount} {fromToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">To</span>
            <span className="font-semibold">
              {parseFloat(toAmount).toFixed(4)} {toToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rate</span>
            <span>
              1 {fromToken?.symbol} = {rate.toFixed(2)} {toToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Slippage</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network Fee</span>
            <span>~$12.50</span>
          </div>
        </div>
        
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full gradient-bg text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm Swap"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
