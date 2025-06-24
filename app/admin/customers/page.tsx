"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  User,
  FileText,
  Trash,
  UserCheck,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Building2,
  IndianRupee,
  RefreshCw,
  Pencil,
  Loader2,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, logActivity } from "@/utils/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type {
  Customer,
  CustomerFlag,
  CreateCustomerInput,
  CreateCustomerFlagInput,
} from "@/lib/types/customer";
import type { OrderSummary, OrderStatus } from "@/lib/types/order";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AddCustomerDialog } from "@/components/admin/customers/AddCustomerDialog";
import { useRole } from "@/components/admin/role-context";
import { CustomerBalanceSection } from "@/components/admin/customers/CustomerBalanceSection";

const supabase = createClient();

// Add default form state
const defaultFormState: Omit<
  Customer,
  | "id"
  | "is_active"
  | "total_orders"
  | "total_spent"
  | "created_at"
  | "updated_at"
> = {
  studio_name: "",
  email: "",
  phone: "",
  address: "",
  reference_name: null,
  reference_phone: null,
};

const orderStatusBadgeVariants: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  in_progress: "secondary",
  completed: "default",
  delivered: "default",
};

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useRole();
  const searchParams = useSearchParams();

  // State hooks
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [isFlagCustomerOpen, setIsFlagCustomerOpen] = useState(false);
  const [isResolveFlagOpen, setIsResolveFlagOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    studio_name: "",
    email: "",
    phone: "",
    address: "",
    reference_phone: "",
    reference_name: "",
  });
  const [flagReason, setFlagReason] = useState("");
  const [resolveNote, setResolveNote] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState(defaultFormState);

  // Permission checks
  const canManageCustomers = hasPermission("manage_customers");
  const canViewCustomers = hasPermission("view_customers");

  // Query hooks
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: activeFlags } = useQuery({
    queryKey: ["active-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_customer_flags")
        .select("*");

      if (error) throw error;
      return data as CustomerFlag[];
    },
  });

  const { data: allCustomerOrders } = useQuery({
    queryKey: ["all-customer-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_summary")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderSummary[];
    },
  });

  // Mutation hooks
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      // Fetch customer details before deletion for logging
      const { data: customerDetails, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      // Log customer deletion
      await logActivity("customer_deleted", {
        customer_id: customerId,
        studio_name: customerDetails.studio_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        total_orders: customerDetails.total_orders,
        total_spent: customerDetails.total_spent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
      setIsDeleteCustomerOpen(false);
    },
    onError: (error: Error) => {
      console.error("Delete mutation error:", error);
      toast.error("Failed to delete customer: " + error.message);
      setIsDeleteCustomerOpen(false);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (customer: Customer) => {
      // Fetch current customer data for comparison
      const { data: currentCustomer, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customer.id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("customers")
        .update({
          studio_name: customer.studio_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          reference_phone: customer.reference_phone ?? null,
          reference_name: customer.reference_name ?? null,
          is_active: customer.is_active,
        })
        .eq("id", customer.id);

      if (error) throw error;

      // Log customer update
      await logActivity("customer_updated", {
        customer_id: customer.id,
        studio_name: customer.studio_name,
        email: customer.email,
        phone: customer.phone,
        previous_status: currentCustomer.is_active,
        new_status: customer.is_active,
        changes: {
          studio_name: currentCustomer.studio_name !== customer.studio_name,
          email: currentCustomer.email !== customer.email,
          phone: currentCustomer.phone !== customer.phone,
          address: currentCustomer.address !== customer.address,
          reference_name:
            currentCustomer.reference_name !== customer.reference_name,
          reference_phone:
            currentCustomer.reference_phone !== customer.reference_phone,
          status: currentCustomer.is_active !== customer.is_active,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
      setIsEditCustomerOpen(false);
      setEditingCustomer(null);
    },
    onError: (error) => {
      toast.error("Failed to update customer: " + error.message);
    },
  });

  const flagCustomerMutation = useMutation({
    mutationFn: async (input: CreateCustomerFlagInput) => {
      // Get current user id
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Could not get current user");

      // Fetch customer details for logging
      const { data: customerDetails, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", input.customer_id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("customer_flags")
        .insert([{ ...input, created_by: user.id }]);
      if (error) throw error;

      // Log customer flag
      await logActivity("customer_flagged", {
        customer_id: input.customer_id,
        studio_name: customerDetails.studio_name,
        reason: input.reason,
        flagged_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flags"] });
      setIsFlagCustomerOpen(false);
      setFlagReason("");
      setSelectedCustomer(null);
      toast.success("Customer flagged successfully");
    },
    onError: (error) => {
      toast.error("Failed to flag customer: " + error.message);
    },
  });

  const resolveFlagMutation = useMutation({
    mutationFn: async ({
      flagId,
      resolutionNote,
    }: {
      flagId: string;
      resolutionNote: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch flag and customer details for logging
      const { data: flagDetails, error: fetchError } = await supabase
        .from("customer_flags")
        .select("*, customers(*)")
        .eq("id", flagId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("customer_flags")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_note: resolutionNote,
        })
        .eq("id", flagId);

      if (error) throw error;

      // Log flag resolution
      await logActivity("customer_flag_resolved", {
        customer_id: flagDetails.customer_id,
        studio_name: flagDetails.customers.studio_name,
        flag_id: flagId,
        reason: flagDetails.reason,
        resolution_note: resolutionNote,
        resolved_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flags"] });
      setIsResolveFlagOpen(false);
      setResolveNote("");
      toast.success("Customer flag resolved successfully");
    },
    onError: (error) => {
      toast.error("Failed to resolve flag: " + error.message);
    },
  });

  // Effect hooks
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add") {
      setIsAddCustomerOpen(true);
    }
  }, [searchParams]);

  // Memoized values
  const customerStats = useMemo(() => {
    if (!allCustomerOrders) return new Map();

    const stats = new Map<
      string,
      {
        totalOrders: number;
        totalSpent: number;
        activeOrders: number;
        pendingAmount: number;
      }
    >();

    allCustomerOrders.forEach((order) => {
      const customerId = order.customer_id;
      const currentStats = stats.get(customerId) || {
        totalOrders: 0,
        totalSpent: 0,
        activeOrders: 0,
        pendingAmount: 0,
      };

      stats.set(customerId, {
        totalOrders: currentStats.totalOrders + 1,
        totalSpent: currentStats.totalSpent + order.amount_paid,
        activeOrders:
          currentStats.activeOrders + (order.status !== "delivered" ? 1 : 0),
        pendingAmount:
          currentStats.pendingAmount + (order.total_amount - order.amount_paid),
      });
    });

    return stats;
  }, [allCustomerOrders]);

  const filteredCustomers = useMemo(() => {
    if (!customersData) return [];

    return customersData.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.studio_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);

      const matchesFilter =
        customerFilter === "all" ||
        (customerFilter === "active" && customer.is_active) ||
        (customerFilter === "inactive" && !customer.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [customersData, searchTerm, customerFilter]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name":
          return a.studio_name.localeCompare(b.studio_name);
        default:
          return 0;
      }
    });
  }, [filteredCustomers, sortBy]);

  // Callback hooks
  const handleAddCustomerOpenChange = useCallback((open: boolean) => {
    setIsAddCustomerOpen(open);
    if (!open) {
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search
      );
    }
  }, []);

  const handleStatusChange = useCallback(
    (customer: Customer) => {
      updateCustomerMutation.mutate({
        ...customer,
        is_active: !customer.is_active,
      });
    },
    [updateCustomerMutation]
  );

  const handleRowClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  }, []);

  const isCustomerFlagged = useCallback(
    (customerId: string) => {
      return activeFlags?.some((flag) => flag.customer_id === customerId);
    },
    [activeFlags]
  );

  const handleFlagCustomer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCustomer) return;

      flagCustomerMutation.mutate({
        customer_id: selectedCustomer.id,
        reason: flagReason,
      });
    },
    [selectedCustomer, flagReason, flagCustomerMutation]
  );

  const handleResolveFlag = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCustomer) return;

      const activeFlag = activeFlags?.find(
        (flag) => flag.customer_id === selectedCustomer.id
      );
      if (!activeFlag) return;

      resolveFlagMutation.mutate({
        flagId: activeFlag.id,
        resolutionNote: resolveNote,
      });
    },
    [selectedCustomer, activeFlags, resolveNote, resolveFlagMutation]
  );

  const handleDeleteCustomer = useCallback(() => {
    if (!selectedCustomer?.id) {
      console.error("No customer selected for deletion");
      return;
    }
    try {
      deleteCustomerMutation.mutate(selectedCustomer.id);
    } catch (error) {
      console.error("Error in handleDeleteCustomer:", error);
    }
  }, [selectedCustomer, deleteCustomerMutation]);

  const handleEditCustomer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCustomer) return;

      updateCustomerMutation.mutate({
        ...editingCustomer,
        ...editForm,
      });
    },
    [editingCustomer, editForm, updateCustomerMutation]
  );

  // Add new query for customer orders
  const { data: customerOrders } = useQuery({
    queryKey: ["customer-orders", selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];

      const { data, error } = await supabase
        .from("order_summary")
        .select("*")
        .eq("customer_id", selectedCustomer.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderSummary[];
    },
    enabled: !!selectedCustomer?.id,
  });

  // Calculate customer order statistics
  const customerOrderStats = useMemo(() => {
    if (!customerOrders)
      return {
        activeOrders: 0,
        totalSpent: 0,
        pendingAmount: 0,
      };

    const activeOrders = customerOrders.filter(
      (order) => order.status !== "delivered"
    ).length;

    const totalSpent = customerOrders.reduce(
      (sum, order) => sum + order.amount_paid,
      0
    );

    const pendingAmount = customerOrders.reduce(
      (sum, order) => sum + order.balance_amount,
      0
    );

    return {
      activeOrders,
      totalSpent,
      pendingAmount,
    };
  }, [customerOrders]);

  // If user doesn't have view permission, show access denied
  if (!canViewCustomers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingCustomers) {
    return <div>Loading...</div>;
  }

  // Rest of the component code...

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer profiles and information
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCustomers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (customersData?.length ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCustomers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (customersData?.filter((customer) => customer.is_active)
                  .length ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCustomers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (customersData?.reduce(
                  (acc, customer) => acc + (customer.total_orders ?? 0),
                  0
                ) ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Orders</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCustomers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : customersData && customersData.length > 0 ? (
                (
                  customersData.reduce(
                    (acc, customer) => acc + (customer.total_orders ?? 0),
                    0
                  ) / customersData.length
                ).toFixed(1)
              ) : (
                "0.0"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-100 hover:bg-red-600 hover:text-white transition-colors group"
                  >
                    <Filter className="mr-2 h-4 w-4 text-red-600 group-hover:text-white transition-colors" />
                    {(() => {
                      switch (customerFilter) {
                        case "active":
                          return "Active";
                        case "inactive":
                          return "Inactive";
                        case "flagged":
                          return "Flagged";
                        case "unflagged":
                          return "Unflagged";
                        default:
                          return "All";
                      }
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setCustomerFilter("all")}>
                    All Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomerFilter("active")}>
                    Active Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCustomerFilter("inactive")}
                  >
                    Inactive Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCustomerFilter("flagged")}
                  >
                    Flagged Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCustomerFilter("unflagged")}
                  >
                    Unflagged Customers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-100 hover:bg-red-600 hover:text-white transition-colors group"
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4 text-red-600 group-hover:text-white transition-colors" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("most-orders")}>
                    Most Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("balance-high")}>
                    Pending Amount High-Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("balance-low")}>
                    Pending Amount Low-High
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {canManageCustomers && (
                <Button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Customers Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm || customerFilter !== "all"
                ? "No customers match your current filters. Try adjusting your search criteria or clearing filters."
                : "There are no customers yet. Add your first customer to get started."}
            </p>
            {(searchTerm || customerFilter !== "all") && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-red-100 hover:bg-red-50"
                  onClick={() => {
                    setSearchTerm("");
                    setCustomerFilter("all");
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-100">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-red-50/50">
                <TableHead>Name / Studio</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-red-50/50"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell className="font-medium">
                    {customer.studio_name}
                    {isCustomerFlagged(customer.id) && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.is_active ? "default" : "secondary"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(customer);
                      }}
                    >
                      {customer.is_active ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customerStats.get(customer.id)?.totalOrders ?? 0}
                  </TableCell>
                  <TableCell>
                    ₹
                    {customerStats
                      .get(customer.id)
                      ?.totalSpent.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell>
                    ₹
                    {(
                      customerStats.get(customer.id)?.pendingAmount ?? 0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/admin/orders?customer=${customer.id}`
                            );
                          }}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          View Orders
                        </DropdownMenuItem>
                        {canManageCustomers && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(customer);
                              }}
                            >
                              {customer.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Mark Inactive
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Mark Active
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCustomer(customer);
                                setEditForm({
                                  studio_name: customer.studio_name,
                                  email: customer.email,
                                  phone: customer.phone,
                                  address: customer.address,
                                  reference_name: customer.reference_name,
                                  reference_phone: customer.reference_phone,
                                });
                                setIsEditCustomerOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer);
                                setIsDeleteCustomerOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Customer
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isFlagCustomerOpen} onOpenChange={setIsFlagCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Customer</DialogTitle>
            <DialogDescription>
              Add a reason for flagging this customer. This will be visible when
              creating orders.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFlagCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                required
                placeholder="Enter the reason for flagging this customer..."
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full">
              Flag Customer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Side Panel */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="space-y-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold">
                      {selectedCustomer.studio_name}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          selectedCustomer.is_active ? "default" : "secondary"
                        }
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(selectedCustomer);
                        }}
                      >
                        {selectedCustomer.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      {isCustomerFlagged(selectedCustomer.id) && (
                        <Badge
                          variant="destructive"
                          className="flex items-center"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="hover:underline"
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="hover:underline"
                    >
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div className="flex items-start text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="whitespace-pre-wrap">
                      {selectedCustomer.address}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Building2 className="w-4 h-4 mr-2" />
                    Business Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Orders
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedCustomer.total_orders}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Active Orders
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        {customerOrderStats.activeOrders}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Spent
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        {customerOrderStats.totalSpent.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Pending Amount
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        {customerOrderStats.pendingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Add Customer Balance Section */}
                <CustomerBalanceSection customer={selectedCustomer} />

                {(selectedCustomer.reference_name ||
                  selectedCustomer.reference_phone) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium flex items-center mb-3">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reference Information
                      </h3>
                      <div className="space-y-2">
                        {selectedCustomer.reference_name && (
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedCustomer.reference_name}</span>
                          </div>
                        )}
                        {selectedCustomer.reference_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            <a
                              href={`tel:${selectedCustomer.reference_phone}`}
                              className="hover:underline"
                            >
                              {selectedCustomer.reference_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Clock className="w-4 h-4 mr-2" />
                    System Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>
                        Created:{" "}
                        {format(new Date(selectedCustomer.created_at), "PPpp")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>
                        Last Updated:{" "}
                        {format(new Date(selectedCustomer.updated_at), "PPpp")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  All Orders
                </h3>
                <div className="space-y-4">
                  {customerOrders?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start space-x-3 text-sm border rounded-lg p-3 hover:bg-red-50/50 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/admin/orders?order=${order.id}&customer=${selectedCustomer.id}`
                        )
                      }
                    >
                      <div className="mt-0.5">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            Order #{order.order_number}
                          </p>
                          <Badge
                            variant={orderStatusBadgeVariants[order.status]}
                            className="ml-2"
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1).replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <p>₹{order.total_amount.toLocaleString()}</p>
                          <p>{format(new Date(order.created_at), "PPp")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {customerOrders?.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No orders found
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <SheetFooter className="flex-row gap-2 sm:flex-row">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      router.push(
                        `/admin/orders?customer=${selectedCustomer.id}`
                      )
                    }
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                  {isCustomerFlagged(selectedCustomer.id) ? (
                    <Button
                      variant="outline"
                      className="flex-1 border-green-200 hover:bg-green-50 text-green-600"
                      onClick={() => {
                        setIsResolveFlagOpen(true);
                        setIsDetailsOpen(false);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Resolve Flag
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 border-red-100 hover:bg-red-50"
                      onClick={() => {
                        setIsFlagCustomerOpen(true);
                        setIsDetailsOpen(false);
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Flag Customer
                    </Button>
                  )}
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Customer Modal */}
      <Dialog
        open={isEditCustomerOpen}
        onOpenChange={(open) => {
          if (open && editingCustomer) {
            setEditForm({
              studio_name: editingCustomer.studio_name,
              email: editingCustomer.email,
              phone: editingCustomer.phone,
              address: editingCustomer.address,
              reference_phone: editingCustomer.reference_phone ?? null,
              reference_name: editingCustomer.reference_name ?? null,
            });
          } else {
            setEditForm(defaultFormState);
            setEditingCustomer(null);
          }
          setIsEditCustomerOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-900">
              Edit Customer
            </DialogTitle>
            <DialogDescription>
              Update customer information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_studio_name" className="text-red-900">
                  Name / Studio Name *
                </Label>
                <Input
                  id="edit_studio_name"
                  value={editForm.studio_name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      studio_name: e.target.value,
                    }))
                  }
                  placeholder="John Doe / ABC Photography"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_email" className="text-red-900">
                    Email Address *
                  </Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="customer@example.com"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_phone" className="text-red-900">
                    Contact Number *
                  </Label>
                  <Input
                    id="edit_phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+91 98765 43210"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_address" className="text-red-900">
                  Address *
                </Label>
                <Textarea
                  id="edit_address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="123 Main St, City, State"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit_reference_phone"
                    className="text-red-900"
                  >
                    Reference Phone (Optional)
                  </Label>
                  <Input
                    id="edit_reference_phone"
                    value={editForm.reference_phone || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        reference_phone: e.target.value || null,
                      }))
                    }
                    placeholder="+91 98765 43210"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_reference_name" className="text-red-900">
                    Reference Name (Optional)
                  </Label>
                  <Input
                    id="edit_reference_name"
                    value={editForm.reference_name || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        reference_name: e.target.value || null,
                      }))
                    }
                    placeholder="Jane Doe"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditCustomerOpen(false);
                  setEditingCustomer(null);
                  setEditForm(defaultFormState);
                }}
                className="border-red-100 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !editForm.studio_name ||
                  !editForm.email ||
                  !editForm.phone ||
                  !editForm.address
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Confirmation */}
      <AlertDialog
        open={isDeleteCustomerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteCustomerOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomer?.studio_name}?
              This action cannot be undone. All associated data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteCustomerOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("Delete confirmation clicked");
                handleDeleteCustomer();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={handleAddCustomerOpenChange}
        onCustomerCreated={(customer) => {
          setNewCustomer({
            studio_name: customer.studio_name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            reference_phone: customer.reference_phone ?? "",
            reference_name: customer.reference_name ?? "",
          });
          setIsAddCustomerOpen(false);
          toast.success("Customer added successfully");
        }}
        initialValues={newCustomer}
      />

      {/* Resolve Flag Dialog */}
      <Dialog open={isResolveFlagOpen} onOpenChange={setIsResolveFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Customer Flag</DialogTitle>
            <DialogDescription>
              Add a resolution note to explain why the flag is being removed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolveFlag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution_note">Resolution Note</Label>
              <Textarea
                id="resolution_note"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                required
                placeholder="Enter the reason for resolving this flag..."
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={resolveFlagMutation.isPending}
            >
              {resolveFlagMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resolve Flag
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
