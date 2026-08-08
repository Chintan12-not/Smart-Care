-- Migration: Create Repair Estimator Config table
-- Target: Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.repair_estimator_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL UNIQUE,
    multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    screen_base_price NUMERIC(10,2) NOT NULL DEFAULT 2499.00,
    battery_base_price NUMERIC(10,2) NOT NULL DEFAULT 1299.00,
    speaker_base_price NUMERIC(10,2) NOT NULL DEFAULT 899.00,
    diagnostics_base_price NUMERIC(10,2) NOT NULL DEFAULT 699.00,
    other_base_price NUMERIC(10,2) NOT NULL DEFAULT 999.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.repair_estimator_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.repair_estimator_config
    FOR SELECT TO public USING (true);

-- Allow authenticated service role/admin write access
CREATE POLICY "Allow admin all access" ON public.repair_estimator_config
    FOR ALL TO authenticated USING (true);

-- Insert default brand config
INSERT INTO public.repair_estimator_config (brand, multiplier, screen_base_price, battery_base_price, speaker_base_price, diagnostics_base_price, other_base_price)
VALUES 
('Apple', 1.8, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Samsung', 1.4, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('OnePlus', 1.4, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Vivo', 1.1, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Oppo', 1.1, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Xiaomi', 1.1, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Realme', 1.1, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Motorola', 1.1, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Nothing', 1.8, 2499.00, 1299.00, 899.00, 699.00, 999.00),
('Google Pixel', 1.8, 2499.00, 1299.00, 899.00, 699.00, 999.00)
ON CONFLICT (brand) DO NOTHING;
