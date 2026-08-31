import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { KetentuanPoster } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface KetentuanContextType {
  posters: KetentuanPoster[];
  isLoading: boolean;
  error: string | null;
  refreshPosters: () => Promise<void>;
  addPoster: (poster: Omit<KetentuanPoster, 'id' | 'created_at'>, file: File) => Promise<void>;
  updatePoster: (id: string, poster: Partial<Omit<KetentuanPoster, 'id' | 'created_at'>>, file?: File) => Promise<void>;
  deletePoster: (id: string) => Promise<void>;
}

const KetentuanContext = createContext<KetentuanContextType | undefined>(undefined);

// Mock data for fallback
const mockPosters: KetentuanPoster[] = [
  {
    id: 'mock-1',
    poster_name: 'Ketentuan Garansi',
    product_name: 'Semua Produk',
    image_url: 'https://images.unsplash.com/photo-1544396821-4dd40b938ebc?w=400&q=80',
    description: 'Syarat dan ketentuan garansi produk.',
    created_at: new Date().toISOString(),
  }
];

export function KetentuanProvider({ children }: { children: ReactNode }) {
  const [posters, setPosters] = useState<KetentuanPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshPosters();
  }, []);

  const refreshPosters = async () => {
    setIsLoading(true);
    setError(null);
    if (!isSupabaseConfigured()) {
      setPosters(mockPosters);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('ketentuan_posters')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPosters(data || []);
    } catch (err: any) {
      console.error("Fetch ketentuan posters error:", err);
      setError(err.message || 'Failed to fetch posters');
      setPosters(mockPosters); // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const addPoster = async (poster: Omit<KetentuanPoster, 'id' | 'created_at'>, file: File) => {
    if (!isSupabaseConfigured()) {
      const newP: KetentuanPoster = {
        ...poster,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setPosters(prev => [newP, ...prev]);
      return;
    }

    try {
      setIsLoading(true);
      // Upload image
      const ext = file.name.split('.').pop();
      const path = `ketentuan/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      // Insert record
      const { error: insertError } = await supabase
        .from('ketentuan_posters')
        .insert([{ ...poster, image_url: publicData.publicUrl }]);

      if (insertError) throw insertError;

      await refreshPosters();
    } catch (err: any) {
      console.error("Add poster error:", err);
      setError(err.message || 'Failed to add poster');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePoster = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setPosters(prev => prev.filter(p => p.id !== id));
      return;
    }
    
    try {
      setIsLoading(true);
      const { error: deleteError } = await supabase
        .from('ketentuan_posters')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      await refreshPosters();
    } catch (err: any) {
      console.error("Delete poster error:", err);
      setError(err.message || 'Failed to delete poster');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePoster = async (id: string, updates: Partial<Omit<KetentuanPoster, 'id' | 'created_at'>>, file?: File) => {
    if (!isSupabaseConfigured()) {
      setPosters(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return;
    }

    try {
      setIsLoading(true);
      let imageUrl = updates.image_url;

      if (file) {
        // Upload new image
        const ext = file.name.split('.').pop();
        const path = `ketentuan/${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);
          
        imageUrl = publicData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('ketentuan_posters')
        .update({ ...updates, ...(imageUrl ? { image_url: imageUrl } : {}) })
        .eq('id', id);

      if (updateError) throw updateError;

      await refreshPosters();
    } catch (err: any) {
      console.error("Update poster error:", err);
      setError(err.message || 'Failed to update poster');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KetentuanContext.Provider value={{ posters, isLoading, error, refreshPosters, addPoster, updatePoster, deletePoster }}>
      {children}
    </KetentuanContext.Provider>
  );
}

export function useKetentuan() {
  const context = useContext(KetentuanContext);
  if (context === undefined) {
    throw new Error('useKetentuan must be used within a KetentuanProvider');
  }
  return context;
}
