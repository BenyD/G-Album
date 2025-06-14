"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, PieChart } from "@/components/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/admin/role-context";
import { Loader2, TrendingUp, ShoppingCart, IndianRupee } from "lucide-react";
import { startOfDay, endOfDay, subDays, startOfYear } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

export default function AnalyticsPage() {
  const { hasPermission } = useRole();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const canViewAnalytics = hasPermission("view_analytics");

  const [dateFilter, setDateFilter] = useState("last_30_days");
  const [customRange, setCustomRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({ start: undefined, end: undefined });

  // Helper to get start/end dates based on filter
  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case "today":
        return { start: startOfDay(today), end: endOfDay(today) };
      case "last_week":
        return { start: startOfDay(subDays(today, 6)), end: endOfDay(today) };
      case "last_30_days":
        return { start: startOfDay(subDays(today, 29)), end: endOfDay(today) };
      case "last_year":
        return { start: startOfYear(today), end: endOfDay(today) };
      case "custom":
        if (!customRange.start || !customRange.end) {
          return {
            start: startOfDay(subDays(today, 29)),
            end: endOfDay(today),
          };
        }
        return { start: customRange.start, end: customRange.end };
      default:
        return { start: startOfDay(subDays(today, 29)), end: endOfDay(today) };
    }
  };
  const { start, end } = getDateRange();

  // Fetch monthly analytics (filtered)
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["monthly-analytics", start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_analytics")
        .select("*")
        .gte("month", start.toISOString())
        .lte("month", end.toISOString())
        .order("month", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: canViewAnalytics,
  });

  // Fetch order status analytics
  const { data: orderStatusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["order-status-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_analytics")
        .select("*");

      if (error) throw error;
      return data;
    },
    enabled: canViewAnalytics,
  });

  // Fetch revenue breakdown (filtered)
  const { data: revenueBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["revenue-breakdown", start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_revenue_breakdown", {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });
      if (error) throw error;
      return data;
    },
    enabled: canViewAnalytics,
  });

  // Fetch order processing metrics
  const { data: processingMetrics, isLoading: isLoadingProcessing } = useQuery({
    queryKey: ["order-processing-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_order_processing_metrics"
      );

      if (error) throw error;
      return data;
    },
    enabled: canViewAnalytics,
  });

  if (!canViewAnalytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-lg text-muted-foreground">
          You don&apos;t have permission to view analytics.
        </p>
      </div>
    );
  }

  // Calculate key metrics
  const totalRevenue =
    monthlyData?.reduce((sum, month) => sum + month.total_revenue, 0) || 0;
  const totalOrders =
    monthlyData?.reduce((sum, month) => sum + month.total_orders, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Analytics</h1>
        <p className="text-muted-foreground">
          View business performance metrics and trends
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] border-red-100">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last_week">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter === "custom" && (
          <div className="flex gap-2 items-center">
            <DatePicker
              date={customRange.start}
              onSelect={(date) =>
                setCustomRange((prev) => ({ ...prev, start: date }))
              }
              placeholder="Start date"
            />
            <span>-</span>
            <DatePicker
              date={customRange.end}
              onSelect={(date) =>
                setCustomRange((prev) => ({ ...prev, end: date }))
              }
              placeholder="End date"
            />
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMonthly ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                formatCurrency(totalRevenue)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMonthly ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                totalOrders
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMonthly ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                formatCurrency(avgOrderValue)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-red-50">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-900">Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMonthly ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <LineChart
                  data={monthlyData || []}
                  xKey="month"
                  yKey="total_revenue"
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Revenue by Order Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBreakdown ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <PieChart
                    data={revenueBreakdown || []}
                    nameKey="category"
                    valueKey="revenue"
                    height={300}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Monthly Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMonthly ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <BarChart
                    data={monthlyData || []}
                    xKey="month"
                    yKey="total_revenue"
                    valueFormatter={formatCurrency}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Revenue Visualizations */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Cumulative Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMonthly ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <LineChart
                    data={
                      monthlyData?.reduce((acc, cur, i) => {
                        const prev = acc[i - 1]?.cumulative || 0;
                        acc.push({
                          ...cur,
                          cumulative: prev + cur.total_revenue,
                        });
                        return acc;
                      }, []) || []
                    }
                    xKey="month"
                    yKey="cumulative"
                    valueFormatter={formatCurrency}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Revenue vs Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMonthly ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <BarChart
                    data={monthlyData || []}
                    xKey="month"
                    yKey="total_revenue"
                    secondaryYAxisKey="total_orders"
                    valueFormatter={formatCurrency}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-900">
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <PieChart
                  data={orderStatusData || []}
                  nameKey="status"
                  valueKey="count"
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Order Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProcessing ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <BarChart
                    data={processingMetrics || []}
                    xKey="category"
                    yKey="count"
                    height={300}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">
                  Monthly Order Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMonthly ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <LineChart
                    data={monthlyData || []}
                    xKey="month"
                    yKey="total_orders"
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
