"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OrderSummary,
  UpdateOrderInput,
  PaymentMethod,
  OrderStatus,
} from "@/lib/types/order";
import { format } from "date-fns";
import {
  Loader2,
  IndianRupee,
  MessageSquare,
  CreditCard,
  User,
  Mail,
  Phone,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const supabase = createClient();

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Other",
];
const orderStatuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "delivered",
];

const statusBadgeClasses = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  delivered: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

interface OrderPayment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  notes?: string;
  created_by: string;
}

interface OrderLog {
  id: string;
  order_id: string;
  action: string;
  details: string;
  created_at: string;
  created_by: string;
}

interface EditOrderDialogProps {
  order: OrderSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
}: EditOrderDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState<UpdateOrderInput>({
    status: order.status,
    total_amount: order.total_amount,
    amount_paid: order.amount_paid,
    payment_method: undefined,
    estimated_delivery_date: order.estimated_delivery_date || undefined,
    notes: order.notes || "",
  });

  // Update form data when order changes
  useEffect(() => {
    setFormData({
      status: order.status,
      total_amount: order.total_amount,
      amount_paid: order.amount_paid,
      payment_method: undefined,
      estimated_delivery_date: order.estimated_delivery_date || undefined,
      notes: order.notes || "",
    });
  }, [order]);

  // Handle amount paid change
  const handleAmountPaidChange = (value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setFormData({
      ...formData,
      amount_paid: numValue,
      // Reset payment method if amount is cleared or 0
      payment_method:
        numValue && numValue > 0 ? formData.payment_method : undefined,
    });
  };

  // Fetch payments for the order
  const { data: payments } = useQuery({
    queryKey: ["order-payments", order?.id],
    queryFn: async () => {
      if (!order?.id) return [];

      const { data, error } = await supabase
        .from("order_payments")
        .select("*")
        .eq("order_id", order.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as OrderPayment[];
    },
    enabled: !!order?.id,
  });

  // Fetch order logs
  const { data: orderLogs } = useQuery({
    queryKey: ["orderLogs", order?.id],
    queryFn: async () => {
      if (!order?.id) return [];

      const { data, error } = await supabase
        .from("order_logs")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderLog[];
    },
    enabled: !!order?.id,
  });

  // Update order mutation
  const { mutate: updateOrder, isPending } = useMutation({
    mutationFn: async (input: UpdateOrderInput) => {
      if (!order) throw new Error("No order selected");

      const { error } = await supabase
        .from("orders")
        .update({
          ...input,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", order.id);

      if (error) throw error;

      // If there's a payment method and amount, create a payment record
      if (input.amount_paid && input.amount_paid > 0 && input.payment_method) {
        const { error: paymentError } = await supabase
          .from("order_payments")
          .insert([
            {
              order_id: order.id,
              amount: input.amount_paid,
              payment_method: input.payment_method,
              notes: "Payment added during order update",
              created_by: (await supabase.auth.getUser()).data.user?.id,
            },
          ]);

        if (paymentError) throw paymentError;
      }

      // Log the update action
      const { error: logError } = await supabase.from("order_logs").insert([
        {
          order_id: order.id,
          action: "order_updated",
          details: `Order details updated: ${Object.keys(input)
            .filter((key) => input[key as keyof UpdateOrderInput] !== undefined)
            .join(", ")}`,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["orderLogs", order?.id],
      });
      onOpenChange(false);
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error("Failed to update order: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateOrder(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-red-900">
                Edit Order #{order?.order_number}
              </DialogTitle>
              <DialogDescription>
                Edit order details and view order information.
              </DialogDescription>
            </div>
            <Badge
              className={cn(
                "text-base py-1 px-3",
                statusBadgeClasses[order.status]
              )}
            >
              {order.status.charAt(0).toUpperCase() +
                order.status.slice(1).replace("_", " ")}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Info</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-red-900">
                    Order Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: OrderStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="border-red-100 focus:border-red-200 focus:ring-red-100">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="total_amount" className="text-red-900">
                    Total Amount (₹)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="total_amount"
                      type="number"
                      value={formData.total_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_amount: parseFloat(e.target.value),
                          amount_paid:
                            formData.amount_paid &&
                            formData.amount_paid > parseFloat(e.target.value)
                              ? undefined
                              : formData.amount_paid,
                        })
                      }
                      min={0}
                      step={0.01}
                      required
                      className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount_paid" className="text-red-900">
                    Amount Paid (₹)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount_paid"
                      type="number"
                      value={formData.amount_paid || ""}
                      onChange={(e) => handleAmountPaidChange(e.target.value)}
                      min={0}
                      max={formData.total_amount}
                      step={0.01}
                      className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                    />
                  </div>
                </div>

                {formData.amount_paid && formData.amount_paid > 0 ? (
                  <div className="grid gap-2">
                    <Label htmlFor="payment_method" className="text-red-900">
                      Payment Method *
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value: PaymentMethod) =>
                          setFormData({ ...formData, payment_method: value })
                        }
                      >
                        <SelectTrigger className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label
                    htmlFor="estimated_delivery_date"
                    className="text-red-900"
                  >
                    Estimated Delivery Date
                  </Label>
                  <DatePicker
                    date={
                      formData.estimated_delivery_date
                        ? new Date(formData.estimated_delivery_date)
                        : undefined
                    }
                    onSelect={(date: Date | undefined) => {
                      if (date && date <= new Date()) {
                        toast.error("Delivery date must be in the future");
                        return;
                      }
                      setFormData({
                        ...formData,
                        estimated_delivery_date: date?.toISOString(),
                      });
                    }}
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-red-900">
                    Notes
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: e.target.value,
                        })
                      }
                      className="min-h-[100px] pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                      placeholder="Add any additional notes about the order..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={
                    isPending ||
                    !formData.total_amount ||
                    !formData.estimated_delivery_date ||
                    new Date(formData.estimated_delivery_date) <= new Date() ||
                    (formData.amount_paid !== undefined &&
                      formData.amount_paid > (formData.total_amount || 0)) ||
                    (formData.amount_paid !== undefined &&
                      formData.amount_paid > 0 &&
                      !formData.payment_method)
                  }
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="customer">
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer Name
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Email Address
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer_phone}</p>
                    <p className="text-sm text-muted-foreground">
                      Phone Number
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                {payments?.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-start space-x-4 border rounded-lg p-4"
                  >
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <Badge>{payment.payment_method}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(payment.payment_date), "PPp")}
                      </p>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!payments || payments.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No payment records found
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                {orderLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 border rounded-lg p-4"
                  >
                    {log.action === "status_update" ? (
                      <RefreshCw className="h-5 w-5 text-muted-foreground mt-1" />
                    ) : log.action === "payment_added" ? (
                      <IndianRupee className="h-5 w-5 text-muted-foreground mt-1" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {log.action === "status_update"
                          ? "Status Updated"
                          : log.action === "payment_added"
                            ? "Payment Added"
                            : "Order Updated"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(log.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!orderLogs || orderLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No activity logs found
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
