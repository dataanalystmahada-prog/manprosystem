import React, { createContext, useContext, useState, useEffect } from 'react';
import { RndProduct, RndHistory, RndStep } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RndContextType {
  products: RndProduct[];
  histories: RndHistory[];
  addProduct: (product: Omit<RndProduct, 'id' | 'current_step' | 'start_date' | 'last_update' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<RndProduct>) => Promise<void>;
  moveProduct: (productId: string, toStep: RndStep, changedBy: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  completeProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const RndContext = createContext<RndContextType | undefined>(undefined);

export const RND_STEPS: RndStep[] = [
  'Cari Vendor',
  'Design',
  'Sample',
  'Photo / Video',
  'Update Modal',
  'Update Manpro',
  'Poster',
  'Launching'
];

export function RndProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<RndProduct[]>([]);
  const [histories, setHistories] = useState<RndHistory[]>([]);

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data: prodData, error: prodErr } = await supabase
        .from('rnd_products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (prodErr) throw prodErr;
      
      const { data: histData, error: histErr } = await supabase
        .from('rnd_histories')
        .select('*')
        .order('changed_at', { ascending: false });
        
      if (histErr) throw histErr;
      
      setProducts(prodData || []);
      setHistories(histData || []);
    } catch (err) {
      console.error("Error fetching RND data:", err);
    }
  };

  const addProduct = async (productData: Omit<RndProduct, 'id' | 'current_step' | 'start_date' | 'last_update' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newProduct: RndProduct = {
      ...productData,
      id: tempId,
      current_step: 'Cari Vendor',
      start_date: now,
      last_update: now,
      created_at: now,
      updated_at: now,
      is_completed: false
    };
    setProducts(prev => [newProduct, ...prev]);

    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase.from('rnd_products').insert({
        product_name: productData.product_name,
        pic: productData.pic,
        current_step: 'Cari Vendor',
        start_date: now,
        last_update: now,
        deadline: productData.deadline,
        notes: productData.notes,
        is_completed: false,
        created_at: now,
        updated_at: now
      });
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Error adding RND product:", err);
      await refreshProducts(); // Revert on failure
    }
  };

  const updateProduct = async (id: string, updates: Partial<RndProduct>) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: now } : p));

    if (!isSupabaseConfigured() || id.startsWith('temp-')) return;

    try {
      const { error } = await supabase.from('rnd_products').update({
        ...updates,
        updated_at: now
      }).eq('id', id);
      
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Error updating RND product:", err);
      await refreshProducts(); // Revert on failure
    }
  };

  const moveProduct = async (productId: string, toStep: RndStep, changedBy: string) => {
    const now = new Date().toISOString();
    const product = products.find(p => p.id === productId);
    if (!product || product.current_step === toStep) return;
    
    const fromStep = product.current_step;

    // Optimistic update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_step: toStep, last_update: now, updated_at: now } : p));
    const newHistory: RndHistory = {
      id: `temp-hist-${Date.now()}`,
      product_id: productId,
      from_step: fromStep,
      to_step: toStep,
      changed_by: changedBy,
      changed_at: now
    };
    setHistories(h => [newHistory, ...h]);

    if (!isSupabaseConfigured() || productId.startsWith('temp-')) return;

    try {
      const { error: prodErr } = await supabase.from('rnd_products').update({
        current_step: toStep,
        last_update: now,
        updated_at: now
      }).eq('id', productId);
      if (prodErr) throw prodErr;

      const { error: histErr } = await supabase.from('rnd_histories').insert({
        product_id: productId,
        from_step: fromStep,
        to_step: toStep,
        changed_by: changedBy,
        changed_at: now
      });
      if (histErr) throw histErr;

      await refreshProducts();
    } catch (err) {
      console.error("Error moving RND product:", err);
      await refreshProducts(); // Revert
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setHistories(prev => prev.filter(h => h.product_id !== id));

    if (!isSupabaseConfigured() || id.startsWith('temp-')) return;

    try {
      const { error } = await supabase.from('rnd_products').delete().eq('id', id);
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Error deleting RND product:", err);
      await refreshProducts(); // Revert
    }
  };

  const completeProduct = async (id: string) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_completed: true, updated_at: now } : p));

    if (!isSupabaseConfigured() || id.startsWith('temp-')) return;

    try {
      const { error } = await supabase.from('rnd_products').update({
        is_completed: true,
        updated_at: now
      }).eq('id', id);
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Error completing RND product:", err);
      await refreshProducts(); // Revert
    }
  };

  return (
    <RndContext.Provider value={{ products, histories, addProduct, updateProduct, moveProduct, deleteProduct, completeProduct, refreshProducts }}>
      {children}
    </RndContext.Provider>
  );
}

export function useRnd() {
  const context = useContext(RndContext);
  if (context === undefined) {
    throw new Error('useRnd must be used within a RndProvider');
  }
  return context;
}

