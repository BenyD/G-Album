"use client"

import { useRole } from "@/components/admin/role-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BarChart3,
  Calendar,
  Download,
  Info,
  Lock,
  TrendingUp,
  Users,
  ShoppingCart,
  Camera,
  DollarSign,
  Package,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleBasedContent } from "@/components/admin/role-based-content"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AnalyticsPage() {
  const { role, hasPermission } = useRole()

  const canViewAnalytics = hasPermission("view_analytics")

  // Sample data for charts
  const revenueData = [
    { month: "Jan", revenue: 12500, orders: 45 },
    { month: "Feb", revenue: 15200, orders: 52 },
    { month: "Mar", revenue: 18900, orders: 68 },
    { month: "Apr", revenue: 16700, orders: 59 },
    { month: "May", revenue: 21300, orders: 74 },
    { month: "Jun", revenue: 19800, orders: 67 },
  ]

  const albumPerformance = [
    { name: "Luxury Album Pad", orders: 45, revenue: 13500 },
    { name: "Roshe Album Pad", orders: 38, revenue: 9500 },
    { name: "Premium Wedding Album", orders: 32, revenue: 12800 },
    { name: "Classic Photo Album", orders: 28, revenue: 7000 },
    { name: "Modern Portfolio", orders: 22, revenue: 6600 },
  ]

  const orderStatusData = [
    { name: "Completed", value: 156, color: "#22c55e" },
    { name: "In Progress", value: 43, color: "#f59e0b" },
    { name: "Pending", value: 28, color: "#ef4444" },
    { name: "Cancelled", value: 12, color: "#6b7280" },
  ]

  const customerData = [
    { month: "Jan", new: 12, returning: 33 },
    { month: "Feb", new: 18, returning: 34 },
    { month: "Mar", new: 25, returning: 43 },
    { month: "Apr", new: 19, returning: 40 },
    { month: "May", new: 28, returning: 46 },
    { month: "Jun", new: 22, returning: 45 },
  ]

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Business Analytics Dashboard</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>.
          {canViewAnalytics
            ? " You have access to view business analytics data."
            : " You don't have permission to view analytics."}
        </AlertDescription>
      </Alert>

      {!canViewAnalytics && (
        <Alert variant="default" className="mb-4 bg-red-50 border-red-200 text-red-800">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You don't have permission to view analytics. This feature is only available to Superadmin and Admin users.
          </AlertDescription>
        </Alert>
      )}

      <RoleBasedContent
        permissions={["view_analytics"]}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Business Analytics Dashboard</CardTitle>
              <CardDescription>This feature is restricted to users with analytics permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Contact an administrator to request access to analytics data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Business Analytics</h2>
          <div className="flex items-center gap-2">
            <Select defaultValue="30days">
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,24,400</div>
              <p className="text-xs text-muted-foreground">+18.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">365</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">+8.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3,408</div>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Volume</CardTitle>
                  <CardDescription>Number of orders per month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Wedding Albums", revenue: 45600, percentage: 37 },
                    { category: "Portrait Albums", revenue: 32400, percentage: 26 },
                    { category: "Event Albums", revenue: 28200, percentage: 23 },
                    { category: "Custom Prints", revenue: 18200, percentage: 14 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm text-slate-500">₹{item.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="albums" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Albums</CardTitle>
                  <CardDescription>Albums by order volume and revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={albumPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Album Revenue</CardTitle>
                  <CardDescription>Revenue generated by each album type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={albumPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Album Performance Metrics</CardTitle>
                <CardDescription>Detailed performance data for each album type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Album Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Orders</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Revenue</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Avg. Price</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {albumPerformance.map((album, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">{album.name}</td>
                          <td className="p-4 align-middle">{album.orders}</td>
                          <td className="p-4 align-middle">₹{album.revenue.toLocaleString()}</td>
                          <td className="p-4 align-middle">
                            ₹{Math.round(album.revenue / album.orders).toLocaleString()}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current status of all orders</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Processing Time</CardTitle>
                  <CardDescription>Average time to complete orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">5.2 days</div>
                      <p className="text-sm text-muted-foreground">Average processing time</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { type: "Rush Orders", time: "2.1 days", count: 23 },
                        { type: "Standard Orders", time: "5.8 days", count: 156 },
                        { type: "Custom Orders", time: "8.4 days", count: 45 },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.type}</p>
                            <p className="text-sm text-muted-foreground">{item.count} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Order Trends</CardTitle>
                <CardDescription>Order volume and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">98.2%</div>
                    <p className="text-sm text-green-700">Completion Rate</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">+15%</div>
                    <p className="text-sm text-blue-700">Growth This Month</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">67</div>
                    <p className="text-sm text-orange-700">Orders This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="new" stackId="a" fill="#dc2626" name="New Customers" />
                      <Bar dataKey="returning" stackId="a" fill="#f87171" name="Returning Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Lifetime Value</CardTitle>
                  <CardDescription>Average value per customer segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">₹12,450</div>
                      <p className="text-sm text-muted-foreground">Average Customer LTV</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { segment: "Premium Customers", value: "₹28,500", count: 45 },
                        { segment: "Regular Customers", value: "₹15,200", count: 128 },
                        { segment: "New Customers", value: "₹6,800", count: 75 },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.segment}</p>
                            <p className="text-sm text-muted-foreground">{item.count} customers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Customer feedback and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <p className="text-sm text-green-700">Average Rating</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <p className="text-sm text-blue-700">Satisfaction Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">87%</div>
                    <p className="text-sm text-purple-700">Repeat Rate</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Camera className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">156</div>
                    <p className="text-sm text-orange-700">Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </RoleBasedContent>
    </div>
  )
}
