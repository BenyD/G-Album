export type OrderStatus = "pending" | "in_progress" | "completed" | "delivered";

export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Card" | "Other";

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  amount_paid: number;
  estimated_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_by: string;
}

export interface OrderSettings {
  id: string;
  prefix: string;
  last_sequence_number: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface OrderSummary extends Order {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  balance_amount: number;
  payment_count: number;
}

export interface CreateOrderInput {
  customer_id: string;
  order_number?: string; // Optional, will be auto-generated if not provided
  total_amount: number;
  amount_paid?: number | undefined; // Initial payment amount
  payment_method?: PaymentMethod | undefined; // Initial payment method
  estimated_delivery_date?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  total_amount?: number;
  estimated_delivery_date?: string;
  notes?: string;
}

export interface CreateOrderPaymentInput {
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderSettingsInput {
  prefix?: string;
  last_sequence_number?: number;
}
 