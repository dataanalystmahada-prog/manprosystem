export type ProductStatus = 'Active' | 'Draft' | 'Archived';
export type PosterStatus = 'Aktif' | 'Draft' | 'Tidak Aktif';
export type ProductTag = string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  produk?: string;
  subProduk?: string;
  color?: string;
  rincianPenawaran?: string;
  price: number;
  priceSample?: number;
  minimalOrder: number;
  status: ProductStatus;
  description: string;
  thumbnail?: string;
  images?: string[];
  specifications?: string;
  material?: string;
  size?: string;
  weight?: string;
  productionInfo?: string;
  internalNotes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Poster {
  id: string;
  poster_name: string;
  product_id: string;
  product_name: string;
  category: string;
  image_url: string;
  description: string;
  status: PosterStatus;
  created_at: string;
  updated_at: string;
}

export interface RecommendationPeriod {
  id: string;
  period_name: string; // e.g., "Agustus 2026"
  start_date: string;
  end_date: string;
  max_recommendations: number;
  status: 'Aktif' | 'Draft' | 'Archived';
}

export interface Recommendation {
  id: string;
  period_id: string;
  poster_id: string;
  ranking: number;
  created_at: string;
  updated_at: string;
}

export type RndStep = 
  | 'Cari Vendor'
  | 'Design'
  | 'Sample'
  | 'Photo / Video'
  | 'Update Modal'
  | 'Update Manpro'
  | 'Poster'
  | 'Launching';

export interface RndProduct {
  id: string;
  product_name: string;
  pic: string;
  current_step: RndStep;
  start_date: string;
  last_update: string;
  deadline: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface RndHistory {
  id: string;
  product_id: string;
  from_step: RndStep;
  to_step: RndStep;
  changed_by: string;
  changed_at: string;
}

