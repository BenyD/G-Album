"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getDashboardStats } from "@/lib/services/dashboard";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Users,
  Package,
  Mail,
  FileText,
  Command,
  Settings,
  Loader2,
  // Image,
  Album,
  User,
  ImageIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { formatDistanceToNow } from "date-fns";
// import { Separator } from "@/components/ui/separator";
import { getStorageStats } from "@/lib/services/storage";

interface DashboardStats {
  totalAlbums: number;
  totalGalleryImages: number;
  totalNewsletterSubscribers: number;
  totalFormSubmissions: number;
  totalOrders: number;
  totalCustomers: number;
  totalAdmins: number;
  storageUsage: {
    used: number;
    total: number;
  };
  albumStats: {
    totalAlbums: number;
    totalImages: number;
    averageImagesPerAlbum: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  recentCustomers: Array<{
    id: string;
    studio_name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_spent: number;
    created_at: string;
  }>;
  recentSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    totalSize: number;
    fileCount: number;
    breakdown: {
      [key: string]: {
        size: number;
        count: number;
      };
    };
  } | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  const storageStatsFetched = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function checkUserRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to access this page");
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role_id, status, roles(name)")
        .eq("id", user.id)
        .single();

      if (!profile || profile.status !== "approved") {
        setError("You do not have permission to access this page");
        setIsLoading(false);
        return;
      }

      // Check if the user is a super admin
      setIsSuperAdmin(profile.roles?.[0]?.name === "super_admin");
    }

    async function loadDashboardData() {
      try {
        const dashboardStats = await getDashboardStats();
        if (mounted) {
          setStats(dashboardStats);
          setIsLoading(false);

          // Load storage stats only if we haven't fetched them yet
          if (!storageStatsFetched.current) {
            loadStorageStats();
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (mounted) {
          setError("Failed to load dashboard data");
          setIsLoading(false);
        }
      }
    }

    async function loadStorageStats() {
      if (storageStatsFetched.current) return;

      try {
        setIsStorageLoading(true);
        const data = await getStorageStats();
        if (mounted) {
          setStorageStats(data);
          storageStatsFetched.current = true;
        }
      } catch (error) {
        console.error("Error loading storage stats:", error);
      } finally {
        if (mounted) {
          setIsStorageLoading(false);
        }
      }
    }

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const customersSubscription = supabase
      .channel("customers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const newsletterSubscription = supabase
      .channel("newsletter_subscribers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "newsletter_subscribers" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const formSubmissionsSubscription = supabase
      .channel("contact_submissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_submissions" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    checkUserRole();
    loadDashboardData();

    return () => {
      mounted = false;
      ordersSubscription.unsubscribe();
      customersSubscription.unsubscribe();
      newsletterSubscription.unsubscribe();
      formSubmissionsSubscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  // At this point, stats is guaranteed to be non-null
  const dashboardStats = stats!;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="text-red-600"
          >
            <Command className="mr-2 h-4 w-4" />
            Quick Actions
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/settings")}
              className="text-red-600"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardStats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.recentCustomers.length} recent customers
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardStats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.recentOrders.length} recent orders
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Newsletter Subscribers
            </CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardStats.totalNewsletterSubscribers}
            </div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Form Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardStats.totalFormSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.recentSubmissions.length} recent submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {isStorageLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Total Storage Used
                    </span>
                    <span className="text-sm font-medium">
                      {(
                        (storageStats?.totalSize || 0) /
                        (1024 * 1024 * 1024)
                      ).toFixed(2)}{" "}
                      GB /{" "}
                      {(
                        dashboardStats.storageUsage.total /
                        (1024 * 1024 * 1024)
                      ).toFixed(2)}{" "}
                      GB
                    </span>
                  </div>
                  <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((storageStats?.totalSize || 0) /
                            dashboardStats.storageUsage.total) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {storageStats?.breakdown &&
                    Object.entries(storageStats.breakdown).map(
                      ([category, data]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {category === "Album Images" ? (
                              <Album className="h-4 w-4 text-red-600" />
                            ) : (
                              <User className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {data.count} files
                            </span>
                            <span className="text-sm font-medium">
                              {(data.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                            </span>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Album Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Total Albums
                    </span>
                    <Album className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {dashboardStats.albumStats.totalAlbums}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Total Images
                    </span>
                    <ImageIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {dashboardStats.albumStats.totalImages}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Average Images per Album
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {dashboardStats.albumStats.averageImagesPerAlbum}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 border-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Studio</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.recentCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.studio_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.total_orders}</TableCell>
                    <TableCell>
                      {formatCurrency(customer.total_spent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.recentSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.name}</TableCell>
                    <TableCell>
                      {submission.email || submission.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === "New"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(submission.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                router.push("/admin/orders/new");
                setOpen(false);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Order
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/customers/new");
                setOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Add New Customer
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                router.push("/admin/orders");
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              Orders
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/customers");
                setOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Customers
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/newsletter");
                setOpen(false);
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Newsletter
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/submissions");
                setOpen(false);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Form Submissions
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
