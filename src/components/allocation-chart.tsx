"use client";
import React from "react";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip
} from "./ui/chart";
import { AllocationData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface AllocationChartProps {
  allocation: AllocationData | null;
  loading: boolean;
}

// Extended color palette for 9+ sectors
const SECTOR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(210, 100%, 56%)", // Blue
  "hsl(142, 76%, 36%)", // Green
  "hsl(262, 83%, 58%)", // Purple
  "hsl(346, 77%, 49%)", // Pink
  "hsl(47, 96%, 53%)", // Yellow
  "hsl(24, 70%, 50%)", // Orange variant
  "hsl(197, 71%, 52%)", // Cyan
];

const AllocationChart: React.FC<AllocationChartProps> = ({
  allocation,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="flex flex-col row-span-1 max-h-[500px]">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-xl font-semibold">Sector Allocation</CardTitle>
          <CardDescription>Portfolio distribution by sectors</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[300px] bg-gray-200 animate-pulse rounded" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  if (!allocation) return null;

  // Transform data for chart with proper color distribution
  const sectorData = Object.entries(allocation.bySector).map(
    ([name, data], index) => ({
      sector: name,
      value: data.value,
      percentage: data.percentage,
      fill: SECTOR_COLORS[index % SECTOR_COLORS.length],
    })
  );

  // Create dynamic chart config
  const chartConfig: ChartConfig = {
    value: {
      label: "Value",
    },
    ...Object.fromEntries(
      sectorData.map(({ sector }, index) => [
        sector.toLowerCase().replace(/\s+/g, ""),
        {
          label: sector,
          color: SECTOR_COLORS[index % SECTOR_COLORS.length],
        },
      ])
    ),
  };

  // Calculate total value and highest allocation
  const totalValue = sectorData.reduce((sum, item) => sum + item.value, 0);
  const highestAllocation = sectorData.reduce(
    (max, item) => (item.percentage > max.percentage ? item : max),
    sectorData[0]
  );

  // Custom tooltip content
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Sector
              </span>
              <span className="font-bold text-muted-foreground">
                {data.sector}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Value
              </span>
              <span className="font-bold">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Percentage
              </span>
              <span className="font-bold">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label function with better positioning and truncation
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    sector,
    percentage,
  }: any) => {
    if (percentage < 5) return null; // Don't show labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Truncate long sector names
    const truncatedSector =
      sector.length > 12 ? sector.substring(0, 12) + "..." : sector;

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${truncatedSector}`}
        <tspan x={x} dy="1.2em" className="text-xs font-normal">
          {`${percentage.toFixed(1)}%`}
        </tspan>
      </text>
    );
  };

  return (
    <Card className="flex flex-col gap-0 max-h-[500px] h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle  className="text-xl font-semibold">Sector Allocation</CardTitle>
        <CardDescription>
          Portfolio distribution across {sectorData.length} sectors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full h-[350px]"
        >
          <PieChart width={300}height={300}>
            <ChartTooltip content={<CustomTooltipContent />} />
            <Pie
              data={sectorData}
              dataKey="value"
              nameKey="sector"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={0}
              label={renderCustomLabel}
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          <PieChartIcon className="h-4 w-4" />
          Largest allocation: {highestAllocation.sector} (
          {highestAllocation.percentage.toFixed(1)}%)
        </div>
        <div className="text-muted-foreground leading-none">
          Total portfolio value: {formatCurrency(totalValue)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AllocationChart;

// Alternative Market Cap Allocation Chart with similar fixes
export const MarketCapAllocationChart: React.FC<AllocationChartProps> = ({
  allocation,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Market Cap Allocation</CardTitle>
          <CardDescription>
            Portfolio distribution by market cap
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[250px] bg-gray-200 animate-pulse rounded" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  if (!allocation) return null;

  const marketCapData = Object.entries(allocation.byMarketCap)
    .filter(([, data]) => data.value > 0)
    .map(([name, data], index) => ({
      marketCap: name,
      value: data.value,
      percentage: data.percentage,
      fill: SECTOR_COLORS[index % SECTOR_COLORS.length],
    }));

  if (marketCapData.length === 0) return null;

  const chartConfig: ChartConfig = {
    value: {
      label: "Value",
    },
    ...Object.fromEntries(
      marketCapData.map(({ marketCap }, index) => [
        marketCap.toLowerCase().replace(/\s+/g, ""),
        {
          label: marketCap,
          color: SECTOR_COLORS[index % SECTOR_COLORS.length],
        },
      ])
    ),
  };

  const totalValue = marketCapData.reduce((sum, item) => sum + item.value, 0);
  const largestCap = marketCapData.reduce(
    (max, item) => (item.percentage > max.percentage ? item : max),
    marketCapData[0]
  );

  const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Market Cap
              </span>
              <span className="font-bold text-muted-foreground">
                {data.marketCap}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Value
              </span>
              <span className="font-bold">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Percentage
              </span>
              <span className="font-bold">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomMarketCapLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    marketCap,
    percentage,
  }: any) => {
    if (percentage < 8) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {marketCap}
        <tspan x={x} dy="1.2em" className="text-xs font-normal">
          {`${percentage.toFixed(1)}%`}
        </tspan>
      </text>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Market Cap Allocation</CardTitle>
        <CardDescription>
          Portfolio distribution by company size
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] w-full"
        >
          <PieChart width={200} height={200}>
            <ChartTooltip content={<CustomTooltipContent />} />
            <Pie
              data={marketCapData}
              dataKey="value"
              nameKey="marketCap"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={0}
              label={renderCustomMarketCapLabel}
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          <TrendingUp className="h-4 w-4" />
          Largest exposure: {largestCap.marketCap} (
          {largestCap.percentage.toFixed(1)}%)
        </div>
        <div className="text-muted-foreground leading-none">
          Total across {marketCapData.length} market cap categories
        </div>
      </CardFooter>
    </Card>
  );
};
