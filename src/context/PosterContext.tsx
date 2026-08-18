import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Poster, RecommendationPeriod, Recommendation } from '../types';
import { useProducts } from './ProductContext';

interface PosterContextType {
  posters: Poster[];
  periods: RecommendationPeriod[];
  recommendations: Recommendation[];
  activePeriodId: string | null;
  setActivePeriodId: (id: string) => void;
  isLoading: boolean;
  
  // Period Actions
  addPeriod: (period: Omit<RecommendationPeriod, 'id'>) => void;
  updatePeriodLimit: (periodId: string, limit: number) => void;

  // Poster Actions
  addPoster: (poster: Omit<Poster, 'id' | 'created_at' | 'updated_at'>) => void;
  updatePoster: (poster: Poster) => void;
  deletePoster: (id: string) => void;

  // Recommendation Actions
  addRecommendation: (posterId: string) => void;
  removeRecommendation: (recommendationId: string) => void;
  updateRecommendationRankings: (reorderedRecommendations: Recommendation[]) => void;
}

const PosterContext = createContext<PosterContextType | undefined>(undefined);

const STORAGE_KEY = 'manpro_posters_data';

export function PosterProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [periods, setPeriods] = useState<RecommendationPeriod[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPosters(parsed.posters || []);
          setPeriods(parsed.periods || []);
          setRecommendations(parsed.recommendations || []);
          
          if (parsed.periods && parsed.periods.length > 0) {
            const active = parsed.periods.find((p: any) => p.status === 'Aktif') || parsed.periods[0];
            setActivePeriodId(active.id);
          }
        } else {
          // Seed initial data
          const initialPeriod: RecommendationPeriod = {
            id: 'p1',
            period_name: 'Agustus 2026',
            start_date: '2026-08-01',
            end_date: '2026-08-31',
            max_recommendations: 3,
            status: 'Aktif'
          };
          
          const initialPosters: Poster[] = products.slice(0, 5).map((p, i) => ({
            id: `poster-${i}`,
            poster_name: `Poster ${p.name}`,
            product_id: p.id,
            product_name: p.name,
            category: p.categoryId,
            image_url: p.thumbnail || p.images?.[0] || '',
            description: `Poster promosi untuk ${p.name}`,
            status: 'Aktif',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const initialRecommendations: Recommendation[] = initialPosters.slice(0, 3).map((p, i) => ({
            id: `rec-${i}`,
            period_id: 'p1',
            poster_id: p.id,
            ranking: i + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          setPeriods([initialPeriod]);
          setPosters(initialPosters);
          setRecommendations(initialRecommendations);
          setActivePeriodId(initialPeriod.id);
        }
      } catch (err) {
        console.error("Error loading poster data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (products.length > 0 && isLoading) {
      loadData();
    }
  }, [products, isLoading]);

  // Persist data when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        posters,
        periods,
        recommendations
      }));
    }
  }, [posters, periods, recommendations, isLoading]);

  const addPeriod = (period: Omit<RecommendationPeriod, 'id'>) => {
    const newPeriod = { ...period, id: Date.now().toString() };
    setPeriods(prev => [...prev, newPeriod]);
  };

  const updatePeriodLimit = (periodId: string, limit: number) => {
    setPeriods(prev => prev.map(p => p.id === periodId ? { ...p, max_recommendations: limit } : p));
    
    // Auto-remove recommendations that exceed the limit
    setRecommendations(prev => {
      const periodRecs = prev.filter(r => r.period_id === periodId).sort((a, b) => a.ranking - b.ranking);
      const exceedingRecs = periodRecs.slice(limit);
      const exceedingIds = exceedingRecs.map(r => r.id);
      return prev.filter(r => !exceedingIds.includes(r.id));
    });
  };

  const addPoster = (poster: Omit<Poster, 'id' | 'created_at' | 'updated_at'>) => {
    const newPoster: Poster = {
      ...poster,
      id: `poster-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPosters(prev => [newPoster, ...prev]);
  };

  const updatePoster = (poster: Poster) => {
    setPosters(prev => prev.map(p => p.id === poster.id ? { ...poster, updated_at: new Date().toISOString() } : p));
  };

  const deletePoster = (id: string) => {
    setPosters(prev => prev.filter(p => p.id !== id));
    setRecommendations(prev => prev.filter(r => r.poster_id !== id));
  };

  const addRecommendation = (posterId: string) => {
    if (!activePeriodId) return;
    
    const activePeriod = periods.find(p => p.id === activePeriodId);
    const periodRecs = recommendations.filter(r => r.period_id === activePeriodId);
    
    if (activePeriod && periodRecs.length >= activePeriod.max_recommendations) {
      throw new Error('Jumlah rekomendasi sudah mencapai batas maksimal.');
    }

    if (periodRecs.some(r => r.poster_id === posterId)) {
      throw new Error('Poster ini sudah ada dalam daftar rekomendasi.');
    }

    const maxRank = periodRecs.length > 0 ? Math.max(...periodRecs.map(r => r.ranking)) : 0;
    
    const newRec: Recommendation = {
      id: `rec-${Date.now()}`,
      period_id: activePeriodId,
      poster_id: posterId,
      ranking: maxRank + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setRecommendations(prev => [...prev, newRec]);
  };

  const removeRecommendation = (recommendationId: string) => {
    setRecommendations(prev => {
      const filtered = prev.filter(r => r.id !== recommendationId);
      // Re-rank remaining items in the same period
      const removedRec = prev.find(r => r.id === recommendationId);
      if (removedRec) {
        return filtered.map(r => {
          if (r.period_id === removedRec.period_id && r.ranking > removedRec.ranking) {
            return { ...r, ranking: r.ranking - 1 };
          }
          return r;
        });
      }
      return filtered;
    });
  };

  const updateRecommendationRankings = (reorderedRecommendations: Recommendation[]) => {
    setRecommendations(prev => {
      const otherRecs = prev.filter(r => r.period_id !== activePeriodId);
      return [...otherRecs, ...reorderedRecommendations];
    });
  };

  return (
    <PosterContext.Provider value={{
      posters,
      periods,
      recommendations,
      activePeriodId,
      setActivePeriodId,
      isLoading,
      addPeriod,
      updatePeriodLimit,
      addPoster,
      updatePoster,
      deletePoster,
      addRecommendation,
      removeRecommendation,
      updateRecommendationRankings
    }}>
      {children}
    </PosterContext.Provider>
  );
}

export function usePosters() {
  const context = useContext(PosterContext);
  if (!context) {
    throw new Error('usePosters must be used within a PosterProvider');
  }
  return context;
}
