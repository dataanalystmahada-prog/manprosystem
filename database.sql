-- Supabase Database Schema

-- Drop existing tables for clean setup (optional)
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Categories
INSERT INTO categories (name, slug) VALUES
  ('Best Seller', 'best-seller'),
  ('Under 50K', 'under-50k'),
  ('Under 100K', 'under-100k'),
  ('Express', 'express'),
  ('New Product', 'new-product'),
  ('R&D', 'rnd'),
  ('Discontinue', 'discontinue');

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT UNIQUE,
  product_name TEXT NOT NULL,
  produk TEXT,
  sub_produk TEXT,
  color TEXT,
  rincian_penawaran TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  description TEXT,
  specification TEXT,
  material TEXT,
  size TEXT,
  weight TEXT,
  production_info TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Categories (Many-to-Many)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Storage Bucket for Product Images
-- This requires the Supabase "storage" schema to be available.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies to allow public read and anonymous uploads (for development)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Anon Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Anon Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Anon Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Set up Row Level Security (RLS) for our tables to allow anonymous access (for development without auth)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon everything on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon everything on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon everything on product_categories" ON product_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon everything on product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);
