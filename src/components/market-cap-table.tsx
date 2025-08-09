import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { TrendingUp, Building2, Zap, Target } from "lucide-react";
import { MarketCapItem } from "@/lib/types";

const getMarketCapIcon = (marketCap: string) => {
  const cap = marketCap.toLowerCase();
  if (cap.includes("large"))
    return <Building2 className="h-4 w-4 text-blue-600" />;
  if (cap.includes("mid")) return <Target className="h-4 w-4 text-green-600" />;
  if (cap.includes("small")) return <Zap className="h-4 w-4 text-orange-600" />;
  return <TrendingUp className="h-4 w-4 text-gray-600" />;
};

const getMarketCapColor = (marketCap: string) => {
  const cap = marketCap.toLowerCase();
  if (cap.includes("large")) return "bg-blue-500";
  if (cap.includes("mid")) return "bg-green-500";
  if (cap.includes("small")) return "bg-orange-500";
  return "bg-gray-500";
};

export default function MarketCapTable({
  data,
  loading,
}: {
  data: MarketCapItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="animate-puls max-h-[500px] h-full">
        <CardHeader>
          <div className="h-12 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="size-12 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-9 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-full" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Cap Allocation</CardTitle>
          <CardDescription>
            Portfolio distribution by market capitalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No market cap data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const maxPercentage = Math.max(...data.map((item) => item.percentage));

  return (
    <Card className="max-h-[500px] h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Market Cap Allocation
        </CardTitle>
        <CardDescription>
          Portfolio distribution by market capitalization segments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = item.percentage;
            const isHighest = percentage === maxPercentage;

            return (
              <div
                key={item.marketCap}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                  isHighest ? "bg-blue-50 border border-blue-200" : "bg-gray-25"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-100">
                  {getMarketCapIcon(item.marketCap)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {item.marketCap}
                      {isHighest && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Highest
                        </span>
                      )}
                    </h4>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.percentage}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.value.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Progress
                      value={percentage}
                      className="h-2"
                      style={
                        {
                          "--progress-background": getMarketCapColor(
                            item.marketCap
                          ),
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">
              Total Portfolio Value
            </span>
            <span className="font-semibold text-gray-900">
              ₹{totalValue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
