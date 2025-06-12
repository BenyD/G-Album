"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Trash,
  ShoppingBag,
  RefreshCw,
  Loader2,
  Clock,
  CreditCard,
  Receipt,
  CheckCircle2,
  CircleDollarSign,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  IndianRupee,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { debounce } from "lodash";
import type { Customer } from "@/lib/types/customer";
import type {
  OrderStatus,
  OrderSummary,
  PaymentMethod,
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderPaymentInput,
} from "@/lib/types/order";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { useRole } from "@/components/admin/role-context";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient();

const defaultOrderInput: CreateOrderInput = {
  customer_id: "",
  total_amount: 0,
  amount_paid: undefined,
  payment_method: undefined,
  notes: "",
};

const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Other"];

const orderStatusBadgeVariants: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  in_progress: "secondary",
  completed: "default",
  delivered: "default",
};

// Add type for OrderPayment
interface OrderPayment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  notes?: string;
  created_by: string;
}

// Add OrderLog interface
interface OrderLog {
  id: string;
  order_id: string;
  action: string;
  details: string;
  created_at: string;
  created_by: string;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "amount-high" | "amount-low"
  >("newest");
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderSummary | null>(null);
  const [newOrder, setNewOrder] = useState<CreateOrderInput>(defaultOrderInput);
  const [newPayment, setNewPayment] = useState<CreateOrderPaymentInput>({
    order_id: "",
    amount: 0,
    payment_method: "Cash",
    notes: "",
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<OrderSummary | null>(null);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isFlaggedCustomerWarningOpen, setIsFlaggedCustomerWarningOpen] =
    useState(false);
  const [flaggedCustomerInfo, setFlaggedCustomerInfo] = useState<{
    name: string;
    reason: string;
  } | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const { role } = useRole();
  const searchParams = useSearchParams();
  const customerFilter = searchParams.get("customer");

  // Add query for general settings
  const { data: settings } = useQuery({
    queryKey: ["general-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("general_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Add query for customer flags
  const { data: customerFlags } = useQuery({
    queryKey: ["customer-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_flags")
        .select("*")
        .is("resolved_at", null);

      if (error) throw error;
      return data;
    },
  });

  // Check if customer is flagged
  const isCustomerFlagged = (customerId: string) => {
    return customerFlags?.some((flag) => flag.customer_id === customerId);
  };

  // Get flag reason for customer
  const getFlagReason = (customerId: string) => {
    return customerFlags?.find((flag) => flag.customer_id === customerId)
      ?.reason;
  };

  // Handle search debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_summary")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderSummary[];
    },
  });

  // Fetch customers for the add order form
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("is_active", true)
        .order("studio_name", { ascending: true });

