"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import {
  IndianRupee,
  Plus,
  CreditCard,
  History,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type {
  Customer,
  CustomerBalancePayment,
  CustomerBalanceLog,
  CustomerBalanceSummary,
  AddPreviousBalanceInput,
  AddBalancePaymentInput,
} from "@/lib/types/customer";

const supabase = createClient();
const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Other"];

interface CustomerBalanceSectionProps {
  customer: Customer;
}

export function CustomerBalanceSection({
  customer,
}: CustomerBalanceSectionProps) {
  const queryClient = useQueryClient();
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newBalance, setNewBalance] = useState<AddPreviousBalanceInput>({
    customer_id: customer.id,
    total_amount: 0,
    notes: "",
  });
  const [newPayment, setNewPayment] = useState<AddBalancePaymentInput>({
    customer_id: customer.id,
    amount: 0,
    payment_method: "Cash",
    notes: "",
  });

  // Fetch balance summary
  const { data: balanceSummary } = useQuery({
    queryKey: ["customer-balance-summary", customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_balance_summary")
        .select("*")
        .eq("customer_id", customer.id)
        .single();

      if (error) throw error;
      return data as CustomerBalanceSummary;
    },
  });

  // Fetch balance payments
  const { data: balancePayments } = useQuery({
    queryKey: ["customer-balance-payments", customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_balance_payments")
        .select("*")
        .eq("customer_id", customer.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as CustomerBalancePayment[];
    },
  });

  // Fetch balance logs
  const { data: balanceLogs } = useQuery({
    queryKey: ["customer-balance-logs", customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_balance_logs")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomerBalanceLog[];
    },
  });

  // Add previous balance mutation
  const addBalanceMutation = useMutation({
    mutationFn: async (input: AddPreviousBalanceInput) => {
      const { data: balance, error: balanceError } = await supabase
        .from("customer_previous_balances")
        .insert({
          customer_id: input.customer_id,
          total_amount: input.total_amount,
          notes: input.notes,
        })
        .select()
        .single();

      if (balanceError) throw balanceError;

      // Log the action
      const { error: logError } = await supabase
        .from("customer_balance_logs")
        .insert({
          customer_id: input.customer_id,
          action: "add_previous_balance",
          details: `Added previous balance of ₹${input.total_amount}${
            input.notes ? ` - ${input.notes}` : ""
          }`,
        });

      if (logError) throw logError;

      return balance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-balance-summary", customer.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-balance-logs", customer.id],
      });
      setIsAddBalanceOpen(false);
      setNewBalance({
        customer_id: customer.id,
        total_amount: 0,
        notes: "",
      });
      toast.success("Previous balance added successfully");
    },
    onError: (error) => {
      console.error("Error adding previous balance:", error);
      toast.error("Failed to add previous balance");
    },
  });

  // Add balance payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (input: AddBalancePaymentInput) => {
      // First update the previous balance
      const { data: currentBalance, error: balanceError } = await supabase
        .from("customer_previous_balances")
        .select("*")
        .eq("customer_id", input.customer_id)
        .single();

      if (balanceError && balanceError.code !== "PGRST116") throw balanceError;

      if (currentBalance) {
        const { error: updateError } = await supabase
          .from("customer_previous_balances")
          .update({
            amount_paid: currentBalance.amount_paid + input.amount,
          })
          .eq("id", currentBalance.id);

        if (updateError) throw updateError;
      }

      // Add the payment record
      const { data: payment, error: paymentError } = await supabase
        .from("customer_balance_payments")
        .insert({
          customer_id: input.customer_id,
          amount: input.amount,
          payment_method: input.payment_method,
          notes: input.notes,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Log the action
      const { error: logError } = await supabase
        .from("customer_balance_logs")
        .insert({
          customer_id: input.customer_id,
          action: "add_payment",
          details: `Received payment of ₹${input.amount} via ${
            input.payment_method
          }${input.notes ? ` - ${input.notes}` : ""}`,
        });

      if (logError) throw logError;

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-balance-summary", customer.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-balance-payments", customer.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-balance-logs", customer.id],
      });
      setIsAddPaymentOpen(false);
      setNewPayment({
        customer_id: customer.id,
        amount: 0,
        payment_method: "Cash",
        notes: "",
      });
      toast.success("Payment added successfully");
    },
    onError: (error) => {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    },
  });

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Balance Summary</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddBalanceOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Previous Balance
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Previous Balance:
            </span>
            <Badge variant="outline">
              ₹{balanceSummary?.previous_balance_total.toFixed(2) || "0.00"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount Paid:</span>
            <Badge variant="outline" className="bg-green-50">
              ₹{balanceSummary?.previous_balance_paid.toFixed(2) || "0.00"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Previous Balance Remaining:
            </span>
            <Badge variant="outline" className="bg-yellow-50">
              ₹{balanceSummary?.previous_balance_remaining.toFixed(2) || "0.00"}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Pending Orders Amount:
            </span>
            <Badge variant="outline" className="bg-blue-50">
              ₹{balanceSummary?.pending_orders_amount.toFixed(2) || "0.00"}
            </Badge>
          </div>
          <div className="flex justify-between items-center font-semibold">
            <span className="text-sm">Total Balance:</span>
            <Badge variant="outline" className="bg-red-50">
              ₹{balanceSummary?.total_balance.toFixed(2) || "0.00"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Balance Actions */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Balance Actions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddPaymentOpen(true)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>
        <Separator className="my-4" />

        {/* Payment History */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Payment History
          </h4>
          <div className="space-y-2">
            {balancePayments?.map((payment) => (
              <div
                key={payment.id}
                className="bg-muted/50 p-3 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-green-50">
                    ₹{payment.amount.toFixed(2)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(payment.payment_date), "dd MMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Receipt className="h-3 w-3" />
                  {payment.payment_method}
                </div>
                {payment.notes && (
                  <p className="text-xs text-muted-foreground">
                    {payment.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Activity Logs
          </h4>
          <div className="space-y-2">
            {balanceLogs?.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No activity logs yet
              </div>
            ) : (
              balanceLogs?.map((log) => {
                // Format the action for display
                const formattedAction = log.action
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                // Get appropriate icon and color based on action
                let ActionIcon;
                let iconColorClass;
                switch (log.action) {
                  case "add_previous_balance":
                    ActionIcon = IndianRupee;
                    iconColorClass = "text-blue-500";
                    break;
                  case "add_payment":
                    ActionIcon = CreditCard;
                    iconColorClass = "text-green-500";
                    break;
                  default:
                    ActionIcon = History;
                    iconColorClass = "text-gray-500";
                }

                return (
                  <div
                    key={log.id}
                    className="bg-muted/50 p-3 rounded-lg space-y-2 border border-muted hover:border-muted-foreground/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`${iconColorClass}`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium">
                          {formattedAction}
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-xs text-muted-foreground">
                        <span>
                          {format(new Date(log.created_at), "dd MMM yyyy")}
                        </span>
                        <span>
                          {format(new Date(log.created_at), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {log.details}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Previous Balance Dialog */}
      <Dialog open={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Previous Balance</DialogTitle>
            <DialogDescription>
              Add a previous balance amount for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  className="pl-9"
                  value={newBalance.total_amount}
                  onChange={(e) =>
                    setNewBalance({
                      ...newBalance,
                      total_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newBalance.notes || ""}
                onChange={(e) =>
                  setNewBalance({
                    ...newBalance,
                    notes: e.target.value,
                  })
                }
                placeholder="Add any notes about this balance..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddBalanceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addBalanceMutation.mutate(newBalance)}
              disabled={addBalanceMutation.isPending}
            >
              {addBalanceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a payment for the previous balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment-amount"
                  type="number"
                  className="pl-9"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={newPayment.payment_method}
                onValueChange={(value) =>
                  setNewPayment({
                    ...newPayment,
                    payment_method: value,
                  })
                }
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                value={newPayment.notes || ""}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    notes: e.target.value,
                  })
                }
                placeholder="Add any notes about this payment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addPaymentMutation.mutate(newPayment)}
              disabled={addPaymentMutation.isPending}
            >
              {addPaymentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
