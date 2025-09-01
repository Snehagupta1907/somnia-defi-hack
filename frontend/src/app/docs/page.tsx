'use client'

import { motion } from "framer-motion";
import { BookOpen, FileText, Code, Users, Shield, Zap } from "lucide-react";

export default function Docs() {
  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using SwapDotSo for token swapping and liquidity provision.",
      link: "#getting-started"
    },
    {
      icon: FileText,
      title: "API Reference",
      description: "Complete API documentation for developers building on top of SwapDotSo.",
      link: "#api-reference"
    },
    {
      icon: Code,
      title: "Smart Contracts",
      description: "Technical details about our smart contracts and security measures.",
      link: "#smart-contracts"
    },
    {
      icon: Users,
      title: "Community",
      description: "Join our community and get support from other users and developers.",
      link: "#community"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Learn about our security practices and audit reports.",
      link: "#security"
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Understand how SwapDotSo achieves high performance and low fees.",
      link: "#performance"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Documentation</h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Everything you need to know about using SwapDotSo, from basic operations to advanced features.
        </p>
      </motion.div>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass-morphism p-6 rounded-xl hover-lift cursor-pointer"
            onClick={() => document.querySelector(section.link)?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
              <section.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-text-primary">{section.title}</h3>
            <p className="text-text-secondary">{section.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Getting Started Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        id="getting-started"
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-6 text-text-primary">Getting Started</h2>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">1. Connect Your Wallet</h3>
          <p className="text-text-secondary mb-4">
            Start by connecting your Web3 wallet (MetaMask, WalletConnect, etc.) to SwapDotSo.
          </p>
          
          <h3 className="text-xl font-semibold mb-4 text-text-primary">2. Swap Tokens</h3>
          <p className="text-text-secondary mb-4">
            Navigate to the Swap page and select the tokens you want to exchange. Set your slippage tolerance and confirm the transaction.
          </p>
          
          <h3 className="text-xl font-semibold mb-4 text-text-primary">3. Provide Liquidity</h3>
          <p className="text-text-secondary mb-4">
            Create or join liquidity pools to earn trading fees and rewards. Choose between Balancer and Uniswap V3 pool types.
          </p>
          
          <h3 className="text-xl font-semibold mb-4 text-text-primary">4. Monitor Performance</h3>
          <p className="text-text-secondary">
            Track your portfolio performance, trading history, and earnings through our comprehensive analytics dashboard.
          </p>
        </div>
      </motion.section>

      {/* API Reference Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        id="api-reference"
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-6 text-text-primary">API Reference</h2>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">Endpoints</h3>
          <div className="space-y-4">
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /api/tokens</code>
              <p className="text-text-secondary mt-1">Get all available tokens</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /api/pools</code>
              <p className="text-text-secondary mt-1">Get all liquidity pools</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /api/swaps</code>
              <p className="text-text-secondary mt-1">Execute a token swap</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /api/analytics</code>
              <p className="text-text-secondary mt-1">Get platform analytics</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
} 