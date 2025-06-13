"use client";

import { useRole } from "@/components/admin/role-context";
import { useAuth } from "@/components/admin/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ImageIcon,
  Mail,
  MessageSquare,
  Info,
  Users,
  Package,
  Database,
  HardDrive,
  Activity,
  Zap,
  Server,
  Loader2,
  Plus,
  FileText,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardStats, getUsageHistory } from "@/lib/services/dashboard";
import { getRecentOrders, type Order } from "@/lib/services/orders";
import { getRecentCustomers, type Customer } from "@/lib/services/customers";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { role, hasPermission, isLoading: roleLoading } = useRole();
  const { isInitialized, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, ordersData, customersData, historyData] =
          await Promise.all([
            getDashboardStats(),
            getRecentOrders(),
            getRecentCustomers(),
            getUsageHistory(),
          ]);

        setStats(statsData);
        setRecentOrders(ordersData);
        setRecentCustomers(customersData);
        setUsageHistory(historyData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    if (isInitialized && !authLoading && !roleLoading) {
      loadDashboardData();
    }
  }, [isInitialized, authLoading, roleLoading]);

  if (!isInitialized || authLoading || roleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role || role === "guest") {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view this dashboard. Please contact an
          administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Usage</TabsTrigger>
          {hasPermission("view_analytics") && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push("/admin/customers/new")}
                >
                  <UserPlus className="h-6 w-6" />
                  <span>New Customer</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push("/admin/orders/new")}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>New Order</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push("/admin/albums/new")}
                >
                  <ImageIcon className="h-6 w-6" />
                  <span>New Album</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push("/admin/gallery/new")}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add to Gallery</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Albums
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAlbums}</div>
                <p className="text-xs text-muted-foreground">
                  Active albums in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gallery Images
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalGalleryImages}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total images in gallery
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Newsletter Subscribers
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalNewsletterSubscribers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Form Submissions
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalFormSubmissions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total submissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(order.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          ${order.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>Latest registered customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {customer.studio_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(customer.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  {stats.storageUsage.used.toFixed(2)}GB of{" "}
                  {stats.storageUsage.total}GB used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used Space</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.storageUsage.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={stats.storageUsage.percentage} />
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Storage Breakdown
                  </h4>
                  <div className="space-y-2">
                    {stats.storageBreakdown.map((item: any) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="text-sm font-medium">
                          {item.size.toFixed(2)}GB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Usage</CardTitle>
                <CardDescription>
                  {stats.databaseUsage.used.toFixed(2)}MB of{" "}
                  {stats.databaseUsage.total}MB used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used Space</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.databaseUsage.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={stats.databaseUsage.percentage} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>
                Storage and database usage over the last 5 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="storage"
                      name="Storage (GB)"
                      fill="#8884d8"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="database"
                      name="Database (MB)"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {hasPermission("view_analytics") && (
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and insights (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analytics features are under development. Check back soon for
                  detailed insights and reporting.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
