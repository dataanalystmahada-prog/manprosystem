import React, { useState } from 'react';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { EmptyState } from '../components/common/EmptyState';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';

export function Products() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { products, isLoading, error } = useProducts();
  const { settings } = useSettings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [subProductFilter, setSubProductFilter] = useState<string>('');
  
  const topFilters = ['BEST SELLER', 'UNDER 50K', 'UNDER 100K', 'EXPRESS'];

  const filteredProducts = products.filter(p => {
    const upperTags = p.tags?.map(t => t.toUpperCase()) || [];
    
    // 1. Sidebar Route Filter
    if (type === 'new' && !upperTags.includes('NEW PRODUCT')) return false;
    if (type === 'rnd' && !upperTags.includes('R&D')) return false;
    if (type === 'discontinue' && !upperTags.includes('DISCONTINUE')) return false;
    
    // 2. Active Tab Filter
    if (activeFilter && !upperTags.includes(activeFilter.toUpperCase())) return false;

    // 3. Sub Product Filter
    if (subProductFilter && p.subProduk !== subProductFilter) return false;

    // 4. Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      if (!p.name?.toLowerCase().includes(lowerSearch)) {
        return false;
      }
    }

    return true;
  });

  const getPageTitle = () => {
    switch (type) {
      case 'new': return 'New Produk !!!';
      case 'rnd': return 'RND';
      case 'discontinue': return 'Discontinue';
      default: return 'ALL Produk';
    }
  };

  return (
    <div className="flex flex-col h-full pb-10">
      
      {/* Top Filter Tabs (Only for ALL Produk) */}
      {type === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {topFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
              className={`py-2 text-[13px] font-bold rounded-md uppercase tracking-wide border transition-all ${
                activeFilter === filter 
                  ? 'bg-[#4a5568] text-white border-[#4a5568] shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
        
        <div className="flex items-center gap-2.5">
          {type === 'all' && (
            <select
              value={subProductFilter}
              onChange={(e) => setSubProductFilter(e.target.value)}
              className="block w-40 pl-3 pr-8 py-1.5 bg-slate-100 border-none rounded-md text-[13px] focus:ring-2 focus:ring-slate-300 outline-none text-slate-900"
            >
              <option value="">Semua Sub Produk</option>
              {settings.subProducts.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={type === 'new' ? 'Search' : 'Search by name or code...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-48 md:w-60 pl-8 pr-8 py-1.5 bg-slate-100 border-none rounded-md text-[13px] focus:ring-2 focus:ring-slate-300 outline-none text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
              >
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/product/new')}
            className="bg-[#4a5568] text-white px-4 py-1.5 rounded-md text-[13px] font-bold hover:bg-[#3d4756] transition-colors inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Loading & Content */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-slate-500 font-medium">Loading products...</p>
        </div>
      ) : error && products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
             <X className="w-6 h-6 text-red-600" />
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">Connection Error</h3>
           <p className="text-slate-500 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/edit/${product.id}`)}
                  className="bg-[#f8f9fa] rounded-xl overflow-hidden cursor-pointer hover:shadow-sm transition-all flex flex-col group border border-slate-100"
                >
                  <div className="aspect-square p-1.5 relative">
                    {product.tags?.some(t => t.toUpperCase() === 'DISCONTINUE') && (
                      <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 shadow-sm">
                        DISCONTINUE
                      </div>
                    )}
                    <div className="w-full h-full bg-[#e9ecef] rounded-lg overflow-hidden flex items-center justify-center">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <div className="text-slate-400 text-[10px] font-medium">No Image</div>
                      )}
                    </div>
                  </div>
                  <div className="px-3 pb-3 pt-1.5 flex flex-col flex-1">
                    <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium line-clamp-1">Rp {(product.price || 0).toLocaleString('id-ID')} = 100 pc</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState 
                title="No products found" 
                description="Try adjusting your search or filters to find what you're looking for."
                action={
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter(null);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