      if (error) throw error;
      return data as Customer[];
    },
  });

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customers || !customerSearchTerm) return customers;

    const searchLower = customerSearchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.studio_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
    );
  }, [customers, customerSearchTerm]);

  // After fetching customers, get the name of the filtered customer if customerFilter is present
  const filteredCustomerName = useMemo(() => {
    if (!customerFilter || !customers) return null;
    const customer = customers.find((c) => c.id === customerFilter);
    return customer ? customer.studio_name : null;
  }, [customerFilter, customers]);

  // Handle amount paid change
  const handleAmountPaidChange = (value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setNewOrder({
      ...newOrder,
      amount_paid: numValue,
      // Reset payment method if amount is cleared or 0
      payment_method:
        numValue && numValue > 0 ? newOrder.payment_method : undefined,
    });
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    if (isCustomerFlagged(customer.id)) {
      setFlaggedCustomerInfo({
        name: customer.studio_name,
        reason: getFlagReason(customer.id) || "No reason provided",
      });
      setIsFlaggedCustomerWarningOpen(true);
    } else {
      setNewOrder({
        ...newOrder,
        customer_id: customer.id,
      });
      setSelectedCustomerName(customer.studio_name);
      setCustomerSearchTerm("");
    }
  };

  // Handle clearing customer selection
  const handleClearCustomer = () => {
    setNewOrder({
      ...newOrder,
      customer_id: "",
    });
    setSelectedCustomerName("");
    setCustomerSearchTerm("");
  };

  // Add order mutation
  const addOrderMutation = useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      let order_number = input.order_number;

      if (!order_number) {
        // Generate order number if not provided
        const { data: numberData, error: numberError } = await supabase.rpc(
          "generate_order_number"
        );
        if (numberError) throw numberError;
        order_number = numberData;
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: input.customer_id,
            order_number,
            status: "pending" as const,
            total_amount: input.total_amount,
            amount_paid: input.amount_paid || 0,
            notes: input.notes,
            estimated_delivery_date: input.estimated_delivery_date,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            updated_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // If there's an initial payment, create a payment record
      if (input.amount_paid && input.amount_paid > 0 && input.payment_method) {
        const { error: paymentError } = await supabase
          .from("order_payments")
          .insert([
            {
              order_id: order.id,
              amount: input.amount_paid,
              payment_method: input.payment_method,
              notes: "Initial payment",
              created_by: (await supabase.auth.getUser()).data.user?.id,
            },
          ]);

        if (paymentError) throw paymentError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsAddOrderOpen(false);
      setNewOrder(defaultOrderInput);
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create order: " + error.message);
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderInput;
    }) => {
      const { error } = await supabase.from("orders").update(data).eq("id", id);

      if (error) throw error;

      // Log the status change
      if (data.status) {
        await logOrderAction(
          id,
          "status_update",
          `Order status changed to ${data.status}`
        );
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (variables?.id) {
        queryClient.refetchQueries({ queryKey: ["orderLogs", variables.id] });
      }
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete order payments
      const { error: paymentsError } = await supabase
        .from("order_payments")
        .delete()
        .eq("order_id", id);

      if (paymentsError) throw paymentsError;

      // Delete order logs
      const { error: logsError } = await supabase
        .from("order_logs")
        .delete()
        .eq("order_id", id);

      if (logsError) throw logsError;

      // Delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOrderToDelete(null);
      setIsDetailsOpen(false);
      toast.success("Order deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order: " + error.message);
      setOrderToDelete(null);
    },
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (input: CreateOrderPaymentInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("amount_paid, total_amount, status")
        .eq("id", input.order_id)
        .single();

      if (orderError) throw orderError;

      const newAmountPaid = (order.amount_paid || 0) + input.amount;
      const isFullyPaid = newAmountPaid >= order.total_amount;

      // Insert payment
      const { data, error: paymentError } = await supabase
        .from("order_payments")
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update order amount_paid and status if fully paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          amount_paid: newAmountPaid,
          status:
            isFullyPaid && order.status === "completed"
              ? "delivered"
              : undefined,
        })
        .eq("id", input.order_id);

      if (updateError) throw updateError;

      // Log the payment
      await logOrderAction(
        input.order_id,
        "payment_added",
        `Payment of ₹${input.amount} added via ${input.payment_method}`
      );

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["orderLogs", selectedOrder?.id],
      });
      setIsAddPaymentOpen(false);
      setNewPayment({
        order_id: "",
        amount: 0,
        payment_method: "Cash",
        notes: "",
      });
      toast.success("Payment added successfully");
    },
    onError: (error) => {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment: " + error.message);
    },
  });

  // Fetch payments for selected order
  const { data: orderPayments } = useQuery({
    queryKey: ["order-payments", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];

      const { data, error } = await supabase
        .from("order_payments")
        .select("*")
        .eq("order_id", selectedOrder.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as OrderPayment[];
    },
    enabled: !!selectedOrder?.id,
  });

  // Fetch order logs
  const { data: orderLogs } = useQuery({
    queryKey: ["orderLogs", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];

      const { data, error } = await supabase
        .from("order_logs")
        .select("*")
        .eq("order_id", selectedOrder.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderLog[];
    },
    enabled: !!selectedOrder?.id,
  });

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!ordersData) return [];

    let filtered = [...ordersData];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.customer_email.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply customer filter
    if (customerFilter) {
      filtered = filtered.filter(
        (order) => order.customer_id === customerFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "amount-high":
          return b.total_amount - a.total_amount;
        case "amount-low":
          return a.total_amount - b.total_amount;
        default: // newest
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [ordersData, debouncedSearchTerm, statusFilter, sortBy, customerFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!ordersData)
      return {
        totalOrders: 0,
        activeOrders: 0,
        totalAmount: 0,
        amountPaid: 0,
        pendingAmount: 0,
      };

    const totalOrders = ordersData.length;
    const activeOrders = ordersData.filter(
      (order) => order.status !== "delivered"
    ).length;
    const totalAmount = ordersData.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const amountPaid = ordersData.reduce(
      (sum, order) => sum + order.amount_paid,
      0
    );
    const pendingAmount = totalAmount - amountPaid;

    return {
      totalOrders,
      activeOrders,
      totalAmount,
      amountPaid,
      pendingAmount,
    };
  }, [ordersData]);

  // Update the table row click handler
  const handleRowClick = (order: OrderSummary) => {
    setSelectedOrder(order);
    setSelectedOrderDetails(order);
    setIsDetailsOpen(true);
  };

  // Add function to log order actions
  const logOrderAction = async (
    orderId: string,
    action: string,
    details: string
  ) => {
    const { error } = await supabase.from("order_logs").insert([
      {
        order_id: orderId,
        action,
        details,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      console.error("Failed to log order action:", error);
    }
  };

  // Add a function to clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("customer");
      window.history.replaceState({}, document.title, url.pathname);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders and payments
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.totalOrders
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.activeOrders
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `₹${stats.totalAmount.toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `₹${stats.amountPaid.toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `₹${stats.pendingAmount.toLocaleString()}`
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
                placeholder="Search orders..."
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
                value={searchTerm}
                onChange={handleSearchChange}
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
                    {statusFilter === "all"
                      ? "All Status"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("in_progress")}
                  >
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("delivered")}
                  >
                    Delivered
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
                  <DropdownMenuItem onClick={() => setSortBy("amount-high")}>
                    Highest Amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("amount-low")}>
                    Lowest Amount
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setIsAddOrderOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {customerFilter && filteredCustomerName && (
        <div className="mb-6">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-red-200 bg-red-50 shadow-sm animate-fade-in">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <User className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-red-700 font-semibold truncate">
                Showing orders for:
              </div>
              <div className="text-lg font-bold text-red-900 truncate">
                {filteredCustomerName}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-red-400 hover:text-red-700 border border-transparent hover:border-red-200 transition"
              onClick={clearAllFilters}
              aria-label="Remove customer filter"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 6 6 18M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
      {filteredOrders.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm || statusFilter !== "all"
                ? "No orders match your current filters. Try adjusting your search criteria or clearing filters."
                : "There are no orders yet. Create your first order to get started."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-red-100 hover:bg-red-50"
                  onClick={clearAllFilters}
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
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-red-50/50"
                  onClick={() => handleRowClick(order)}
                >
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={orderStatusBadgeVariants[order.status]}
                      className="mr-2"
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1).replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell>₹{order.amount_paid.toLocaleString()}</TableCell>
                  <TableCell>
                    ₹{(order.total_amount - order.amount_paid).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "PPp")}
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
                            setSelectedOrder(order);
                            setIsAddPaymentOpen(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderMutation.mutate({
                              id: order.id,
                              data: {
                                status:
                                  order.status === "pending"
                                    ? "in_progress"
                                    : order.status === "in_progress"
                                    ? "completed"
                                    : order.status === "completed" &&
                                      order.total_amount <= order.amount_paid
                                    ? "delivered"
                                    : order.status,
                              },
                            });
                          }}
                          disabled={
                            !(
                              role === "super_admin" ||
                              order.status === "pending"
                            )
                          }
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {order.status === "pending"
                            ? "Mark In Progress"
                            : order.status === "in_progress"
                            ? "Mark Completed"
                            : order.status === "completed"
                            ? "Mark Delivered"
                            : "Status"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
                          className="text-red-600"
                          disabled={
                            !(
                              role === "super_admin" ||
                              order.status === "pending"
                            )
                          }
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Order Dialog */}
      <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-900">
              Create New Order
            </DialogTitle>
            <DialogDescription>
              Create a new order and assign it to a customer.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addOrderMutation.mutate(newOrder);
            }}
          >
            <div className="grid gap-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer_id" className="text-red-900">
                      Customer *
                    </Label>
                    <div className="relative">
                      {newOrder.customer_id && customers ? (
                        (() => {
                          const selected = customers.find(
                            (c) => c.id === newOrder.customer_id
                          );
                          if (!selected) return null;
                          return (
                            <div className="flex items-center gap-3 p-3 rounded-md border border-red-200 bg-red-50 animate-fade-in">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <User className="h-4 w-4 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-red-900 truncate">
                                  {selected.studio_name}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {selected.email}
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="ml-2 text-red-400 hover:text-red-700"
                                aria-label="Clear selected customer"
                                onClick={handleClearCustomer}
                              >
                                <span className="sr-only">Clear</span>
                                <svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M18 6 6 18M6 6l12 12"
                                  />
                                </svg>
                              </Button>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="relative animate-fade-in">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="customer_search"
                            placeholder="Search customers..."
                            value={customerSearchTerm || selectedCustomerName}
                            onChange={(e) =>
                              setCustomerSearchTerm(e.target.value)
                            }
                            className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                          />
                          {customerSearchTerm && filteredCustomers && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg animate-fade-in">
                              {filteredCustomers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No customers found
                                </div>
                              ) : (
                                filteredCustomers.map((customer) => (
                                  <div
                                    key={customer.id}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-red-50"
                                    onClick={() =>
                                      handleCustomerSelect(customer)
                                    }
                                  >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                      <User className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-red-900">
                                        {customer.studio_name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {customer.email}
                                      </div>
                                    </div>
                                    {isCustomerFlagged(customer.id) && (
                                      <Badge
                                        variant="destructive"
                                        className="ml-auto"
                                      >
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Flagged
                                      </Badge>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="order_number" className="text-red-900">
                      Order Number (Optional)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        #
                      </div>
                      <Input
                        id="order_number"
                        placeholder={`Leave empty for auto-generation (${
                          settings?.order_number_prefix || "GA-"
                        }${(settings?.last_order_number || 0) + 1})`}
                        value={newOrder.order_number || ""}
                        onChange={(e) =>
                          setNewOrder({
                            ...newOrder,
                            order_number: e.target.value,
                          })
                        }
                        className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="total_amount" className="text-red-900">
                      Total Amount (₹) *
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="total_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="25000"
                        value={newOrder.total_amount || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setNewOrder({
                            ...newOrder,
                            total_amount: value,
                            amount_paid:
                              newOrder.amount_paid &&
                              newOrder.amount_paid > value
                                ? undefined
                                : newOrder.amount_paid,
                          });
                        }}
                        className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="estimated_delivery_date"
                      className="text-red-900"
                    >
                      Estimated Delivery Date *
                    </Label>
                    <DatePicker
                      date={
                        newOrder.estimated_delivery_date
                          ? new Date(newOrder.estimated_delivery_date)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date && date <= new Date()) {
                          toast.error("Delivery date must be in the future");
                          return;
                        }
                        setNewOrder({
                          ...newOrder,
                          estimated_delivery_date: date?.toISOString(),
                        });
                      }}
                      className="border-red-100 focus:border-red-200 focus:ring-red-100"
                      placeholder="Select delivery date"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="amount_paid" className="text-red-900">
                      Initial Payment Amount (₹)
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="amount_paid"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="5000"
                        value={
                          newOrder.amount_paid === undefined
                            ? ""
                            : newOrder.amount_paid
                        }
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value > (newOrder.total_amount || 0)) {
                            toast.error(
                              "Initial payment cannot exceed total amount"
                            );
                            return;
                          }
                          handleAmountPaidChange(e.target.value);
                        }}
                        className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {newOrder.amount_paid && newOrder.amount_paid > 0 ? (
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method" className="text-red-900">
                        Payment Method *
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Select
                          value={newOrder.payment_method}
                          onValueChange={(value: PaymentMethod) =>
                            setNewOrder({ ...newOrder, payment_method: value })
                          }
                        >
                          <SelectTrigger className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem
                                key={method}
                                value={method as PaymentMethod}
                              >
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-red-900">
                  Notes (Optional)
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about the order..."
                    value={newOrder.notes || ""}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, notes: e.target.value })
                    }
                    className="pl-9 min-h-[120px] border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOrderOpen(false);
                  setNewOrder(defaultOrderInput);
                }}
                className="border-red-100 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newOrder.customer_id ||
                  !newOrder.total_amount ||
                  !newOrder.estimated_delivery_date ||
                  new Date(newOrder.estimated_delivery_date) <= new Date() ||
                  (newOrder.amount_paid !== undefined &&
                    newOrder.amount_paid > (newOrder.total_amount || 0)) ||
                  (newOrder.amount_paid !== undefined &&
                    newOrder.amount_paid > 0 &&
                    !newOrder.payment_method)
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-900">
              Add Payment
            </DialogTitle>
            <DialogDescription>
              Add a new payment for order {selectedOrder?.order_number}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedOrder) {
                addPaymentMutation.mutate({
                  ...newPayment,
                  order_id: selectedOrder.id,
                });
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-red-900">
                  Amount (₹) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  value={newPayment.amount || ""}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_method" className="text-red-900">
                  Payment Method *
                </Label>
                <Select
                  value={newPayment.payment_method}
                  onValueChange={(value: PaymentMethod) =>
                    setNewPayment({ ...newPayment, payment_method: value })
                  }
                >
                  <SelectTrigger className="border-red-100 focus:border-red-200 focus:ring-red-100">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method as PaymentMethod}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_notes" className="text-red-900">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="payment_notes"
                  placeholder="Add any notes about the payment..."
                  value={newPayment.notes || ""}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, notes: e.target.value })
                  }
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddPaymentOpen(false);
                  setNewPayment({
                    order_id: "",
                    amount: 0,
                    payment_method: "Cash",
                    notes: "",
                  });
                }}
                className="border-red-100 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newPayment.amount || !newPayment.payment_method}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Add Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => {
          if (!open) setOrderToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{" "}
              {orderToDelete?.order_number}? This action cannot be undone. All
              associated data including payments and logs will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOrderToDelete(null)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToDelete) {
                  deleteOrderMutation.mutate(orderToDelete.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Side Panel */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="space-y-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold">
                      Order #{selectedOrder.order_number}
                    </SheetTitle>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant={orderStatusBadgeVariants[selectedOrder.status]}
                        className="mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsUpdateStatusOpen(true)}
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1).replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <a
                      href={`mailto:${selectedOrder.customer_email}`}
                      className="hover:underline"
                    >
                      {selectedOrder.customer_email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="hover:underline"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Created:{" "}
                      {format(new Date(selectedOrder.created_at), "PPpp")}
                    </span>
                  </div>
                  {selectedOrder.estimated_delivery_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Delivery:{" "}
                        {format(
                          new Date(selectedOrder.estimated_delivery_date),
                          "PPpp"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Amount
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedOrder.total_amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Amount Paid
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedOrder.amount_paid.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground mb-1">
                      Balance Amount
                    </div>
                    <div className="text-2xl font-bold flex items-center">
                      <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                      {selectedOrder.balance_amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium flex items-center mb-3">
                        <FileText className="w-4 h-4 mr-2" />
                        Order Notes
                      </h3>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Clock className="w-4 h-4 mr-2" />
                    Activity Log
                  </h3>
                  <div className="space-y-4">
                    {orderLogs?.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-3 text-sm"
                      >
                        <div className="mt-0.5">
                          {log.action === "status_update" ? (
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                          ) : log.action === "payment_added" ? (
                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {log.action === "status_update"
                              ? "Status Updated"
                              : log.action === "payment_added"
                              ? "Payment Added"
                              : "Order Created"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.details}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "PPpp")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <SheetFooter className="flex-row gap-2 sm:flex-row">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setIsAddPaymentOpen(true)}
                >
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-100 hover:bg-red-50"
                  onClick={() => setIsUpdateStatusOpen(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                {selectedOrder.status === "pending" && (
                  <Button
                    variant="outline"
                    className="flex-1 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => {
                      setOrderToDelete(selectedOrder);
                      setIsDetailsOpen(false);
                    }}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Order
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select the new status for order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedOrder?.status === "pending"
                    ? "border-red-600 bg-red-50"
                    : "border-red-100 hover:bg-red-50"
                }`}
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { status: "pending" },
                    });
                    setIsUpdateStatusOpen(false);
                  }
                }}
                disabled={selectedOrder?.status === "pending"}
              >
                <Clock className="w-6 h-6" />
                <span>Pending</span>
              </Button>
              <Button
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedOrder?.status === "in_progress"
                    ? "border-red-600 bg-red-50"
                    : "border-red-100 hover:bg-red-50"
                }`}
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { status: "in_progress" },
                    });
                    setIsUpdateStatusOpen(false);
                  }
                }}
                disabled={selectedOrder?.status === "in_progress"}
              >
                <RefreshCw className="w-6 h-6" />
                <span>In Progress</span>
              </Button>
              <Button
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedOrder?.status === "completed"
                    ? "border-red-600 bg-red-50"
                    : "border-red-100 hover:bg-red-50"
                }`}
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { status: "completed" },
                    });
                    setIsUpdateStatusOpen(false);
                  }
                }}
                disabled={selectedOrder?.status === "completed"}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Completed</span>
              </Button>
              <Button
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedOrder?.status === "delivered"
                    ? "border-red-600 bg-red-50"
                    : "border-red-100 hover:bg-red-50"
                }`}
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { status: "delivered" },
                    });
                    setIsUpdateStatusOpen(false);
                  }
                }}
                disabled={
                  selectedOrder?.status === "delivered" ||
                  (selectedOrder?.status === "completed" &&
                    selectedOrder?.total_amount > selectedOrder?.amount_paid)
                }
              >
                <ShoppingBag className="w-6 h-6" />
                <span>Delivered</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateStatusOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flagged Customer Warning Dialog */}
      <AlertDialog
        open={isFlaggedCustomerWarningOpen}
        onOpenChange={setIsFlaggedCustomerWarningOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Flagged Customer Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="mt-4 space-y-4">
                <div>
                  You are about to create an order for{" "}
                  <strong>{flaggedCustomerInfo?.name}</strong>, who has been
                  flagged.
                </div>
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Flag Reason
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {flaggedCustomerInfo?.reason}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Please review the flag reason before proceeding with the order
                  creation.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (flaggedCustomerInfo) {
                  const flaggedCustomer = customerFlags?.find(
                    (flag) => flag.customer_id === newOrder.customer_id
                  );
                  setNewOrder({
                    ...newOrder,
                    customer_id: flaggedCustomer?.customer_id || "",
                  });
                  setSelectedCustomerName(flaggedCustomerInfo.name);
                  setCustomerSearchTerm("");
                }
                setIsFlaggedCustomerWarningOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
