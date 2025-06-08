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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useMemo } from "react";

export default function DashboardPage() {
  const { role, hasPermission, isLoading: roleLoading } = useRole();
  const { isInitialized, isLoading: authLoading } = useAuth();

  const supabaseUsage = useMemo(
    () => ({
      storage: {
        used: 0.73, // GB
        total: 1, // GB
        percentage: 73,
      },
      database: {
        used: 45.2, // MB
        total: 500, // MB
        percentage: 9,
      },
      bandwidth: {
        used: 8.4, // GB this month
        total: 5, // GB per month (free tier)
        percentage: 168, // Over limit
        resetDate: "2024-02-01",
      },
      auth: {
        users: 156,
        total: 50000, // Free tier limit
        percentage: 0.3,
      },
      realtime: {
        connections: 12,
        total: 200, // Free tier limit
        percentage: 6,
      },
      edgeFunctions: {
        invocations: 2840,
        total: 500000, // Free tier limit per month
        percentage: 0.6,
      },
    }),
    []
  );

  const storageBreakdown = useMemo(
    () => [
      { category: "Album Images", size: 0.45, percentage: 62 },
      { category: "Gallery Images", size: 0.18, percentage: 25 },
      { category: "Profile Pictures", size: 0.06, percentage: 8 },
      { category: "System Files", size: 0.04, percentage: 5 },
    ],
    []
  );

  const usageHistory = useMemo(
    () => [
      { month: "Sep", storage: 0.32, bandwidth: 3.2, users: 89 },
      { month: "Oct", storage: 0.48, bandwidth: 4.8, users: 112 },
      { month: "Nov", storage: 0.61, bandwidth: 6.1, users: 134 },
      { month: "Dec", storage: 0.69, bandwidth: 7.8, users: 145 },
      { month: "Jan", storage: 0.73, bandwidth: 8.4, users: 156 },
    ],
    []
  );

  if (!isInitialized || authLoading || roleLoading) {
    console.log("Loading dashboard...", {
      isInitialized,
      authLoading,
      roleLoading,
    });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role || role === "guest") {
    console.log("Access denied: Invalid role", { role });
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

  console.log("Rendering dashboard with role:", role);

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Dashboard Overview</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing the dashboard as a <strong>{role}</strong>. Monitor
          your Supabase usage and business metrics.
        </AlertDescription>
      </Alert>

      {/* Supabase Usage Alert */}
      {supabaseUsage.bandwidth.percentage > 100 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <Zap className="h-4 w-4" />
          <AlertTitle>Bandwidth Limit Exceeded</AlertTitle>
          <AlertDescription>
            You've used {supabaseUsage.bandwidth.used}GB of your{" "}
            {supabaseUsage.bandwidth.total}GB monthly bandwidth limit. Consider
            upgrading your plan or optimizing image sizes.
          </AlertDescription>
        </Alert>
      )}

      {supabaseUsage.storage.percentage > 80 && (
        <Alert className="bg-orange-50 border-orange-200">
          <HardDrive className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Storage Warning</AlertTitle>
          <AlertDescription className="text-orange-700">
            You're using {supabaseUsage.storage.percentage}% of your storage
            space. Consider cleaning up unused files.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Usage</TabsTrigger>
          {hasPermission("view_analytics") && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
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
                <div className="text-2xl font-bold">568</div>
                <p className="text-xs text-muted-foreground">
                  +24% from last month
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
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">
                  +4% from last month
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
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supabase Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supabaseUsage.storage.used}GB
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={supabaseUsage.storage.percentage}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {supabaseUsage.storage.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {supabaseUsage.storage.total}GB limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Database Size
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supabaseUsage.database.used}MB
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={supabaseUsage.database.percentage}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {supabaseUsage.database.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {supabaseUsage.database.total}MB limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supabaseUsage.bandwidth.used}GB
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={Math.min(supabaseUsage.bandwidth.percentage, 100)}
                    className={`flex-1 h-2 ${
                      supabaseUsage.bandwidth.percentage > 100
                        ? "[&>div]:bg-red-500"
                        : ""
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      supabaseUsage.bandwidth.percentage > 100
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {supabaseUsage.bandwidth.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {supabaseUsage.bandwidth.total}GB/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Auth Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supabaseUsage.auth.users}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={supabaseUsage.auth.percentage}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {supabaseUsage.auth.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {supabaseUsage.auth.total.toLocaleString()} limit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest customer orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "ORD-001",
                      customer: "Priya Sharma",
                      type: "Luxury Album",
                      amount: "₹8,500",
                      status: "In Progress",
                      date: "2 hours ago",
                    },
                    {
                      id: "ORD-002",
                      customer: "Rajesh Kumar",
                      type: "Regular Album",
                      amount: "₹3,200",
                      status: "Finished",
                      date: "5 hours ago",
                    },
                    {
                      id: "ORD-003",
                      customer: "Anita Patel",
                      type: "Double Lock Box Album",
                      amount: "₹5,800",
                      status: "Pending",
                      date: "1 day ago",
                    },
                    {
                      id: "ORD-004",
                      customer: "Vikram Singh",
                      type: "Roshe Album Pad",
                      amount: "₹12,000",
                      status: "Delivered",
                      date: "2 days ago",
                    },
                  ].map((order, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {order.id} - {order.customer}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.type} • {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {order.amount}
                        </span>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Finished"
                              ? "secondary"
                              : order.status === "In Progress"
                              ? "outline-solid"
                              : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Storage Breakdown</CardTitle>
                <CardDescription>
                  How your storage space is being used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageBreakdown.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">{item.size}GB</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Used</span>
                      <span>
                        {supabaseUsage.storage.used}GB /{" "}
                        {supabaseUsage.storage.total}GB
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Storage Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  File Storage
                </CardTitle>
                <CardDescription>1GB limit on free tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {supabaseUsage.storage.used}GB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of {supabaseUsage.storage.total}GB used
                    </p>
                  </div>
                  <Progress
                    value={supabaseUsage.storage.percentage}
                    className="h-3"
                  />
                  <div className="text-center">
                    <Badge
                      variant={
                        supabaseUsage.storage.percentage > 80
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {supabaseUsage.storage.percentage}% Used
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
                <CardDescription>500MB limit on free tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {supabaseUsage.database.used}MB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of {supabaseUsage.database.total}MB used
                    </p>
                  </div>
                  <Progress
                    value={supabaseUsage.database.percentage}
                    className="h-3"
                  />
                  <div className="text-center">
                    <Badge variant="secondary">
                      {supabaseUsage.database.percentage}% Used
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bandwidth Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Bandwidth
                </CardTitle>
                <CardDescription>5GB/month on free tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {supabaseUsage.bandwidth.used}GB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of {supabaseUsage.bandwidth.total}GB/month used
                    </p>
                  </div>
                  <Progress
                    value={Math.min(supabaseUsage.bandwidth.percentage, 100)}
                    className={`h-3 ${
                      supabaseUsage.bandwidth.percentage > 100
                        ? "[&>div]:bg-red-500"
                        : ""
                    }`}
                  />
                  <div className="text-center">
                    <Badge
                      variant={
                        supabaseUsage.bandwidth.percentage > 100
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {supabaseUsage.bandwidth.percentage}% Used
                    </Badge>
                  </div>
                  {supabaseUsage.bandwidth.percentage > 100 && (
                    <p className="text-xs text-red-600 text-center">
                      Resets on {supabaseUsage.bandwidth.resetDate}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Supabase Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Authentication
                </CardTitle>
                <CardDescription>50,000 users on free tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-medium">
                      {supabaseUsage.auth.users}
                    </span>
                  </div>
                  <Progress
                    value={supabaseUsage.auth.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {supabaseUsage.auth.percentage}% of limit used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Realtime
                </CardTitle>
                <CardDescription>200 concurrent connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="font-medium">
                      {supabaseUsage.realtime.connections}
                    </span>
                  </div>
                  <Progress
                    value={supabaseUsage.realtime.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {supabaseUsage.realtime.percentage}% of limit used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Edge Functions
                </CardTitle>
                <CardDescription>500K invocations/month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Invocations</span>
                    <span className="font-medium">
                      {supabaseUsage.edgeFunctions.invocations.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={supabaseUsage.edgeFunctions.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {supabaseUsage.edgeFunctions.percentage}% of monthly limit
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>
                Track your Supabase usage over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="storage"
                    stroke="#dc2626"
                    strokeWidth={2}
                    name="Storage (GB)"
                  />
                  <Line
                    type="monotone"
                    dataKey="bandwidth"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Bandwidth (GB)"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
                  Revenue trends over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: "Aug", revenue: 12000 },
                      { month: "Sep", revenue: 15000 },
                      { month: "Oct", revenue: 18000 },
                      { month: "Nov", revenue: 22000 },
                      { month: "Dec", revenue: 25000 },
                      { month: "Jan", revenue: 28000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#dc2626"
                      fill="#dc2626"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>
                  Current order status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { status: "Completed", count: 156 },
                      { status: "In Progress", count: 43 },
                      { status: "Pending", count: 28 },
                      { status: "Cancelled", count: 12 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
