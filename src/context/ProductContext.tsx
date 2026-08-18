import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Category } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProducts as initialProducts } from '../mockData';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, newImages: Record<number, File>) => Promise<void>;
  updateProduct: (updated: Product, newImages: Record<number, File>, removedImages?: string[]) => Promise<void>;
  updateProductTags: (id: string, tags: string[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured, falling back to mock data");
      setProducts(initialProducts);
      setCategories([
        { id: '1', name: 'Best Seller', slug: 'best-seller' },
        { id: '2', name: 'Under 50K', slug: 'under-50k' },
        { id: '3', name: 'Under 100K', slug: 'under-100k' },
        { id: '4', name: 'Express', slug: 'express' },
        { id: '5', name: 'New Product', slug: 'new-product' },
        { id: '6', name: 'R&D', slug: 'rnd' },
        { id: '7', name: 'Discontinue', slug: 'discontinue' },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (!catError && catData) {
        setCategories(catData);
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, sort_order),
          product_categories(
            categories(name)
          )
        `);

      if (fetchError) throw fetchError;

      const formattedProducts: Product[] = (data || []).map((dbItem: any) => {
        const tags = dbItem.product_categories
          ?.map((pc: any) => pc.categories?.name)
          .filter(Boolean) || [];
          
        const images = (dbItem.product_images || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => img.image_url);

        return {
          id: dbItem.id,
          name: dbItem.product_name,
          categoryId: tags.length > 0 ? tags[0] : '', // Fallback for UI
          produk: dbItem.produk || '',
          subProduk: dbItem.sub_produk || '',
          color: dbItem.color || '',
          rincianPenawaran: dbItem.rincian_penawaran || '',
          price: Number(dbItem.price),
          minimalOrder: Number(dbItem.stock),
          status: dbItem.status as any,
          description: dbItem.description || '',
          specifications: dbItem.specification || '',
          material: dbItem.material || '',
          size: dbItem.size || '',
          weight: dbItem.weight || '',
          productionInfo: dbItem.production_info || '',
          internalNotes: dbItem.internal_notes || '',
          thumbnail: images[0] || '',
          images: images,
          tags: tags,
          createdAt: dbItem.created_at,
          updatedAt: dbItem.updated_at
        };
      });

      // Sort by creation date descending
      setProducts(formattedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error("Fetch products error:", err);
      setError(err.message || 'Failed to fetch products');
      setProducts(initialProducts); // fallback for dev
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (productId: string, newImages: Record<number, File>) => {
    const urls: { [key: number]: string } = {};
    for (const [indexStr, file] of Object.entries(newImages)) {
      const index = parseInt(indexStr);
      const ext = file.name.split('.').pop();
      const path = `${productId}/${index}-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);
        
      urls[index] = data.publicUrl;
    }
    return urls;
  };

  const getCategoryIds = (tags: string[]) => {
    if (tags.length === 0) return [];
    const matchIds = categories.filter(cat => 
      tags.some(tag => tag.toLowerCase() === cat.name.toLowerCase())
    ).map(cat => cat.id);
    return matchIds;
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, newImages: Record<number, File>) => {
    if (!isSupabaseConfigured()) {
      const newP: Product = { ...product, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setProducts(prev => [newP, ...prev]);
      return;
    }

    try {
      const { data: prodData, error: prodErr } = await supabase.from('products').insert({
        product_code: `PRD-${Date.now()}`,
        product_name: product.name,
        produk: product.produk,
        sub_produk: product.subProduk,
        color: product.color,
        rincian_penawaran: product.rincianPenawaran,
        price: product.price,
        stock: product.minimalOrder,
        status: product.status,
        description: product.description,
        specification: product.specifications,
        material: product.material,
        size: product.size,
        weight: product.weight,
        production_info: product.productionInfo,
        internal_notes: product.internalNotes
      }).select().single();
      
      if (prodErr) {
        if (prodErr.code === '23505') throw new Error('Product Code sudah digunakan.');
        throw prodErr;
      }
      
      const productId = prodData.id;

      const uploadedUrls = await uploadImages(productId, newImages);
      const allImages = [...(product.images || [])];
      for (const [idx, url] of Object.entries(uploadedUrls)) {
        allImages[parseInt(idx)] = url;
      }
      
      const imageInserts = allImages.map((url, i) => ({
        product_id: productId,
        image_url: url,
        sort_order: i + 1
      })).filter(img => img.image_url);

      if (imageInserts.length > 0) {
        await supabase.from('product_images').insert(imageInserts);
      }

      const catIds = getCategoryIds(product.tags);
      if (catIds.length > 0) {
        const catInserts = catIds.map(cid => ({
          product_id: productId,
          category_id: cid
        }));
        await supabase.from('product_categories').insert(catInserts);
      }

      await refreshProducts();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateProduct = async (updated: Product, newImages: Record<number, File> = {}, removedImages: string[] = []) => {
    if (!isSupabaseConfigured()) {
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      return;
    }

    try {
      const { error: prodErr } = await supabase.from('products').update({
        product_name: updated.name,
        produk: updated.produk,
        sub_produk: updated.subProduk,
        color: updated.color,
        rincian_penawaran: updated.rincianPenawaran,
        price: updated.price,
        stock: updated.minimalOrder,
        status: updated.status,
        description: updated.description,
        specification: updated.specifications,
        material: updated.material,
        size: updated.size,
        weight: updated.weight,
        production_info: updated.productionInfo,
        internal_notes: updated.internalNotes,
        updated_at: new Date().toISOString()
      }).eq('id', updated.id);
      
      if (prodErr) {
        if (prodErr.code === '23505') throw new Error('Product Code sudah digunakan.');
        throw prodErr;
      }

      // Delete removed images from storage
      if (removedImages.length > 0) {
        const pathsToDelete = removedImages.map(url => {
          const parts = url.split('product-images/');
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean) as string[];
        
        if (pathsToDelete.length > 0) {
          await supabase.storage.from('product-images').remove(pathsToDelete);
        }
      }

      const uploadedUrls = await uploadImages(updated.id, newImages);
      const allImages = [...(updated.images || [])];
      for (const [idx, url] of Object.entries(uploadedUrls)) {
        allImages[parseInt(idx)] = url;
      }

      await supabase.from('product_images').delete().eq('product_id', updated.id);
      const imageInserts = allImages.map((url, i) => ({
        product_id: updated.id,
        image_url: url,
        sort_order: i + 1
      })).filter(img => img.image_url);

      if (imageInserts.length > 0) {
        await supabase.from('product_images').insert(imageInserts);
      }

      await supabase.from('product_categories').delete().eq('product_id', updated.id);
      const catIds = getCategoryIds(updated.tags);
      if (catIds.length > 0) {
        const catInserts = catIds.map(cid => ({
          product_id: updated.id,
          category_id: cid
        }));
        await supabase.from('product_categories').insert(catInserts);
      }

      await refreshProducts();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateProductTags = async (id: string, tags: string[]) => {
    if (!isSupabaseConfigured()) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, tags } : p));
      return;
    }
    try {
      await supabase.from('product_categories').delete().eq('product_id', id);
      const catIds = getCategoryIds(tags);
      if (catIds.length > 0) {
        const catInserts = catIds.map(cid => ({
          product_id: id,
          category_id: cid
        }));
        await supabase.from('product_categories').insert(catInserts);
      }
      setProducts(prev => prev.map(p => p.id === id ? { ...p, tags } : p));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      const { data } = await supabase.storage.from('product-images').list(id);
      if (data && data.length > 0) {
         await supabase.storage.from('product-images').remove(data.map(f => `${id}/${f.name}`));
      }

      await refreshProducts();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      categories,
      isLoading, 
      error, 
      refreshProducts, 
      addProduct, 
      updateProduct, 
      updateProductTags,
      deleteProduct 
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
