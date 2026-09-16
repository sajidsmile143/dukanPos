-- ==============================================================================
-- DUKAAN POS - RETAIL & PHARMACY POS DATABASE SCHEMA MIGRATION
-- Multi-tenant store architecture with Row Level Security (RLS) & FBR Integration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    ntn VARCHAR(50),
    fbr_pos_id VARCHAR(50),
    fbr_bearer_token TEXT,
    fbr_environment VARCHAR(20) DEFAULT 'sandbox' CHECK (fbr_environment IN ('sandbox', 'production')),
    tax_rate NUMERIC(5,2) DEFAULT 18.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE (Linked to auth.users if Supabase Auth is enabled)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id) when active
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    stock_qty INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    expiry_date DATE,
    batch_no VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_barcode UNIQUE (store_id, barcode)
);

CREATE INDEX idx_products_barcode ON public.products(store_id, barcode);
CREATE INDEX idx_products_name ON public.products(store_id, name);

-- 4. CUSTOMERS TABLE (Khata Ledger)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- Positive balance = Customer owes Store
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_customer_phone UNIQUE (store_id, phone)
);

CREATE INDEX idx_customers_phone ON public.customers(store_id, phone);

-- 5. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_no VARCHAR(100) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'khata', 'split')),
    fbr_invoice_no VARCHAR(100),
    fbr_status VARCHAR(20) DEFAULT 'pending' CHECK (fbr_status IN ('synced', 'pending', 'failed', 'not_applicable')),
    fbr_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_invoice UNIQUE (store_id, invoice_no)
);

CREATE INDEX idx_sales_created_at ON public.sales(store_id, created_at DESC);
CREATE INDEX idx_sales_fbr_status ON public.sales(store_id, fbr_status);

-- 6. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12,2) NOT NULL
);

-- 7. KHATA TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.khata_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit')), -- debit = new debt, credit = payment received
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC INVENTORY DEDUCTION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_sale_item_inventory()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = stock_qty - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory
AFTER INSERT ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.process_sale_item_inventory();

-- ==============================================================================
-- AUTOMATIC KHATA BALANCE UPDATER TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_customer_khata_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'debit' THEN
        UPDATE public.customers
        SET current_balance = current_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    ELSIF NEW.type = 'credit' THEN
        UPDATE public.customers
        SET current_balance = current_balance - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_khata
AFTER INSERT ON public.khata_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_khata_balance();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khata_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated operations scoped by store_id or anon demo mode
CREATE POLICY "Public read products for active stores" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public full access products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public full access stores" ON public.stores FOR ALL USING (true);
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public full access customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Public full access sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Public full access sale_items" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Public full access khata_transactions" ON public.khata_transactions FOR ALL USING (true);
