import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, logActivity } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { Customer } from "@/lib/types/customer";

const supabase = createClient();

export function AddCustomerDialog({
  open,
  onOpenChange,
  onCustomerCreated,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated?: (customer: Customer) => void;
  initialValues?: Partial<Customer>;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(
    initialValues || {
      studio_name: "",
      email: "",
      phone: "",
      address: "",
      reference_name: "",
      reference_phone: "",
    }
  );
  const [isCreating, setIsCreating] = useState(false);

  const addCustomerMutation = useMutation({
    mutationFn: async (input: Partial<Customer>) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      // Log customer creation
      await logActivity("customer_created", {
        customer_id: data.id,
        studio_name: data.studio_name,
        email: data.email,
        phone: data.phone,
      });
      return data;
    },
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setForm({
        studio_name: "",
        email: "",
        phone: "",
        address: "",
        reference_name: "",
        reference_phone: "",
      });
      onOpenChange(false);
      if (onCustomerCreated) onCustomerCreated(customer);
      toast.success("Customer created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create customer: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-900">
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Create a new customer profile. Fill in all the required details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsCreating(true);
            addCustomerMutation.mutate(form, {
              onSettled: () => setIsCreating(false),
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studio_name" className="text-red-900">
                Name / Studio Name *
              </Label>
              <Input
                id="studio_name"
                value={form.studio_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studio_name: e.target.value }))
                }
                placeholder="John Doe / ABC Photography"
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-red-900">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="customer@example.com"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-red-900">
                  Contact Number *
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-red-900">
                Address *
              </Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="123 Main St, City, State"
                className="border-red-100 focus:border-red-200 focus:ring-red-100 min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reference_phone" className="text-red-900">
                  Reference Phone (Optional)
                </Label>
                <Input
                  id="reference_phone"
                  value={form.reference_phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference_phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reference_name" className="text-red-900">
                  Reference Name (Optional)
                </Label>
                <Input
                  id="reference_name"
                  value={form.reference_name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference_name: e.target.value }))
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
              onClick={() => onOpenChange(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !form.studio_name ||
                !form.email ||
                !form.phone ||
                !form.address ||
                isCreating
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
