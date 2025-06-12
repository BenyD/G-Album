"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, PieChart } from "@/components/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/admin/role-context";
import { Loader2, TrendingUp, ShoppingCart, IndianRupee } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BarChart3,
  Calendar,
  Download,
  Info,
  Lock,
  Users,
  Camera,
  DollarSign,
  Package,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBasedContent } from "@/components/admin/role-based-content";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsPage() {
  const { hasPermission } = useRole();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const canViewAnalytics = hasPermission("view_analytics");

  // Fetch monthly analytics
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["monthly-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_analytics")
        .select("*")
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

  // Fetch revenue breakdown
  const { data: revenueBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["revenue-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_revenue_breakdown", {
        start_date: new Date(
          new Date().setMonth(new Date().getMonth() - 6)
        ).toISOString(),
        end_date: new Date().toISOString(),
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
          You don't have permission to view analytics.
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
                  xAxisKey="month"
                  yAxisKey="total_revenue"
                  valueFormatter={formatCurrency}
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
                    valueFormatter={formatCurrency}
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
                    xAxisKey="month"
                    yAxisKey="total_revenue"
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
                    xAxisKey="category"
                    yAxisKey="count"
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
                    xAxisKey="month"
                    yAxisKey="total_orders"
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
