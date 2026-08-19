import React, { createContext, useContext, useState, useEffect } from 'react';
import { RndProduct, RndHistory, RndStep } from '../types';

interface RndContextType {
  products: RndProduct[];
  histories: RndHistory[];
  addProduct: (product: Omit<RndProduct, 'id' | 'current_step' | 'start_date' | 'last_update' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, updates: Partial<RndProduct>) => void;
  moveProduct: (productId: string, toStep: RndStep, changedBy: string) => void;
  deleteProduct: (id: string) => void;
  completeProduct: (id: string) => void;
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

const mockInitialProducts: RndProduct[] = [];

const mockInitialHistories: RndHistory[] = [];

export function RndProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<RndProduct[]>(() => {
    const saved = localStorage.getItem('manpro_rnd_products_v2');
    return saved ? JSON.parse(saved) : mockInitialProducts;
  });

  const [histories, setHistories] = useState<RndHistory[]>(() => {
    const saved = localStorage.getItem('manpro_rnd_histories_v2');
    return saved ? JSON.parse(saved) : mockInitialHistories;
  });

  useEffect(() => {
    localStorage.setItem('manpro_rnd_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('manpro_rnd_histories_v2', JSON.stringify(histories));
  }, [histories]);

  const addProduct = (productData: Omit<RndProduct, 'id' | 'current_step' | 'start_date' | 'last_update' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newProduct: RndProduct = {
      ...productData,
      id: `rnd-${Date.now()}`,
      current_step: 'Cari Vendor',
      start_date: now,
      last_update: now,
      created_at: now,
      updated_at: now,
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<RndProduct>) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updated_at: new Date().toISOString() } 
        : p
    ));
  };

  const moveProduct = (productId: string, toStep: RndStep, changedBy: string) => {
    const now = new Date().toISOString();
    setProducts(prev => {
      const product = prev.find(p => p.id === productId);
      if (!product) return prev;
      
      if (product.current_step !== toStep) {
        // Create history entry
        const newHistory: RndHistory = {
          id: `hist-${Date.now()}`,
          product_id: productId,
          from_step: product.current_step,
          to_step: toStep,
          changed_by: changedBy,
          changed_at: now
        };
        setHistories(h => [newHistory, ...h]);
      }

      return prev.map(p => 
        p.id === productId 
          ? { ...p, current_step: toStep, last_update: now, updated_at: now } 
          : p
      );
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setHistories(prev => prev.filter(h => h.product_id !== id));
  };

  const completeProduct = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, is_completed: true, updated_at: new Date().toISOString() } : p
    ));
  };

  return (
    <RndContext.Provider value={{ products, histories, addProduct, updateProduct, moveProduct, deleteProduct, completeProduct }}>
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
