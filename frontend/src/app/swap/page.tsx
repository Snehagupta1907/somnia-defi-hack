'use client'

import { motion } from "framer-motion";
import SwapForm from "@/components/swap-form";

export default function Swap() {
  return (
    <div className="max-w-2xl mt-[10%] mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center mb-8 text-text-primary"
      >
        Token Swap
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SwapForm />
      </motion.div>
    </div>
  );
} 