"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Receipt,
  ShoppingBag,
  HardDrive,
  BarChart3,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getDashboardStats,
  subscribeToUpdates,
} from "@/lib/services/dashboard";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalPending: number;
  totalAdmins: number;
  storageUsage: {
    used: number;
    total: number;
  };
  albumStats: {
    totalAlbums: number;
    totalImages: number;
  };
  recentActivity: {
    orders: Array<{
      id: string;
      order_number: string;
      customer_name: string;
      customer_email: string;
      status: string;
      total_amount: number;
      amount_paid: number;
      balance_amount: number;
      created_at: string;
    }>;
    customers: Array<{
      id: string;
      studio_name: string;
      email: string;
      phone: string;
      created_at: string;
      total_orders: number;
      total_spent: number;
    }>;
    submissions: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      status: string;
      created_at: string;
    }>;
    albumImages: Array<{
      id: string;
      images: Array<{ count: number }>;
    }>;
  };
  revenueGrowth?: {
    percentage: number;
    previousRevenue: number;
  };
}

const STATUS_COLORS = {
  delivered: "#059669", // green-600
  processing: "#3B82F6", // blue-500
  pending: "#F59E0B", // amber-500
  shipped: "#10B981", // emerald-500
  cancelled: "#EF4444", // red-500
  default: "#6B7280", // gray-500
} as const;

function StorageUsageCard({
  storageUsage,
  isLoading,
}: {
  storageUsage: { used: number; total: number };
  isLoading: boolean;
}) {
  const usedGB =
    Math.round(((storageUsage?.used || 0) / (1024 * 1024 * 1024)) * 100) / 100;
  const totalGB =
    Math.round(((storageUsage?.total || 0) / (1024 * 1024 * 1024)) * 100) / 100;
  const usagePercentage = Math.round((usedGB / totalGB) * 100) || 0;
  const isNearLimit = usagePercentage >= 80;
  const isCritical = usagePercentage >= 90;

  const getProgressColor = () => {
    if (isCritical) return "bg-red-100 [&>[role=progressbar]]:bg-red-600";
    if (isNearLimit)
      return "bg-yellow-100 [&>[role=progressbar]]:bg-yellow-600";
    return "bg-emerald-100 [&>[role=progressbar]]:bg-emerald-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
        <HardDrive className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32 mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{usedGB.toFixed(2)} GB</div>
            <div className="space-y-2">
              <Progress
                value={usagePercentage}
                className={`h-2 ${getProgressColor()}`}
              />
              <p className="text-sm text-muted-foreground">
                {usagePercentage}% of {totalGB.toFixed(2)} GB used
                {isCritical && (
                  <span className="ml-2 text-red-600">(Critical)</span>
                )}
                {isNearLimit && !isCritical && (
                  <span className="ml-2 text-yellow-600">(Near limit)</span>
                )}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OrderStatusDistribution({
  statusDistribution,
  isLoading,
}: {
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Order Status Distribution
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {statusDistribution?.map((status) => {
              const percentage = Math.round(
                (status.count /
                  statusDistribution.reduce(
                    (acc, curr) => acc + curr.count,
                    0
                  )) *
                  100
              );
              return (
                <div key={status.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {status.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-muted-foreground">
                      {status.count} ({percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    style={
                      {
                        backgroundColor: `${status.color}20`,
                        "--progress-foreground": status.color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => getDashboardStats() as Promise<DashboardStats>,
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToUpdates((newStats) => {
      queryClient.setQueryData(
        ["dashboardStats"],
        (oldStats: DashboardStats | undefined) => ({
          ...oldStats,
          ...newStats,
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  if (isError) {
    return (
      <Alert
        variant="destructive"
        className="bg-red-50 text-red-900 border-red-200"
      >
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "An error occurred while fetching dashboard data. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and key metrics
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Orders"
            value={stats?.totalOrders}
            subValue={`${stats?.recentActivity.orders.length || 0} recent orders`}
            icon={<ShoppingBag className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            subValue={`Avg. ${formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1))} per order`}
            icon={<Receipt className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <MetricCard
            title="Active Orders"
            value={
              stats?.recentActivity.orders.filter(
                (o) => !["delivered", "cancelled"].includes(o.status)
              ).length || 0
            }
            subValue="Orders in progress"
            icon={<Clock className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <StorageUsageCard
            storageUsage={stats?.storageUsage || { used: 0, total: 0 }}
            isLoading={isLoading}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenue Growth"
            value={
              stats?.revenueGrowth
                ? `${stats.revenueGrowth.percentage > 0 ? "+" : ""}${stats.revenueGrowth.percentage.toFixed(1)}%`
                : "0%"
            }
            subValue={`vs. last month (${formatCurrency(stats?.revenueGrowth?.previousRevenue || 0)})`}
            icon={<TrendingUp className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <MetricCard
            title="Active Customers"
            value={stats?.totalCustomers}
            subValue={`${stats?.totalAdmins} admins`}
            icon={<Users className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <MetricCard
            title="Album Statistics"
            value={stats?.albumStats.totalAlbums}
            subValue={`${stats?.albumStats.totalImages} total images`}
            icon={<ImageIcon className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />

          <MetricCard
            title="System Activity"
            value={stats?.recentActivity.submissions.length}
            subValue="Recent submissions"
            icon={<Activity className="h-4 w-4 text-red-600" />}
            isLoading={isLoading}
          />
        </div>

        {/* Order Status and Recent Activity */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <OrderStatusDistribution
            statusDistribution={
              stats?.recentActivity.orders.reduce(
                (acc, order) => {
                  const existingStatus = acc.find(
                    (s) => s.status === order.status
                  );
                  if (existingStatus) {
                    existingStatus.count++;
                  } else {
                    acc.push({
                      status: order.status,
                      count: 1,
                      color:
                        STATUS_COLORS[
                          order.status as keyof typeof STATUS_COLORS
                        ] || STATUS_COLORS.default,
                    });
                  }
                  return acc;
                },
                [] as Array<{ status: string; count: number; color: string }>
              ) || []
            }
            isLoading={isLoading}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Recent Orders
                </CardTitle>
                <Receipt className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentActivity.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name} • {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <p
                          className={`text-sm ${
                            order.status === "delivered"
                              ? "text-green-600"
                              : order.status === "cancelled"
                                ? "text-red-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/admin/orders" className="w-full">
                <Button variant="outline" className="w-full">
                  <span>View All Orders</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number | undefined;
  subValue: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function MetricCard({
  title,
  value,
  subValue,
  icon,
  isLoading,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-muted-foreground">{subValue}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
