"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HoldingItem } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";

export const columns: ColumnDef<HoldingItem>[] = [
  {
    accessorKey: "symbol",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <span className="hidden sm:inline">Symbol</span>
          <span className="sm:hidden">Sym</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("symbol")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Company",
    cell: ({ row }) => (
      <div className="max-w-[120px] sm:max-w-[200px] truncate text-sm">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Qty
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      return <div className="text-right text-sm">{formatNumber(quantity)}</div>;
    },
  },
  {
    accessorKey: "avgPrice",
    header: ({ column }) => {
      return (
        <div className="text-right hidden sm:block">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <span className="hidden lg:inline">Avg Price</span>
            <span className="lg:hidden">Avg</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const avgPrice = row.getValue("avgPrice") as number;
      return (
        <div className="text-right text-sm hidden sm:block">
          {formatCurrency(avgPrice)}
        </div>
      );
    },
  },
  {
    accessorKey: "currentPrice",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <span className="hidden lg:inline">Current Price</span>
            <span className="lg:hidden hidden sm:inline">Current</span>
            <span className="sm:hidden">Price</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const currentPrice = row.getValue("currentPrice") as number;
      return (
        <div className="text-right text-sm">{formatCurrency(currentPrice)}</div>
      );
    },
  },
  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Value
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("value") as number;
      return (
        <div className="text-right font-medium text-sm">
          {formatCurrency(value)}
        </div>
      );
    },
  },
  {
    accessorKey: "gainLoss",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            P&L
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const holding = row.original;
      return (
        <div
          className={`text-right font-medium text-sm ${
            holding.gainLoss > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <div>{formatCurrency(holding.gainLoss)}</div>
          <div className="text-xs opacity-75">
            ({formatPercentage(holding.gainLossPercent)})
          </div>
        </div>
      );
    },
  },
];

interface StockHoldingsTableProps {
  holdings: HoldingItem[];
  loading: boolean;
}

export const StockHoldingsTable: React.FC<StockHoldingsTableProps> = ({
  holdings,
  loading,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Handle client-side responsive column visibility
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setColumnVisibility((prev) => ({
        ...prev,
        avgPrice: !isMobile,
      }));
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const table = useReactTable({
    data: holdings,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-3 sm:p-6">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-12 sm:h-14 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between p-3 sm:p-6">
          <div className="h-6 w-32 sm:w-44 bg-gray-200 rounded" />
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="w-20 sm:w-24 h-8 sm:h-9 bg-gray-200 rounded" />
            <div className="w-20 sm:w-24 h-8 sm:h-9 bg-gray-200 rounded" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-4">
          <Input
            placeholder="Filter symbols..."
            value={
              (table.getColumn("symbol")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("symbol")?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-xs lg:max-w-xl"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Card View for very small screens */}
        <div className="block sm:hidden space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const holding = row.original;
              return (
                <div
                  key={row.id}
                  className="bg-gray-50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">
                        {holding.symbol}
                      </div>
                      <div className="text-xs text-gray-600 truncate max-w-[150px]">
                        {holding.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {formatCurrency(holding.value)}
                      </div>
                      <div
                        className={`text-xs ${
                          holding.gainLoss > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(holding.gainLoss)} (
                        {formatPercentage(holding.gainLossPercent)})
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Qty: {formatNumber(holding.quantity)}</span>
                    <span>Price: {formatCurrency(holding.currentPrice)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No holdings found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="rounded-md border min-w-full">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-2 lg:px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-2 lg:px-4 py-2">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No holdings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
          <div className="text-muted-foreground text-sm order-2 sm:order-1">
            {table.getFilteredRowModel().rows.length} holding(s) total.
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-xs sm:text-sm"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
