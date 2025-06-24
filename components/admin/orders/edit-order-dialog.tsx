"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
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
import {
  OrderSummary,
  UpdateOrderInput,
  PaymentMethod,
} from "@/lib/types/order";
import {
  Loader2,
  IndianRupee,
  MessageSquare,
  CreditCard,
  Hash,
} from "lucide-react";

const supabase = createClient();

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Other",
];

interface EditOrderDialogProps {
  order: OrderSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
}: EditOrderDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateOrderInput>({
    order_number: order?.order_number || "",
    total_amount: order?.total_amount || 0,
    estimated_delivery_date: order?.estimated_delivery_date || undefined,
    notes: order?.notes || "",
  });

  // Update order mutation
  const { mutate: updateOrder, isPending } = useMutation({
    mutationFn: async (input: UpdateOrderInput) => {
      if (!order) throw new Error("No order selected");

      // Check if order number is unique if it was changed
      if (input.order_number && input.order_number !== order.order_number) {
        const { data: existingOrder, error: checkError } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", input.order_number)
          .neq("id", order.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingOrder) {
          throw new Error("Order number already exists");
        }
      }

      const { error } = await supabase
        .from("orders")
        .update({
          ...input,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", order.id);

      if (error) throw error;

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-900">
            Edit Order #{order?.order_number}
          </DialogTitle>
          <DialogDescription>
            Edit order details. Use &quot;Update Status&quot; or &quot;Add
            Payment&quot; for those specific actions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="order_number" className="text-red-900">
                Order Number
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="order_number"
                  value={formData.order_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order_number: e.target.value,
                    })
                  }
                  className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
                />
              </div>
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
              <Label htmlFor="estimated_delivery_date" className="text-red-900">
                Estimated Delivery Date
              </Label>
              <DatePicker
                value={
                  formData.estimated_delivery_date
                    ? new Date(formData.estimated_delivery_date)
                    : undefined
                }
                onChange={(date) => {
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
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="pl-9 min-h-[120px] border-red-100 focus:border-red-200 focus:ring-red-100"
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
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
