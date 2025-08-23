import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SlippageModalProps {
  open: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export default function SlippageModal({ open, onClose, slippage, onSlippageChange }: SlippageModalProps) {
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());
  const [selectedPreset, setSelectedPreset] = useState(slippage);

  const presetOptions = [0.1, 0.5, 1.0];

  const handlePresetSelect = (value: number) => {
    setSelectedPreset(value);
    setCustomSlippage(value.toString());
  };

  const handleSave = () => {
    const finalSlippage = parseFloat(customSlippage);
    if (!isNaN(finalSlippage) && finalSlippage > 0 && finalSlippage <= 50) {
      onSlippageChange(finalSlippage);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Slippage Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="flex space-x-2">
            {presetOptions.map((option) => (
              <Button
                key={option}
                variant={selectedPreset === option ? "default" : "outline"}
                onClick={() => handlePresetSelect(option)}
                className={`px-4 py-2 ${
                  selectedPreset === option 
                    ? "bg-blue-100 border-blue-300 text-blue-700" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option}%
              </Button>
            ))}
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Slippage
            </Label>
            <Input
              type="number"
              placeholder="0.50"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value);
                setSelectedPreset(-1); // Deselect presets when custom value is entered
              }}
              className="bg-white/80 backdrop-blur border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              step="0.1"
              min="0"
              max="50"
            />
          </div>
          
          <Button
            onClick={handleSave}
            className="w-full gradient-bg text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
