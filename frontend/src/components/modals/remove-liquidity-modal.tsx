"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Pool } from "@/types/schema";

interface RemoveLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  pool: Pool | null;
}

export default function RemoveLiquidityModal({ open, onClose, pool }: RemoveLiquidityModalProps) {
  const [percentage, setPercentage] = useState("100");
  const { toast } = useToast();

  const removeLiquidityMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/pools/${pool?.id}/remove-liquidity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to remove liquidity");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Liquidity Removed",
        description: "Liquidity was successfully removed from the pool.",
      });
      onClose();
      setPercentage("100");
    },
    onError: () => {
      toast({
        title: "Remove Liquidity Failed",
        description: "There was an error while removing liquidity.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveLiquidity = () => {
    if (!pool) return;
    removeLiquidityMutation.mutate({ percentage });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md rounded-xl overflow-hidden">
        <Card className="border-none shadow-none">
          <CardContent className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-center">
                Remove Liquidity from {pool?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Percentage to Remove (%)</Label>
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <Button
              onClick={handleRemoveLiquidity}
              disabled={removeLiquidityMutation.isPending}
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              {removeLiquidityMutation.isPending ? "Removing..." : "Remove Liquidity"}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
