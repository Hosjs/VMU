export interface Settlement {
  id: number;
  invoice_id: number;
  amount: number;
  settlement_date: string;
  method: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

