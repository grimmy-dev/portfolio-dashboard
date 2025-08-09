import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { TrendingUp, TrendingDown, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { PortfolioSummary } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface SummaryInfoProps {
  summary: PortfolioSummary | null;
  loading: boolean;
}

const SummaryInfo: React.FC<SummaryInfoProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse h-44">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const isProfit = summary.totalGainLoss > 0;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="h-44 gap-2">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Total Invested
          </CardTitle>
          <CardDescription>Amount invested in portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-extrabold tracking-wide">
            {formatCurrency(summary.totalInvested)}
          </p>
        </CardContent>
      </Card>

      <Card className="h-44 gap-2">
        <CardHeader>
          <CardTitle className="text-lg">Current Value</CardTitle>
          <CardDescription>Total portfolio value</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(summary.totalValue)}
          </p>
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span
            className={`font-semibold ${
              isProfit ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(summary.totalGainLoss)} (
            {formatPercentage(summary.totalGainLossPercent)})
          </span>
        </CardFooter>
      </Card>

      <Card className="h-44">
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
          <CardDescription>Best and worst performers</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">
                  {summary.topPerformer.symbol.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {summary.topPerformer.name}
                </p>
                <p className="text-xs text-green-600">
                  +{summary.topPerformer.gainPercent!.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-red-700">
                  {summary.worstPerformer.symbol.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {summary.worstPerformer.name}
                </p>
                <p className="text-xs text-red-600">
                  {summary.worstPerformer.gainPercent!.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-44 gap-2">
        <CardHeader>
          <CardTitle className="text-lg">Holdings Value</CardTitle>
          <CardDescription>Highest and lowest value holdings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <TrendingUpIcon className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {summary.highestValue.name}
                </p>
                <p className="text-xs text-blue-600 font-semibold">
                  {formatCurrency(summary.highestValue.value!)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-destructive/20 rounded flex items-center justify-center">
                <TrendingDownIcon className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {summary.lowestValue.name}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  {formatCurrency(summary.lowestValue.value!)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryInfo;
