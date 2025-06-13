"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
  Search,
  Settings,
  Loader2,
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
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

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

      loadDashboardData();
    }

    async function loadDashboardData() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
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

    return () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your business performance and recent activity
        </p>
      </div>
      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-red-100 hover:bg-red-50"
            onClick={() => setOpen(true)}
          >
            <Command className="h-4 w-4" />
            Quick Actions
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
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
              {stats.userStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.userStats.active} active customers
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
              {stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.recentOrders.length} recent orders
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
              {stats.totalNewsletterSubscribers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.newSubscribersThisMonth} new this month
            </p>
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
              {stats.totalFormSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.recentFormSubmissions.length} new this month
            </p>
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
                {stats.recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "pending"
                              ? "warning"
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentCustomers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.studio_name}</TableCell>
                    <TableCell>{customer.contact_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "active"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {customer.status}
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
            <CardTitle className="text-red-900">
              Recent Form Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentFormSubmissions.map((submission: any) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === "Replied"
                            ? "success"
                            : "secondary"
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
                router.push("/admin/customers/new");
                setOpen(false);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Customer
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/orders/new");
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              New Order
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/settings");
                setOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
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
                router.push("/admin/orders");
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              Orders
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/forms");
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
