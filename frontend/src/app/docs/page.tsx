'use client'

import { motion } from "framer-motion";
import { BookOpen, FileText, Code, Users, Shield, Zap, Search, Copy } from "lucide-react";
import { useState } from "react";
import {config} from "@/balancer-config";
import { uniswapConfig } from "@/uniswap-config";
export default function Docs() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

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

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(query.toLowerCase())
  );


  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl font-mono mx-auto mt-[10%] px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          SwapDotSo Docs
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Everything you need to integrate, build, and scale with SwapDotSo.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search docs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass-morphism p-6 rounded-xl hover:scale-105 transform transition cursor-pointer shadow-md"
            onClick={() => document.querySelector(section.link)?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mb-4">
              <section.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{section.title}</h3>
            <p className="text-gray-600">{section.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Example Docs Sections */}
      <motion.section id="getting-started" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Getting Started</h2>
        <div className="glass-morphism p-6 rounded-xl space-y-6">
          <p className="text-gray-600">
            Follow these steps to start using SwapDotSo:
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Connect your Web3 wallet (MetaMask, WalletConnect, etc.)</li>
            <li>Swap tokens with customizable slippage.</li>
            <li>Provide liquidity and earn rewards.</li>
            <li>Track performance in the analytics dashboard.</li>
          </ol>
        </div>
      </motion.section>

      <motion.section id="api-reference" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">API Reference</h2>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Endpoints</h3>
          <div className="space-y-6 text-gray-700">
            <div>
              <code className="bg-gray-900 text-green-300 px-2 py-1 rounded text-sm">GET /api/tokens</code>
              <p>Retrieve all available tokens</p>
            </div>
            <div>
              <code className="bg-gray-900 text-green-300 px-2 py-1 rounded text-sm">GET /api/pools</code>
              <p>Fetch liquidity pools</p>
            </div>
            <div>
              <code className="bg-gray-900 text-green-300 px-2 py-1 rounded text-sm">POST /api/swaps</code>
              <p>Execute a token swap</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Balancer Config Section */}
      <motion.section id="balancer-config" className="mb-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Balancer Pools V3 Somnia Testnet Config
        </h2>
        <div className="relative glass-morphism p-6 rounded-xl">
          <button
            onClick={()=>copyToClipboard(JSON.stringify(config))}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre className="overflow-x-auto text-sm bg-gray-900 text-green-300 p-4 rounded-lg">
            <code>{JSON.stringify(config,null,2)}</code>
          </pre>
        </div>
      </motion.section>

       <motion.section id="uniswap-config" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Uniswap V3 Somnia Testnet Config
        </h2>
        <div className="relative glass-morphism p-6 rounded-xl">
          <button
            onClick={()=>copyToClipboard(JSON.stringify(uniswapConfig))}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre className="overflow-x-auto text-sm bg-gray-900 text-green-300 p-4 rounded-lg">
            <code>{JSON.stringify(uniswapConfig,null,2)}</code>
          </pre>
        </div>
      </motion.section>
    </div>
  );
}
