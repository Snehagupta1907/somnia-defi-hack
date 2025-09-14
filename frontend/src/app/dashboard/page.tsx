'use client'

import { motion } from "framer-motion"
import { Copy } from "lucide-react"
import { useAccount, useBalance, useReadContracts } from "wagmi"
import { formatUnits } from "viem"
import type { Abi } from "viem"
import Image from "next/image"

import { tokens, TokenAbi } from "@/balancer-config"

export default function Dashboard() {
  const { address } = useAccount()

  // ✅ native balance (SOMI)
  const { data: userNativeBalance } = useBalance({ address })

  // ✅ filter out somnia_native
  const erc20Tokens = tokens.filter((t) => t.id !== "somnia_native")

  // ✅ prepare ERC20 balanceOf calls
  const erc20Contracts = erc20Tokens.map((token) => ({
    abi: TokenAbi as Abi,
    address: token.address as `0x${string}`,
    functionName: "balanceOf",
    args: [address!],
  }))

  // ✅ batch request with wagmi
  const { data: balances, isLoading } = useReadContracts({
    contracts: erc20Contracts,
  })

  return (
    <div className="max-w-6xl mx-auto mt-[10%] font-mono px-4 py-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-text-primary"
      >
        Dashboard
      </motion.h1>
      <p className="text-text-secondary mb-8">Overview</p>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* SOMI Balance */}
        <motion.div
          className="glass-morphism p-6 rounded-2xl shadow-lg flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-sm text-text-secondary">SOMI Balance</h3>
          <p className="text-2xl font-bold text-text-primary">
            {userNativeBalance?.formatted
              ? Number(userNativeBalance.formatted).toFixed(2)
              : "0.00"}{" "}
            SOMI
          </p>
          <p className="text-xs text-text-secondary">≈ $0</p>
        </motion.div>

        {/* Portfolio Value */}
        <motion.div
          className="glass-morphism p-6 rounded-2xl shadow-lg flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-sm text-text-secondary">Portfolio Value</h3>
          <p className="text-2xl font-bold text-text-primary">$ {userNativeBalance?.formatted
            ? Number(userNativeBalance.formatted*(1.2)).toFixed(2)
            : "0.00"}{" "}</p>
          <p className="text-xs text-text-secondary">Real Total value</p>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          className="glass-morphism p-6 rounded-2xl shadow-lg flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-sm text-text-secondary">Wallet</h3>
          <div className="flex items-center justify-between">
            <p className="text-md font-mono text-text-primary">
              {address?.slice(0, 5)}...{address?.slice(-5)}
            </p>
            <Copy
              size={16}
              className="cursor-pointer text-text-secondary hover:text-text-primary"
            />
          </div>
          <p className="text-xs text-text-secondary">Connected address</p>
        </motion.div>
      </div>

      {/* Token Table */}
      <motion.div
        className="glass-morphism p-6 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Token Balances
            </h2>
            <p className="text-sm text-text-secondary">Your available tokens</p>
          </div>
          <button className="px-4 py-2 text-sm rounded-xl bg-primary/20 hover:bg-primary/30 transition">
            Manage Tokens
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-text-secondary border-b border-gray-700/50">
                <th className="pb-3">Token</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ Native SOMI row */}
              <tr className="border-b border-gray-700/40">
                <td className="py-4 flex items-center gap-3">
                  <Image
                    src="/somnia-logo.png"
                    alt="SOMI"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-text-primary font-medium">SOMI</p>
                    <p className="text-xs text-text-secondary">Somnia Native</p>
                  </div>
                </td>
                <td className="py-4 text-text-primary">
                  {userNativeBalance?.formatted
                    ? Number(userNativeBalance.formatted).toFixed(4)
                    : "0.0000"}
                </td>
                <td className="py-4 text-text-primary">$0</td>
              </tr>

              {/* ✅ ERC20 balances */}
              {erc20Tokens.map((token, i) => {
                const rawBalance = balances?.[i]?.result as bigint | undefined
                const formatted =
                  rawBalance && token.decimals
                    ? Number(formatUnits(rawBalance, Number(token.decimals))).toFixed(4)
                    : "0.0000"

                return (
                  <tr
                    key={i}
                    className="border-b border-gray-700/40 last:border-none"
                  >
                    <td className="py-4 flex items-center gap-3">
                      <img
                        src={token.logoUrl || "/placeholder-token.png"}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-text-primary font-medium">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {token.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-text-primary">{formatted}</td>
                    <td className="py-4 text-text-primary">$0</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
