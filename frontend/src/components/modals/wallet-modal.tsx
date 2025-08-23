import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export default function WalletModal({ open, onClose, onConnect }: WalletModalProps) {
  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      color: "text-orange-600",
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      color: "text-blue-600",
    },
    {
      name: "Coinbase Wallet",
      icon: "💰",
      color: "text-purple-600",
    },
  ];

  const handleWalletConnect = (walletName: string) => {
    // Mock wallet connection
    const mockAddress = "0x1234567890123456789012345678901234567890";
    setTimeout(() => {
      onConnect(mockAddress);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleWalletConnect(wallet.name)}
              variant="outline"
              className="w-full flex items-center justify-start space-x-4 p-4 border-gray-200 hover:bg-gray-50/50 transition-colors duration-200"
            >
              <span className="text-xl">{wallet.icon}</span>
              <span className="font-medium">{wallet.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
