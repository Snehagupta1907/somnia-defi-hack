import { Link, useLocation } from "wouter";
import { ArrowRightLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/wallet-connect";

export default function Navigation() {
  const [location] = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/swap", label: "Swap" },
    { path: "/pools", label: "Pools" },
    { path: "/analytics", label: "Analytics" },
    { path: "/docs", label: "Docs" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="relative z-50 glass-morphism sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-sage)' }}>
                <ArrowRightLeft className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">NexSwap</span>
            </a>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? "nav-link-active"
                      : "text-text-primary hover:text-color-sage"
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
          
          {/* Wallet Connect */}
          <WalletConnect />
          
          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
