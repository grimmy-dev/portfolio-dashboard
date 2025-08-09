"use client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { StockHoldingsTable } from "@/components/stock-holdings-table";
import SummaryInfo from "@/components/summary-info";
import AllocationChart from "@/components/allocation-chart";
import PerformanceChart from "@/components/performance-chart";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import MarketCapTable from "@/components/market-cap-table";

export default function Home() {
  const {
    holdings,
    summary,
    allocation,
    performance,
    marketCap,
    loading,
    error,
    refetch,
  } = usePortfolioData();

  if (error) {
    return (
      <MaxWidthWrapper className="w-full min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">
            Unable to Load Portfolio Data
          </h2>
          <p className="text-gray-600 max-w-md text-sm sm:text-base">{error}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <MaxWidthWrapper className="w-full p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio Analytics
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track your investments and monitor performance in real-time
            </p>
          </div>
          <Button
            onClick={refetch}
            disabled={loading}
            className="shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Summary Cards Section */}
        <SummaryInfo summary={summary} loading={loading} />

        {/* Analytics Grid Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Analytics Overview
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Detailed breakdown of your portfolio composition
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Allocation Chart */}
            <div className="group">
              <AllocationChart allocation={allocation} loading={loading} />
            </div>

            {/* Market Cap Table */}
            <div className="group">
              <MarketCapTable data={marketCap} loading={loading} />
            </div>

            {/* Performance Chart */}
            <div className="md:col-span-2 xl:col-span-1 group">
              <PerformanceChart performance={performance} loading={loading} />
            </div>
          </div>
        </div>

        {/* Holdings Table Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Stock Holdings
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Complete list of your investment positions
              </p>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <StockHoldingsTable holdings={holdings} loading={loading} />
            </div>
          </div>
        </div>

        {/* Footer Spacer */}
        <div className="h-4 sm:h-8" />
      </MaxWidthWrapper>
    </div>
  );
}
