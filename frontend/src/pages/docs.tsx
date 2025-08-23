import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function Docs() {
  const sidebarItems = [
    { id: "getting-started", label: "Getting Started", active: true },
    { id: "token-swaps", label: "Token Swaps" },
    { id: "liquidity-pools", label: "Liquidity Pools" },
    { id: "balancer-pools", label: "Balancer Pools", nested: true },
    { id: "uniswap-pools", label: "Uniswap V3 Pools", nested: true },
    { id: "analytics", label: "Analytics" },
    { id: "fees", label: "Fees & Rewards" },
    { id: "api", label: "API Reference" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-64 glass-morphism rounded-xl p-6 h-fit sticky top-24"
        >
          <h3 className="font-semibold mb-4 text-text-primary">Documentation</h3>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block py-2 px-3 rounded-lg transition-colors duration-200 ${
                  item.nested ? "ml-4 text-sm" : ""
                } ${
                  item.active
                    ? "text-color-sage bg-white/30"
                    : "hover:bg-white/50 text-text-secondary"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </motion.div>
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <div className="glass-morphism rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Getting Started</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-text-secondary mb-6">
                Welcome to NexSwap, the next generation decentralized exchange. This guide will help you get started with swapping tokens and providing liquidity.
              </p>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-text-primary">Connecting Your Wallet</h2>
              <p className="text-text-secondary mb-6">
                To start using NexSwap, you'll need to connect a compatible Web3 wallet. We support MetaMask, WalletConnect, and other popular wallets.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="text-color-sage mt-1 mr-3 w-5 h-5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Pro Tip</h4>
                    <p className="text-slate-700 text-sm">Make sure your wallet is connected to the correct network before making any transactions.</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-text-primary">Making Your First Swap</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-6">
                <li>Navigate to the Swap page</li>
                <li>Select the token you want to swap from</li>
                <li>Enter the amount you wish to swap</li>
                <li>Select the token you want to receive</li>
                <li>Review the swap details and click "Swap Tokens"</li>
                <li>Confirm the transaction in your wallet</li>
              </ol>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-text-primary">Providing Liquidity</h2>
              <p className="text-text-secondary mb-6">
                Earn fees by providing liquidity to our pools. We offer two types of liquidity pools:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold mb-3 text-color-sage">Balancer Pools</h3>
                  <p className="text-text-secondary text-sm">Multi-token pools with custom weights. Perfect for maintaining token exposure while earning fees.</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold mb-3 text-color-black">Uniswap V3 Pools</h3>
                  <p className="text-text-secondary text-sm">Concentrated liquidity pools that allow you to provide liquidity within specific price ranges for higher capital efficiency.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
