import React, { createContext, useContext, useState, useEffect } from 'react';
import { RndProduct, RndHistory, RndStep } from '../types';

interface RndContextType {
  products: RndProduct[];
  histories: RndHistory[];
  addProduct: (product: Omit<RndProduct, 'id' | 'current_step' | 'start_date' | 'last_update' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, updates: Partial<RndProduct>) => void;
  moveProduct: (productId: string, toStep: RndStep, changedBy: string) => void;
  deleteProduct: (id: string) => void;
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

const mockInitialProducts: RndProduct[] = [
  {
    id: 'rnd-1',
    product_name: 'Payung Fullprint',
    pic: 'Andi',
    current_step: 'Cari Vendor',
    start_date: '2026-08-10T00:00:00.000Z',
    last_update: '2026-08-18T00:00:00.000Z',
    deadline: '2026-08-25T00:00:00.000Z',
    notes: 'Vendor dari Bandung',
    created_at: '2026-08-10T00:00:00.000Z',
    updated_at: '2026-08-18T00:00:00.000Z',
  },
  {
    id: 'rnd-2',
    product_name: 'Tumbler Insert Paper',
    pic: 'Dita',
    current_step: 'Design',
    start_date: '2026-08-12T00:00:00.000Z',
    last_update: '2026-08-17T00:00:00.000Z',
    deadline: '2026-08-27T00:00:00.000Z',
    notes: 'Revisi logo sedikit',
    created_at: '2026-08-12T00:00:00.000Z',
    updated_at: '2026-08-17T00:00:00.000Z',
  },
  {
    id: 'rnd-3',
    product_name: 'Hardbox Premium',
    pic: 'Andi',
    current_step: 'Update Modal',
    start_date: '2026-08-01T00:00:00.000Z',
    last_update: '2026-08-16T00:00:00.000Z',
    deadline: '2026-08-23T00:00:00.000Z',
    notes: '',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-16T00:00:00.000Z',
  }
];

const mockInitialHistories: RndHistory[] = [
  {
    id: 'hist-1',
    product_id: 'rnd-2',
    from_step: 'Cari Vendor',
    to_step: 'Design',
    changed_by: 'Dita',
    changed_at: '2026-08-17T00:00:00.000Z'
  }
];

export function RndProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<RndProduct[]>(() => {
    const saved = localStorage.getItem('manpro_rnd_products');
    return saved ? JSON.parse(saved) : mockInitialProducts;
  });

  const [histories, setHistories] = useState<RndHistory[]>(() => {
    const saved = localStorage.getItem('manpro_rnd_histories');
    return saved ? JSON.parse(saved) : mockInitialHistories;
  });

  useEffect(() => {
    localStorage.setItem('manpro_rnd_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('manpro_rnd_histories', JSON.stringify(histories));
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

  return (
    <RndContext.Provider value={{ products, histories, addProduct, updateProduct, moveProduct, deleteProduct }}>
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
