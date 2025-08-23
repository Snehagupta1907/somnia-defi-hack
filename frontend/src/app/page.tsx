'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightLeft, Plus, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in seconds with our optimized routing algorithm and minimal slippage.",
    },
    {
      icon: Shield,
      title: "Secure & Audited",
      description: "Built with security-first principles and audited by top blockchain security firms.",
    },
    {
      icon: TrendingUp,
      title: "Maximum Yields",
      description: "Earn competitive APR with our innovative liquidity pool strategies.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ backgroundColor: 'var(--color-sage)' }}></div>
        <div className="absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed" style={{ backgroundColor: 'var(--color-mint)' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ backgroundColor: 'var(--color-sage)' }}></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="block text-color-black">Swap.</span>
            <span className="block text-color-black">Provide Liquidity.</span>
            <span className="block text-color-black">Earn.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto"
          >
            The next generation decentralized exchange with advanced liquidity pools and maximum earning potential.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/swap">
              <Button
                size="lg"
                className="text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 px-8 py-4 text-lg"
                style={{ backgroundColor: 'var(--color-sage)' }}
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span>Start Swapping</span>
              </Button>
            </Link>
            
            <Link href="/pools">
              <Button
                size="lg"
                variant="outline"
                className="glass-morphism hover-lift flex items-center space-x-2 px-8 py-4 text-lg text-color-black border-color-sage"
              >
                <Plus className="w-5 h-5" />
                <span>Create Pool</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-color-black"
          >
            Why Choose NexSwap?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-morphism p-8 rounded-2xl text-center hover-lift"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-sage)' }}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-color-black">{feature.title}</h3>
                <p className="text-text-secondary text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8 text-color-black"
          >
            Ready to Start Trading?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-text-secondary mb-12"
          >
            Join thousands of users already trading on NexSwap
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/swap">
              <Button
                size="lg"
                className="text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 px-8 py-4 text-lg"
                style={{ backgroundColor: 'var(--color-sage)' }}
              >
                Launch App
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
