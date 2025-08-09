"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "./ui/chart";
import { PerformanceData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PerformanceChartProps {
  performance: PerformanceData | null;
  loading: boolean;
}

const chartConfig = {
  portfolio: {
    label: "Portfolio",
    color: "var(--chart-1)",
  },
  nifty50: {
    label: "Nifty 50",
    color: "var(--chart-2)",
  },
  gold: {
    label: "Gold",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  performance,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="max-h-[500px] h-full">
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
          <CardDescription>Portfolio vs market benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 animate-pulse rounded" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm flex items-start">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  if (!performance || !performance.timeline?.length) return null;

  // Normalize data to show percentage changes from baseline
  const normalizedData = performance.timeline.map((item, index) => {
    const basePortfolio = performance.timeline[0]?.portfolio || 1;
    const baseNifty = performance.timeline[0]?.nifty50 || 1;
    const baseGold = performance.timeline[0]?.gold || 1;

    return {
      date: item.date,
      portfolio: ((item.portfolio - basePortfolio) / basePortfolio) * 100,
      nifty50: ((item.nifty50 - baseNifty) / baseNifty) * 100,
      gold: ((item.gold - baseGold) / baseGold) * 100,
      // Keep original values for tooltip
      portfolioValue: item.portfolio,
      nifty50Value: item.nifty50,
      goldValue: item.gold,
    };
  });

  // Calculate performance metrics
  const latestData = normalizedData[normalizedData.length - 1];
  const portfolioChange = latestData?.portfolio || 0;
  const bestPerformer = Math.max(
    latestData?.portfolio || 0,
    latestData?.nifty50 || 0,
    latestData?.gold || 0
  );
  const isPortfolioBest = portfolioChange === bestPerformer;

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="mb-2 font-medium">{label}</div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "var(--color-portfolio)" }}
              />
              <span className="text-sm">Portfolio:</span>
              <span className="font-medium">
                {formatCurrency(data.portfolioValue)}
              </span>
              <span
                className={`text-xs ${
                  data.portfolio >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ({data.portfolio >= 0 ? "+" : ""}
                {data.portfolio.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "var(--color-nifty50)" }}
              />
              <span className="text-sm">Nifty 50:</span>
              <span className="font-medium">
                {formatCurrency(data.nifty50Value)}
              </span>
              <span
                className={`text-xs ${
                  data.nifty50 >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ({data.nifty50 >= 0 ? "+" : ""}
                {data.nifty50.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "var(--color-gold)" }}
              />
              <span className="text-sm">Gold:</span>
              <span className="font-medium">
                {formatCurrency(data.goldValue)}
              </span>
              <span
                className={`text-xs ${
                  data.gold >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ({data.gold >= 0 ? "+" : ""}
                {data.gold.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="max-h-[500px] h-full gap-0">
      <CardHeader>
        <CardTitle>Performance Timeline</CardTitle>
        <CardDescription>
          Normalized percentage returns from baseline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[350px]">
          <LineChart
            accessibilityLayer
            data={normalizedData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.4}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Format date to show month/day or just month
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ChartTooltip content={<CustomTooltipContent />} />

            <Line
              dataKey="portfolio"
              type="monotone"
              stroke="var(--color-portfolio)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: "var(--color-portfolio)",
              }}
            />
            <Line
              dataKey="nifty50"
              type="monotone"
              stroke="var(--color-nifty50)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "var(--color-nifty50)",
              }}
            />
            <Line
              dataKey="gold"
              type="monotone"
              stroke="var(--color-gold)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "var(--color-gold)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          {portfolioChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span>
            Portfolio {portfolioChange >= 0 ? "up" : "down"} by{" "}
            {Math.abs(portfolioChange).toFixed(2)}%
            {isPortfolioBest && " (best performer)"}
          </span>
        </div>
        <div className="text-muted-foreground leading-none">
          Performance comparison normalized to show percentage changes from
          baseline
        </div>
      </CardFooter>
    </Card>
  );
};

export default PerformanceChart;
