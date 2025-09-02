import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


interface ConfirmSwapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken?: any;
  toToken?: any;
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
      <DialogContent
        className="max-w-md rounded-3xl p-6 bg-gradient-to-br from-white/70 to-white/30
                   backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-gray-800 text-center">
            Confirm Swap
          </DialogTitle>
        </DialogHeader>

        {/* Swap details */}
        <div className="space-y-4 mt-6 mb-8 text-sm">
          {/* From */}
          <div className="flex justify-between items-center border-b pb-2 border-gray-200/40">
            <span className="text-gray-600">From</span>
            <span className="font-semibold flex items-center gap-2">
              {fromAmount} {fromToken?.symbol}
              {fromToken?.logoUrl && (
                <img
                  src={fromToken.logoUrl}
                  alt={fromToken.symbol}
                  className="w-5 h-5 rounded-full shadow"
                />
              )}
            </span>
          </div>

          {/* To */}
          <div className="flex justify-between items-center border-b pb-2 border-gray-200/40">
            <span className="text-gray-600">To</span>
            <span className="font-semibold flex items-center gap-2">
              {parseFloat(toAmount).toFixed(4)} {toToken?.symbol}
              {toToken?.logoUrl && (
                <img
                  src={toToken.logoUrl}
                  alt={toToken.symbol}
                  className="w-5 h-5 rounded-full shadow"
                />
              )}
            </span>
          </div>

          {/* Rate */}
          <div className="flex justify-between items-center border-b pb-2 border-gray-200/40">
            <span className="text-gray-600">Rate</span>
            <span className="font-medium text-gray-800">
              1 {fromToken?.symbol} = {rate.toFixed(2)} {toToken?.symbol}
            </span>
          </div>

          {/* Slippage */}
          <div className="flex justify-between items-center border-b pb-2 border-gray-200/40">
            <span className="text-gray-600">Slippage</span>
            <span className="font-medium text-purple-600">{slippage}%</span>
          </div>

          {/* Fee */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network Fee</span>
            <span className="font-medium text-gray-800">~$12.50</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-semibold text-lg 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                     text-white shadow-md hover:shadow-lg hover:scale-[1.02] 
                     transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
