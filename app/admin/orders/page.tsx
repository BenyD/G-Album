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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-logs"] });
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete the order (cascade will handle related records)
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOrderToDelete(null);
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
  }, [ordersData, debouncedSearchTerm, statusFilter, sortBy]);

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
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
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
                            order.status === "delivered" ||
                            (order.status === "completed" &&
                              order.total_amount > order.amount_paid)
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
                          disabled={order.status !== "pending"}
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
            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_id" className="text-red-900">
                    Customer *
                  </Label>
                  <Select
                    value={newOrder.customer_id}
                    onValueChange={(value) =>
                      setNewOrder({ ...newOrder, customer_id: value })
                    }
                  >
                    <SelectTrigger className="border-red-100 focus:border-red-200 focus:ring-red-100">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 pb-0">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-red-400" />
                          <Input
                            type="search"
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) =>
                              setCustomerSearchTerm(e.target.value)
                            }
                            className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                          />
                        </div>
                      </div>
                      <div className="relative max-h-[300px] overflow-y-auto">
                        {filteredCustomers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.studio_name} - {customer.email}
                          </SelectItem>
                        ))}
                        {filteredCustomers?.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No customers found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="order_number" className="text-red-900">
                    Order Number (Optional)
                  </Label>
                  <Input
                    id="order_number"
                    placeholder="Leave empty for auto-generation"
                    value={newOrder.order_number || ""}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, order_number: e.target.value })
                    }
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="total_amount" className="text-red-900">
                    Total Amount (₹) *
                  </Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25000"
                    value={newOrder.total_amount || ""}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        total_amount: parseFloat(e.target.value),
                        // Reset amount_paid if it's greater than new total
                        amount_paid:
                          newOrder.amount_paid &&
                          newOrder.amount_paid > parseFloat(e.target.value)
                            ? undefined
                            : newOrder.amount_paid,
                      })
                    }
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="estimated_delivery_date"
                    className="text-red-900"
                  >
                    Estimated Delivery Date *
                  </Label>
                  <Input
                    id="estimated_delivery_date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newOrder.estimated_delivery_date || ""}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        estimated_delivery_date: e.target.value,
                      })
                    }
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                  {newOrder.estimated_delivery_date &&
                    new Date(newOrder.estimated_delivery_date) <=
                      new Date() && (
                      <p className="text-sm text-red-600">
                        Delivery date must be in the future
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount_paid" className="text-red-900">
                    Initial Payment Amount (₹)
                  </Label>
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
                    onChange={(e) => handleAmountPaidChange(e.target.value)}
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                  {newOrder.amount_paid !== undefined &&
                    newOrder.amount_paid > (newOrder.total_amount || 0) && (
                      <p className="text-sm text-red-600">
                        Initial payment cannot exceed total amount
                      </p>
                    )}
                </div>

                {newOrder.amount_paid && newOrder.amount_paid > 0 ? (
                  <div className="grid gap-2">
                    <Label htmlFor="payment_method" className="text-red-900">
                      Payment Method *
                    </Label>
                    <Select
                      value={newOrder.payment_method}
                      onValueChange={(value: PaymentMethod) =>
                        setNewOrder({ ...newOrder, payment_method: value })
                      }
                    >
                      <SelectTrigger className="border-red-100 focus:border-red-200 focus:ring-red-100">
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
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-red-900">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about the order..."
                    value={newOrder.notes || ""}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, notes: e.target.value })
                    }
                    className="min-h-[120px] border-red-100 focus:border-red-200 focus:ring-red-100"
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

      {/* Delete Order Confirmation */}
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
              associated data will be permanently removed.
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
                        className="mr-2"
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
    </div>
  );
}
