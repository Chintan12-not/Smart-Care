-- Smart Care & Mobile Point Database Migration - Phase 2 Initial Schema
-- Target Database: Supabase PostgreSQL (Postgres 15+)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------
-- Custom ENUM Types
-- --------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff', 'technician', 'delivery');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'failed');
CREATE TYPE repair_status AS ENUM ('booked', 'picked_up', 'inspecting', 'repairing', 'repaired', 'out_for_delivery', 'delivered');

-- --------------------------------------------------
-- 1. Profiles & User Accounts
-- --------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    role user_role NOT NULL DEFAULT 'customer',
    preferred_language TEXT DEFAULT 'en',
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 2. Physical Stores (Kendras/Shops)
-- --------------------------------------------------
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    contact_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert local default store
INSERT INTO stores (name, address, latitude, longitude, contact_number, is_active)
VALUES ('Smart Care & Mobile Point - Headquarters', 'Shop No. 5, Jan Aushadhi Block, Main Market, Sector 15, Dwarka, New Delhi, India', 28.5921, 77.0465, '+919999999999', true);

-- --------------------------------------------------
-- 3. Medicines Catalogue (Jan Aushadhi Kendra Catalog)
-- --------------------------------------------------
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generic_name TEXT NOT NULL,
    brand_name TEXT,
    symptoms TEXT[] DEFAULT '{}',
    diseases TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    manufacturer TEXT,
    uses TEXT,
    dosage TEXT,
    warnings TEXT,
    side_effects TEXT,
    interactions TEXT,
    pregnancy_warning TEXT,
    storage TEXT,
    brand_price NUMERIC(10,2),
    jan_aushadhi_price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 4. Store Medicine Inventory
-- --------------------------------------------------
CREATE TABLE store_medicine_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, medicine_id)
);

-- --------------------------------------------------
-- 5. Accessories Catalogue
-- --------------------------------------------------
CREATE TABLE accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. 'charger', 'case', 'tempered_glass', 'audio', 'power_bank'
    subcategory TEXT,
    brand TEXT NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    rating_avg NUMERIC(2,1) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 6. Orders Table (Unified medicines & accessories)
-- --------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
    payment_id TEXT, -- Razorpay Transaction/Order ID
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    shipping_fee NUMERIC(10,2) DEFAULT 0.00,
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 7. Order Items
-- --------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('medicine', 'accessory')),
    product_id UUID NOT NULL, -- references medicines(id) or accessories(id)
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 8. Prescriptions (OCR & Uploads)
-- --------------------------------------------------
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    ocr_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 9. Mobile Repairs Booking
-- --------------------------------------------------
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    device_model TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    status repair_status NOT NULL DEFAULT 'booked',
    estimate_cost NUMERIC(10,2),
    estimate_time TEXT,
    technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tracking_history JSONB DEFAULT '[]'::jsonb, -- Array of objects: { status, notes, timestamp }
    warranty_months INTEGER DEFAULT 3,
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 10. Repair Chat Messages
-- --------------------------------------------------
CREATE TABLE repair_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 11. AI Assistants Logs & Conversations
-- --------------------------------------------------
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assistant_type TEXT NOT NULL CHECK (assistant_type IN ('health', 'mobile')),
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 12. Medicine Daily Reminders
-- --------------------------------------------------
CREATE TABLE medicine_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    reminder_times TIME[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- 13. Blog Articles
-- --------------------------------------------------
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('health', 'medicine_guide', 'technology', 'repair_guide', 'buying_guide')),
    tags TEXT[] DEFAULT '{}',
    seo_meta JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------
-- Indexes for Queries at 10M Scale
-- --------------------------------------------------
CREATE INDEX idx_medicines_search ON medicines USING gin(to_tsvector('english', generic_name || ' ' || COALESCE(brand_name, '') || ' ' || array_to_string(symptoms, ' ') || ' ' || array_to_string(diseases, ' ')));
CREATE INDEX idx_accessories_category ON accessories (category, brand);
CREATE INDEX idx_accessories_price ON accessories (price);
CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_repairs_user ON repairs (user_id);
CREATE INDEX idx_repairs_status ON repairs (status);
CREATE INDEX idx_ai_messages_convo ON ai_messages (conversation_id);
CREATE INDEX idx_medicine_reminders_user ON medicine_reminders (user_id);

-- --------------------------------------------------
-- Automatic Update Timestamps Triggers
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- --------------------------------------------------
-- Row Level Security (RLS) Configuration
-- --------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit their own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders Policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view and update all orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Repairs Policies
CREATE POLICY "Users can view own repairs" ON repairs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own repairs" ON repairs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Technicians and Admins can view/update all repairs" ON repairs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'technician'))
);

-- Chat Policies
CREATE POLICY "Chat viewable by repair owner/technician/admin" ON repair_messages FOR SELECT USING (
    auth.uid() = sender_id OR 
    EXISTS (
        SELECT 1 FROM repairs 
        WHERE repairs.id = repair_id 
        AND (repairs.user_id = auth.uid() OR repairs.technician_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Chat insertable by repair owner/technician/admin" ON repair_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- AI Conversations Policies
CREATE POLICY "Users can manage own AI conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- AI Messages Policies
CREATE POLICY "Users can manage own AI messages" ON ai_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = conversation_id AND ai_conversations.user_id = auth.uid())
);

-- Medicine Reminders Policies
CREATE POLICY "Users can manage own reminders" ON medicine_reminders FOR ALL USING (auth.uid() = user_id);
