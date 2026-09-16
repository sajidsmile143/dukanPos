export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  ntn?: string;
  fbr_pos_id?: string;
  fbr_bearer_token?: string;
  fbr_environment: 'sandbox' | 'production';
  tax_rate: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  min_stock_alert: number;
  expiry_date?: string | null;
  batch_no?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  address?: string;
  current_balance: number; // Positive balance = customer owes store
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  store_id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  invoice_no: string;
  subtotal: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'khata' | 'split';
  fbr_invoice_no?: string | null;
  fbr_status: 'synced' | 'pending' | 'failed' | 'not_applicable';
  fbr_response?: any;
  items: SaleItem[];
  created_at: string;
}

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
}

export interface KhataTransaction {
  id: string;
  store_id: string;
  customer_id: string;
  sale_id?: string | null;
  type: 'debit' | 'credit';
  amount: number;
  notes?: string;
  created_at: string;
}

export interface FbrInvoicePayload {
  InvoiceNumber: string;
  POSID: number;
  USIN: string;
  DateTime: string;
  TotalQuantity: number;
  TotalBillAmount: number;
  TotalSaleValue: number;
  TotalTaxCharged: number;
  Discount: number;
  FurtherTax: number;
  PaymentMode: number;
  RefUSIN?: string | null;
  InvoiceType: number;
  Items: {
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    PCTCode: string;
    TaxRate: number;
    SaleValue: number;
    TotalAmount: number;
    TaxCharged: number;
    Discount: number;
    FurtherTax: number;
    InvoiceType: number;
    RefUSIN?: string | null;
  }[];
}
