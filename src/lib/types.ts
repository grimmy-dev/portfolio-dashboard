export interface HoldingItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
  marketCap: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface AllocationItem {
  value: number;
  percentage: number;
}

export interface PerformanceTimeline {
  date: string;
  portfolio: number;
  nifty50: number;
  gold: number;
}

export interface PerformanceReturns {
  month1: number;
  months3: number;
  year1: number;
}

export interface PerformanceData {
  timeline: PerformanceTimeline[];
  returns: Record<string, PerformanceReturns>;
}

export interface TopPerformer {
  symbol: string;
  name: string;
  gainPercent?: number;
  value?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topPerformer: TopPerformer;
  worstPerformer: TopPerformer;
  highestValue: TopPerformer;
  lowestValue: TopPerformer;
  diversificationScore: number;
  riskLevel: string;
}

export interface AllocationData {
  bySector: Record<string, AllocationItem>;
  byMarketCap: Record<string, AllocationItem>;
}

export interface MarketCapItem {
  marketCap: string;
  value: number;
  percentage: number;
}
