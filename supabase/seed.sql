-- ==============================================================================
-- DUKAAN POS - SEED DATA FOR PAKISTAN RETAIL & PHARMACY STORE DEMO
-- ==============================================================================

-- 1. Insert Default Store
INSERT INTO public.stores (id, name, address, phone, ntn, fbr_pos_id, fbr_bearer_token, fbr_environment, tax_rate)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Al-Madina Retail & Pharmacy',
    'Shop #14, Main Commercial Market, Gulberg III, Lahore',
    '+92 300 8472910',
    '7891234-5',
    '123456',
    'fbr-sandbox-bearer-token-12345',
    'sandbox',
    18.00
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Default Users
INSERT INTO public.users (id, store_id, email, full_name, role)
VALUES 
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@almadina.pk',
    'Muhammad Usman (Manager)',
    'admin'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'cashier@almadina.pk',
    'Tariq Ahmed (Cashier)',
    'cashier'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Retail & Pharmacy Products
INSERT INTO public.products (id, store_id, name, barcode, category, price, cost_price, stock_qty, min_stock_alert, expiry_date, batch_no)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Panadol Extra 500mg (Pack of 100)',
    '8964000123456',
    'Pharmacy',
    450.00,
    380.00,
    85,
    15,
    '2027-08-31',
    'B2408'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Brufen 400mg Syrup 120ml',
    '8964000123457',
    'Pharmacy',
    180.00,
    145.00,
    12,
    10,
    '2026-10-15', -- Expiring soon test!
    'BR981'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Olper Milk 1 Litre Tetra Pack',
    '8964000998877',
    'Grocery',
    340.00,
    310.00,
    4, -- Low stock test!
    10,
    '2026-11-20',
    'OLP-902'
),
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Lipton Yellow Label Tea 475g',
    '8964000445566',
    'Grocery',
    1250.00,
    1100.00,
    40,
    5,
    '2028-01-01',
    'LIP-102'
),
(
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Shan Biryani Masala 50g',
    '8964000112233',
    'Spices',
    160.00,
    135.00,
    120,
    20,
    '2027-12-31',
    'SH-551'
),
(
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'Surf Excel Washing Powder 1kg',
    '8964000778899',
    'Household',
    780.00,
    690.00,
    28,
    8,
    NULL,
    'SE-309'
),
(
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'Disprin 300mg (Pack of 100)',
    '8964000334455',
    'Pharmacy',
    220.00,
    175.00,
    3, -- Low stock test!
    15,
    '2026-09-30', -- Expiring soon!
    'DSP-11'
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Customers with Khata Ledgers
INSERT INTO public.customers (id, store_id, name, phone, address, current_balance)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Chaudhry Rashid Sahib',
    '+92 321 4567890',
    'House #45, Block C, Gulberg III, Lahore',
    3450.00 -- Owes PKR 3,450
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Bilal Hassan',
    '+92 301 9876543',
    'Flat #3, Doctors Colony, Lahore',
    1200.00 -- Owes PKR 1,200
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Haji Sheikh Imran',
    '+92 333 5551234',
    'Plaza 4, Main Market, Lahore',
    0.00 -- Clear Khata
) ON CONFLICT (id) DO NOTHING;
