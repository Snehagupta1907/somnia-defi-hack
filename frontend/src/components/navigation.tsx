'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConnectButton from "@/components/wallet-connect";
import Image from "next/image";
import { useState } from "react";

import logo from "../app/logo.png";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/swap", label: "Swap" },
    { path: "/pools", label: "Pools" },
    { path: "/analytics", label: "Analytics" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/docs", label: "Docs" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-4 left-1/2 font-mono -translate-x-1/2 z-50">
      <div
        className="flex items-center justify-between px-6 
                   glass-morphism backdrop-blur-xl rounded-3xl shadow-lg 
                   border border-white/20 max-w-6xl mx-auto w-[90vw]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Swapdotso Logo"
            width={150}
            height={150}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative font-medium transition-colors duration-200 ${isActive(link.path)
                  ? "text-color-sage"
                  : "text-text-primary hover:text-color-sage"
                }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-color-sage rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Wallet Connect */}
        <div className="hidden md:flex">
          <ConnectButton  />
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 
                     w-[90vw] glass-morphism backdrop-blur-xl rounded-2xl 
                     shadow-lg border border-white/20 p-4 space-y-2"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                  ? "bg-color-sage text-white"
                  : "text-text-primary hover:bg-white/10"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}
