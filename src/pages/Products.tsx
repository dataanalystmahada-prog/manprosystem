import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { EmptyState } from '../components/common/EmptyState';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';

const ITEMS_PER_PAGE = 30; // 5 baris x 6 kolom pada tampilan desktop

export function Products() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { products, isLoading, error } = useProducts();
  const { settings } = useSettings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [subProductFilter, setSubProductFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const topFilters = ['BEST SELLER', 'UNDER 50K', 'UNDER 100K', 'EXPRESS'];

  // Reset ke halaman 1 setiap kali filter atau route berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [type, activeFilter, subProductFilter, searchTerm]);

  const filteredProducts = products.filter(p => {
    const upperTags = p.tags?.map(t => t.toUpperCase()) || [];
    
    // 1. Sidebar Route Filter
    if (type === 'new' && !upperTags.includes('NEW PRODUCT')) return false;
    if (type === 'rnd' && !upperTags.includes('R&D')) return false;
    if (type === 'discontinue' && !upperTags.includes('DISCONTINUE')) return false;
    
    if (type === 'all') {
      // 2. Active Tab Filter
      if (activeFilter && !upperTags.includes(activeFilter.toUpperCase())) return false;

      // 3. Sub Product Filter
      if (subProductFilter && p.subProduk !== subProductFilter) return false;
    }

    // 4. Search Term (Nama, Produk, Sub Produk)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(lowerSearch);
      const matchProduk = p.produk?.toLowerCase().includes(lowerSearch);
      const matchSubProduk = p.subProduk?.toLowerCase().includes(lowerSearch);
      
      if (!matchName && !matchProduk && !matchSubProduk) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const validCurrentPage = totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === validCurrentPage) return;
    setCurrentPage(page);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

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
              placeholder={type === 'new' ? 'Search by name, product...' : 'Search by name, product, sub product...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-48 md:w-64 pl-8 pr-8 py-1.5 bg-slate-100 border-none rounded-md text-[13px] focus:ring-2 focus:ring-slate-300 outline-none text-slate-900 placeholder:text-slate-400"
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {paginatedProducts.map((product) => (
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
                          <img 
                            src={product.thumbnail} 
                            alt={product.name} 
                            loading="lazy"
                            className="w-full h-full object-cover mix-blend-multiply" 
                          />
                        ) : (
                          <div className="text-slate-400 text-[10px] font-medium">No Image</div>
                        )}
                      </div>
                    </div>
                    <div className="px-3 pb-3 pt-1.5 flex flex-col flex-1">
                      <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">{product.subProduk || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <p className="text-[13px] text-slate-500 font-medium order-2 sm:order-1">
                    Menampilkan <span className="font-semibold text-slate-700">{startIndex + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> dari <span className="font-semibold text-slate-700">{filteredProducts.length}</span> produk
                  </p>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(validCurrentPage - 1)}
                      disabled={validCurrentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border flex items-center transition-all ${
                        validCurrentPage === 1
                          ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 mr-0.5" />
                      Prev
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                              ...
                            </span>
                          );
                        }
                        const pageNum = p as number;
                        const isActive = pageNum === validCurrentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all ${
                              isActive
                                ? 'bg-[#4a5568] text-white shadow-sm'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(validCurrentPage + 1)}
                      disabled={validCurrentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border flex items-center transition-all ${
                        validCurrentPage === totalPages
                          ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
