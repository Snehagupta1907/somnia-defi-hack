import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletModal from "@/components/modals/wallet-modal";

export default function WalletConnect() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  if (isConnected) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="flex items-center space-x-2 glass-morphism hover-lift"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsWalletModalOpen(true)}
        className="gradient-bg text-white hover:opacity-90 transition-opacity duration-200 flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </Button>

      <WalletModal
        open={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
}
