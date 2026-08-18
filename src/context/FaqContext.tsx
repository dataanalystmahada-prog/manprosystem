import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FaqItem {
  id: string;
  product: string;
  subProduct: string;
  question: string;
  answer: string;
}

interface FaqContextType {
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (updated: FaqItem) => void;
  deleteFaq: (id: string) => void;
}

const defaultFaqs: FaqItem[] = [
  {
    id: '1',
    product: 'ALL Produk',
    subProduct: 'ALL Sub Produk',
    question: 'Berapa lama proses pengerjaan?',
    answer: 'Proses pengerjaan normal adalah 7-14 hari kerja setelah desain disetujui dan DP masuk.'
  }
];

const FaqContext = createContext<FaqContextType | undefined>(undefined);

export function FaqProvider({ children }: { children: React.ReactNode }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem('manpro_faqs');
    return saved ? JSON.parse(saved) : defaultFaqs;
  });

  useEffect(() => {
    localStorage.setItem('manpro_faqs', JSON.stringify(faqs));
  }, [faqs]);

  const addFaq = (faq: Omit<FaqItem, 'id'>) => {
    const newFaq = { ...faq, id: Date.now().toString() };
    setFaqs(prev => [newFaq, ...prev]);
  };

  const updateFaq = (updated: FaqItem) => {
    setFaqs(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const deleteFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FaqContext.Provider value={{ faqs, addFaq, updateFaq, deleteFaq }}>
      {children}
    </FaqContext.Provider>
  );
}

export function useFaqs() {
  const context = useContext(FaqContext);
  if (context === undefined) {
    throw new Error('useFaqs must be used within a FaqProvider');
  }
  return context;
}
