import {
  AllocationData,
  HoldingItem,
  PerformanceData,
  PortfolioSummary,
  MarketCapItem,
} from "@/lib/types";
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api/portfolio";

export const usePortfolioData = () => {
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [marketCap, setMarketCap] = useState<MarketCapItem[]>([]); // Add this state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        holdingsRes,
        summaryRes,
        allocationRes,
        performanceRes,
        marketCapRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/holdings`),
        fetch(`${API_BASE}/summary`),
        fetch(`${API_BASE}/allocation`),
        fetch(`${API_BASE}/performance`),
        fetch(`${API_BASE}/marketcap`),
      ]);

      if (
        !holdingsRes.ok ||
        !summaryRes.ok ||
        !allocationRes.ok ||
        !performanceRes.ok ||
        !marketCapRes.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const [
        holdingsData,
        summaryData,
        allocationData,
        performanceData,
        marketCapData,
      ] = await Promise.all([
        holdingsRes.json(),
        summaryRes.json(),
        allocationRes.json(),
        performanceRes.json(),
        marketCapRes.json(),
      ]);

      setHoldings(holdingsData);
      setSummary(summaryData);
      setAllocation(allocationData);
      setPerformance(performanceData);
      setMarketCap(marketCapData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    holdings,
    summary,
    allocation,
    performance,
    marketCap,
    loading,
    error,
    refetch: fetchData,
  };
};
