export interface Customer {
  id: string;
  studio_name: string;
  email: string;
  phone: string;
  address: string;
  reference_phone: string | null;
  reference_name: string | null;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerFlag {
  id: string;
  customer_id: string;
  reason: string;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  // Additional fields from the view
  studio_name?: string;
  email?: string;
}

export interface CreateCustomerInput {
  studio_name: string;
  email: string;
  phone: string;
  address: string;
  reference_phone?: string;
  reference_name?: string;
}

export interface UpdateCustomerInput {
  studio_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  reference_phone?: string;
  reference_name?: string;
  is_active?: boolean;
}

export interface CreateCustomerFlagInput {
  customer_id: string;
  reason: string;
}

export interface ResolveCustomerFlagInput {
  flag_id: string;
  resolution_note: string;
}

export interface CustomerPreviousBalance {
  id: string;
  customer_id: string;
  total_amount: number;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CustomerBalancePayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes: string | null;
  created_by: string;
}

export interface CustomerBalanceLog {
  id: string;
  customer_id: string;
  action: string;
  details: string;
  created_at: string;
  created_by: string;
}

export interface CustomerBalanceSummary {
  customer_id: string;
  studio_name: string;
  email: string;
  phone: string;
  previous_balance_total: number;
  previous_balance_paid: number;
  previous_balance_remaining: number;
  total_spent: number;
  pending_orders_amount: number;
  total_balance: number;
}

export interface AddPreviousBalanceInput {
  customer_id: string;
  total_amount: number;
  notes?: string;
}

export interface AddBalancePaymentInput {
  customer_id: string;
  amount: number;
  payment_method: string;
  notes?: string;
}
