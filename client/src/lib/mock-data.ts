// This file contains mock data constants that can be used across components
// All data should eventually be replaced with real API calls

export const mockTokenBalances = {
  eth: "2.5",
  usdc: "1250.0",
  usdt: "800.0",
  dai: "500.0",
};

export const mockExchangeRates = {
  "eth-usdc": 1932.98,
  "usdc-eth": 1 / 1932.98,
  "eth-usdt": 1925.45,
  "usdt-eth": 1 / 1925.45,
  // Add more pairs as needed
};

export const mockNetworkFee = "12.50"; // USD

export const mockSlippageOptions = [0.1, 0.5, 1.0, 2.0];

export const mockChainOptions = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
];

export const mockSortOptions = [
  { value: "tvl", label: "Sort by TVL" },
  { value: "apr", label: "Sort by APR" },
  { value: "volume", label: "Sort by Volume" },
  { value: "fees", label: "Sort by Fees" },
];
