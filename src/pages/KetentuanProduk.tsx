import React, { useState } from 'react';
import { Plus, Trash2, FileText, Image as ImageIcon, Pencil } from 'lucide-react';
import { useKetentuan } from '../context/KetentuanContext';
import { useSettings } from '../context/SettingsContext';
import type { KetentuanPoster } from '../types';
import { UploadPosterModal, ViewPosterModal } from '../components/ketentuan/KetentuanModals';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function KetentuanProduk() {
  const { posters, isLoading, deletePoster } = useKetentuan();
  const { settings } = useSettings();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<KetentuanPoster | null>(null);
  const [editingPoster, setEditingPoster] = useState<KetentuanPoster | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const filteredPosters = selectedFilter 
    ? posters.filter(p => p.product_name === selectedFilter)
    : posters;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus poster ini?')) {
      await deletePoster(id);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Ketentuan Produk
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola dan lihat poster ketentuan untuk produk-produk.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-none shadow-sm"
          >
            <option value="">Semua Sub Produk</option>
            {settings.subProducts.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <button
            onClick={() => { setEditingPoster(null); setIsUploadOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Upload Poster
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <ImageIcon className="w-16 h-16 mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">Belum ada poster</h3>
          <p className="text-sm text-center">
            {selectedFilter ? `Tidak ada poster untuk ${selectedFilter}.` : 'Mulai dengan mengupload poster ketentuan produk baru.'}
          </p>
          <button
            onClick={() => { setEditingPoster(null); setIsUploadOpen(true); }}
            className="mt-6 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 shadow-sm"
          >
            Upload Poster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              onClick={() => setSelectedPoster(poster)}
              className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                <img
                  src={poster.image_url}
                  alt={poster.poster_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingPoster(poster); setIsUploadOpen(true); }}
                    className="p-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, poster.id)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {poster.poster_name}
                  </h3>
                  {poster.product_name && (
                    <p className="text-xs text-emerald-400/90 font-medium mt-0.5 line-clamp-1">
                      {poster.product_name}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {format(new Date(poster.created_at), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadPosterModal
        isOpen={isUploadOpen}
        onClose={() => { setIsUploadOpen(false); setEditingPoster(null); }}
        initialData={editingPoster}
      />

      <ViewPosterModal
        isOpen={!!selectedPoster}
        onClose={() => setSelectedPoster(null)}
        poster={selectedPoster}
      />
    </div>
  );
}
