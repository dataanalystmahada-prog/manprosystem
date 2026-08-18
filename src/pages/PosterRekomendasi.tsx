import React, { useState, useMemo } from 'react';
import { usePosters } from '../context/PosterContext';
import { 
  Bell, ChevronDown, ChevronLeft, ChevronRight, Filter, Image as ImageIcon, 
  Layers, LayoutGrid, List, Megaphone, MoreVertical, Plus, Search, Tag, 
  Trash2, AlertCircle, Edit, GripVertical, CheckCircle, Info, X
} from 'lucide-react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { Poster, Recommendation } from '../types';
import { PosterFormModal, DeleteConfirmationModal } from '../components/poster-rekomendasi/PosterModals';

interface SortableRecommendationCardProps {
  recommendation: Recommendation;
  poster: Poster;
  activePeriodId: string;
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}

const SortableRecommendationCard: React.FC<SortableRecommendationCardProps> = ({ 
  recommendation, poster, activePeriodId, onRemove, onPreview
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: recommendation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: 'relative' as any } : {}),
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { icon: '🥇', label: 'Prioritas Utama', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 2: return { icon: '🥈', label: 'Prioritas Kedua', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 3: return { icon: '🥉', label: 'Prioritas Ketiga', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 4: return { icon: '🏅', label: 'Prioritas Keempat', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { icon: '🏅', label: `Prioritas #${rank}`, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const badge = getRankBadge(recommendation.ranking);

  return (
    <div 
      ref={setNodeRef} style={style}
      className={cn(
        "flex bg-white border border-slate-200 rounded-xl overflow-hidden relative group shadow-sm transition-all",
        isDragging ? "opacity-50 ring-2 ring-emerald-500 scale-[1.02]" : "hover:border-slate-300"
      )}
    >
      <div 
        {...attributes} {...listeners}
        className="w-12 bg-slate-50 flex flex-col items-center justify-center py-2 cursor-grab active:cursor-grabbing border-r border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <GripVertical className="w-4 h-4 text-slate-400 mb-2" />
        <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-[11px] shadow-sm">
          {badge.icon}
        </div>
      </div>
      
      <div 
        className="w-20 h-28 bg-slate-100 relative flex-shrink-0 flex items-center justify-center p-2 border-r border-slate-200 cursor-pointer group/img"
        onClick={() => onPreview(poster.image_url)}
      >
        <img src={poster.image_url} alt={poster.poster_name} className="w-full h-full object-contain drop-shadow-sm transition-transform group-hover/img:scale-105" />
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <Search className="w-4 h-4 text-slate-700 drop-shadow-sm bg-white/80 p-0.5 rounded-full" />
        </div>
      </div>

      <div className="p-2.5 flex flex-col justify-between flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-900 text-[12px] leading-tight mb-1">{poster.poster_name}</h3>
            <div className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border", badge.color)}>
              {badge.label}
            </div>
          </div>
          <button 
            onClick={() => onRemove(recommendation.id)}
            className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            title="Hapus dari Rekomendasi"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div>
          <div className="text-[10px] text-slate-500 mb-0.5">Kategori</div>
          <div className="text-[11px] font-medium text-slate-700">{poster.category || 'Belum dikategorikan'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Diupdate: {new Date(poster.updated_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
        </div>
      </div>
    </div>
  );
}

export function PosterRekomendasi() {
  const { 
    posters, periods, recommendations, activePeriodId, setActivePeriodId,
    addRecommendation, removeRecommendation, updateRecommendationRankings,
    updatePeriodLimit, addPoster, deletePoster
  } = usePosters();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [posterToDelete, setPosterToDelete] = useState<Poster | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const activePeriod = periods.find(p => p.id === activePeriodId);
  const activeRecs = recommendations.filter(r => r.period_id === activePeriodId).sort((a,b) => a.ranking - b.ranking);
  const activePosterIds = activeRecs.map(r => r.poster_id);

  const totalPosters = posters.length;
  const uniqueCategories = new Set(posters.map(p => p.category).filter(Boolean)).size;

  const filteredPosters = useMemo(() => {
    return posters.filter(p => {
      const matchSearch = p.poster_name.toLowerCase().includes(search.toLowerCase()) || 
                          p.product_name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'Semua Kategori' || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [posters, search, filterCategory]);

  const paginatedPosters = filteredPosters.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredPosters.length / itemsPerPage);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id !== over.id) {
      const oldIndex = activeRecs.findIndex(r => r.id === active.id);
      const newIndex = activeRecs.findIndex(r => r.id === over.id);
      
      const moved = arrayMove(activeRecs, oldIndex, newIndex) as Recommendation[];
      const newRecs = moved.map((r, i) => ({
        ...r, ranking: i + 1
      }));
      
      updateRecommendationRankings(newRecs);
    }
  };

  const handleAddRec = (posterId: string) => {
    try {
      addRecommendation(posterId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50 text-slate-800 p-4 md:p-5 font-sans -mx-8 -my-6 px-6 py-5">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
            <Megaphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 mb-0.5 tracking-tight">Poster Rekomendasi</h1>
            <p className="text-[12px] text-slate-500">Kelola dan atur poster yang direkomendasikan untuk periode tertentu.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 shadow-sm text-slate-800 pl-3 pr-8 py-1.5 rounded-md text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-w-[150px]"
                value={activePeriodId || ''}
                onChange={(e) => setActivePeriodId(e.target.value)}
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.period_name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
              Aktif
            </div>
          </div>

          <div className="h-6 border-l border-slate-200"></div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Slot:</span>
            <div className="flex bg-slate-50 border border-slate-200 shadow-sm rounded-md overflow-hidden p-0.5">
              {[2, 3, 4].map(num => (
                <button 
                  key={num}
                  onClick={() => activePeriod && updatePeriodLimit(activePeriod.id, num)}
                  className={cn(
                    "px-2.5 py-1 text-[12px] rounded font-medium transition-all",
                    activePeriod?.max_recommendations === num 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors shadow-sm shadow-emerald-600/20 ml-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Poster
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center border border-emerald-100 z-10">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="z-10">
            <div className="text-xl font-bold text-slate-900 leading-none mb-0.5">{activeRecs.length}</div>
            <div className="text-[11px] font-semibold text-slate-700">Poster Aktif</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Direkomendasikan</div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center border border-blue-100 z-10">
            <Layers className="w-4 h-4" />
          </div>
          <div className="z-10">
            <div className="text-xl font-bold text-slate-900 leading-none mb-0.5">{totalPosters}</div>
            <div className="text-[11px] font-semibold text-slate-700">Total Poster</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Dalam Library</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center border border-purple-100 z-10">
            <Tag className="w-4 h-4" />
          </div>
          <div className="z-10">
            <div className="text-xl font-bold text-slate-900 leading-none mb-0.5">{uniqueCategories}</div>
            <div className="text-[11px] font-semibold text-slate-700">Kategori</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Tersedia</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Rekomendasi Bulan Ini</h2>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-[11px] text-slate-500 mb-4">Drag & drop untuk mengubah urutan prioritas poster rekomendasi.</p>

        {activeRecs.length > 0 ? (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1">
              <SortableContext 
                items={activeRecs.map(r => r.id)} 
                strategy={rectSortingStrategy}
              >
                {activeRecs.map(rec => {
                  const poster = posters.find(p => p.id === rec.poster_id);
                  if (!poster) return null;
                  return (
                    <SortableRecommendationCard 
                      key={rec.id} 
                      recommendation={rec} 
                      poster={poster} 
                      activePeriodId={activePeriodId!} 
                      onRemove={removeRecommendation}
                      onPreview={setPreviewImage}
                    />
                  );
                })}
              </SortableContext>
            </div>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">Belum ada poster rekomendasi</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">Tambahkan poster dari library di bawah untuk mulai membuat rekomendasi bulan ini.</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center py-2.5 border border-dashed border-slate-200 rounded-lg text-slate-500 text-[11px] bg-slate-50/50">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tarik poster dari bawah untuk ditambahkan ke rekomendasi (maksimal {activePeriod?.max_recommendations || 3} poster)
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">Semua Poster</h2>
            <p className="text-[11px] text-slate-500">Kumpulan seluruh poster yang tersedia dalam library.</p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari nama poster..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-slate-200 shadow-sm text-slate-800 pl-8 pr-3 py-1.5 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 w-52"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                 <select 
                  className="appearance-none bg-white shadow-sm border border-slate-200 text-slate-700 pl-3 pr-8 py-1.5 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option>Semua Kategori</option>
                  <option>Elektronik</option>
                  <option>Apparel</option>
                  <option>Merchandise</option>
                  <option>Agenda</option>
                  <option>Tumbler</option>
                  <option>Payung</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg p-1 ml-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-slate-100 text-emerald-600" : "text-slate-400 hover:text-slate-600")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-slate-100 text-emerald-600" : "text-slate-400 hover:text-slate-600")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={cn(
          viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-3"
        )}>
          {paginatedPosters.length > 0 ? (
            paginatedPosters.map(poster => {
              const isRecommended = activePosterIds.includes(poster.id);
              const recInfo = activeRecs.find(r => r.poster_id === poster.id);

              return (
                <div key={poster.id} className={cn(
                  "bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden group hover:border-slate-300 transition-colors flex",
                  viewMode === 'grid' ? "flex-col" : "flex-row items-center p-3 gap-4"
                )}>
                  <div className={cn(
                    "relative bg-slate-100 flex-shrink-0 flex items-center justify-center p-2",
                    viewMode === 'grid' ? "w-full aspect-[3/4] border-b border-slate-200" : "w-12 h-16 rounded-lg overflow-hidden border-none"
                  )}>
                    <img src={poster.image_url} alt={poster.poster_name} className="w-full h-full object-contain drop-shadow-sm" />
                    {viewMode === 'grid' && (
                      <button 
                        onClick={() => setPosterToDelete(poster)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Hapus Poster"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className={cn("p-4 flex-1 flex flex-col justify-between", viewMode === 'grid' ? "h-full" : "py-1 px-2")}>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 truncate">{poster.poster_name}</h3>
                      <p className="text-xs text-slate-500 mb-2 truncate">{poster.category}</p>
                      
                      {viewMode === 'grid' && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-200 mb-4">
                          {poster.status}
                        </div>
                      )}
                    </div>

                    <div className={cn(viewMode === 'list' && "hidden")}>
                      {isRecommended ? (
                        <div className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Rekomendasi #{recInfo?.ranking}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAddRec(poster.id)}
                          className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                        >
                          Jadikan Rekomendasi
                        </button>
                      )}
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-4 pr-2">
                       <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-200 w-20 justify-center">
                          {poster.status}
                        </div>
                        <div className="w-40 flex justify-end">
                          {isRecommended ? (
                            <div className="py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Rekomendasi #{recInfo?.ranking}
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleAddRec(poster.id)}
                              className="py-1.5 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            >
                              Jadikan Rekomendasi
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => setPosterToDelete(poster)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Hapus Poster"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p>Poster tidak ditemukan.</p>
            </div>
          )}
        </div>

        {filteredPosters.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-xs text-slate-500">
            <div>
              Menampilkan {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, filteredPosters.length)} dari {filteredPosters.length} poster
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors border shadow-sm",
                      page === i + 1 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <select 
                  className="appearance-none bg-white shadow-sm border border-slate-200 text-slate-700 pl-3 pr-8 py-1.5 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={12}>12 / halaman</option>
                  <option value={24}>24 / halaman</option>
                  <option value={48}>48 / halaman</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      <PosterFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={(data) => {
          addPoster(data as any);
          setIsAddModalOpen(false);
        }} 
      />

      <DeleteConfirmationModal 
        isOpen={!!posterToDelete} 
        onClose={() => setPosterToDelete(null)}
        posterName={posterToDelete?.poster_name || ''}
        isRecommended={recommendations.some(r => r.poster_id === posterToDelete?.id)}
        onConfirm={() => {
          if (posterToDelete) deletePoster(posterToDelete.id);
          setPosterToDelete(null);
        }}
      />

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8" onClick={() => setPreviewImage(null)}>
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
