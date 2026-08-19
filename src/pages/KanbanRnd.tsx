import React, { useState, useMemo } from 'react';
import { useRnd, RND_STEPS } from '../context/RndContext';
import { RndProduct, RndStep } from '../types';
import { RndFormModal } from '../components/rnd/RndModals';
import { 
  DndContext, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, arrayMove, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, Filter, MoreVertical, AlertTriangle, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface SortableProductCardProps {
  product: RndProduct;
  onClick: (product: RndProduct) => void;
  onComplete?: (product: RndProduct) => void;
}

const ProductCard = React.forwardRef<HTMLDivElement, SortableProductCardProps & { style?: React.CSSProperties, isDragging?: boolean, listeners?: any, attributes?: any }>(
  ({ product, onClick, onComplete, style, isDragging, listeners, attributes }, ref) => {
    
    // Deadline status logic
    const today = startOfDay(new Date());
    const deadlineDate = startOfDay(new Date(product.deadline));
    const warningDate = addDays(today, 3); // Warning if deadline is within 3 days

    let statusType: 'normal' | 'warning' | 'overdue' = 'normal';
    if (isBefore(deadlineDate, today)) {
      statusType = 'overdue';
    } else if (isBefore(deadlineDate, warningDate) || deadlineDate.getTime() === today.getTime() || deadlineDate.getTime() === warningDate.getTime()) {
      statusType = 'warning';
    }

    return (
      <div
        ref={ref}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onClick(product)}
        className={cn(
          "bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors group relative",
          isDragging ? "opacity-50 ring-2 ring-emerald-500 scale-[1.02]" : ""
        )}
      >
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-bold text-[13px] text-slate-900 leading-tight pr-5">{product.product_name}</h4>
          <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.current_step === 'Launching' && onComplete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onComplete(product); }}
                className="text-emerald-500 hover:text-emerald-600 p-1 rounded-md hover:bg-emerald-50 bg-white border border-slate-200 shadow-sm transition-colors"
                title="Selesaikan"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 bg-white border border-slate-200 shadow-sm transition-colors" onClick={(e) => { e.stopPropagation(); onClick(product); }}>
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className="text-[11px] text-slate-500 mb-1.5">
          PIC: <span className="font-medium text-slate-700">{product.pic}</span>
        </div>

        <div className="space-y-1 mb-2">
          <div className="text-[10px] text-slate-500 leading-tight">
            <div className="text-slate-400">Last Update:</div>
            <div className="font-medium text-slate-700">{format(new Date(product.last_update), 'dd MMMM yyyy', { locale: id })}</div>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            <div className="text-slate-400">Deadline:</div>
            <div className="font-medium text-slate-700">{format(new Date(product.deadline), 'dd MMMM yyyy', { locale: id })}</div>
          </div>
        </div>

        <div>
          {statusType === 'normal' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Normal
            </span>
          )}
          {statusType === 'warning' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-2.5 h-2.5" />
              Warning
            </span>
          )}
          {statusType === 'overdue' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="w-2.5 h-2.5" />
              Overdue
            </span>
          )}
        </div>
      </div>
    );
  }
);

const SortableProductCard = ({ product, onClick, onComplete }: SortableProductCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: product.id,
    data: {
      type: 'Product',
      product,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ProductCard 
      ref={setNodeRef} 
      style={style} 
      product={product} 
      onClick={onClick} 
      onComplete={onComplete}
      isDragging={isDragging}
      attributes={attributes}
      listeners={listeners}
    />
  );
};

export function KanbanRnd() {
  const { products, moveProduct, completeProduct } = useRnd();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPic, setSelectedPic] = useState('Semua PIC');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RndProduct | undefined>(undefined);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract unique PICs
  const pics = useMemo(() => {
    const allPics = products.map(p => p.pic).filter(Boolean);
    return ['Semua PIC', ...Array.from(new Set(allPics))];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.is_completed) return false;
      const matchSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.pic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPic = selectedPic === 'Semua PIC' || p.pic === selectedPic;
      return matchSearch && matchPic;
    });
  }, [products, searchTerm, selectedPic]);

  // Group products by step
  const productsByStep = useMemo(() => {
    const grouped: Record<string, RndProduct[]> = {};
    RND_STEPS.forEach(step => {
      grouped[step] = [];
    });
    filteredProducts.forEach(p => {
      if (grouped[p.current_step]) {
        grouped[p.current_step].push(p);
      }
    });
    // Sort by deadline within each column (closest deadline first)
    Object.keys(grouped).forEach(step => {
      grouped[step].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    });
    return grouped;
  }, [filteredProducts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Product";
    const isOverTask = over.data.current?.type === "Product";
    const isOverColumn = over.data.current?.type === "Column";

    // Scenario 1: Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      // Just visually ordering, actual movement is handled in DragEnd if needed,
      // but standard Kanban usually just moves to the column. 
      // For simplicity, we won't reorder within the column if it's auto-sorted by deadline.
      // But we can let them change columns.
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !activeData.product) return;

    const product = activeData.product as RndProduct;
    let targetStep = product.current_step;

    if (overData?.type === 'Column') {
      targetStep = overData.step as RndStep;
    } else if (overData?.type === 'Product') {
      targetStep = overData.product.current_step as RndStep;
    }

    if (product.current_step !== targetStep) {
      // Mocking the user as "Admin" for now, ideally it comes from auth context
      moveProduct(product.id, targetStep, "Admin");
    }
  };

  const getStepNumberBadge = (step: RndStep, index: number) => {
    return (
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0",
        step === 'Launching' ? 'bg-emerald-500' : 'bg-emerald-600'
      )}>
        {index + 1}
      </div>
    );
  };

  const activeProduct = useMemo(() => {
    if (!activeId) return null;
    return products.find(p => p.id === activeId);
  }, [activeId, products]);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } })
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-slate-50 font-sans -mx-8 -my-6 px-6 py-5 overflow-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col gap-4 mb-5 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-0.5 tracking-tight">Kanban RND</h1>
            <p className="text-[13px] text-slate-500">Monitor perkembangan produk dari vendor hingga launching.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedProduct(undefined);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 shadow-sm rounded-md text-[13px] focus:ring-2 focus:ring-emerald-500/50 outline-none w-56 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedPic}
              onChange={(e) => setSelectedPic(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 shadow-sm rounded-md text-[13px] focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none font-medium text-slate-700 transition-all"
            >
              {pics.map(pic => (
                <option key={pic} value={pic}>{pic}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max pb-2">
            {RND_STEPS.map((step, index) => {
              const columnProducts = productsByStep[step] || [];
              return (
                <KanbanColumn 
                  key={step} 
                  step={step} 
                  index={index}
                  products={columnProducts}
                  getStepNumberBadge={getStepNumberBadge}
                  onProductClick={(p) => {
                    setSelectedProduct(p);
                    setIsAddModalOpen(true);
                  }}
                  onProductComplete={(p) => {
                    completeProduct(p.id);
                  }}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeProduct ? (
              <ProductCard 
                product={activeProduct} 
                onClick={() => {}} 
                style={{ width: '260px' }} 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Bottom Legend */}
      <div className="flex gap-6 pt-3 border-t border-slate-200 mt-2 flex-shrink-0 bg-slate-50">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal <span className="text-slate-400 ml-1">Deadline aman</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning <span className="text-slate-400 ml-1">Deadline semakin dekat</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue <span className="text-slate-400 ml-1">Deadline sudah lewat</span>
        </div>
      </div>

      <RndFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}

interface KanbanColumnProps {
  step: RndStep;
  index: number;
  products: RndProduct[];
  getStepNumberBadge: (step: RndStep, index: number) => React.ReactNode;
  onProductClick: (product: RndProduct) => void;
  onProductComplete?: (product: RndProduct) => void;
}

function KanbanColumn({ step, index, products, getStepNumberBadge, onProductClick, onProductComplete }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({
    id: `column-${step}`,
    data: {
      type: 'Column',
      step
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col w-[260px] max-w-[260px] flex-shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full"
    >
      <div className="flex items-center justify-between p-2.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1.5">
          {getStepNumberBadge(step, index)}
          <h3 className="font-bold text-[12px] text-slate-800 uppercase tracking-tight">{step}</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded">
          ({products.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 bg-slate-50/30">
        <div className="flex flex-col gap-1.5 min-h-full">
          {products.length > 0 ? (
            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {products.map(product => (
                <SortableProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={onProductClick} 
                  onComplete={onProductComplete}
                />
              ))}
            </SortableContext>
          ) : (
            step === 'Launching' && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 pt-10 opacity-50">
                <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-3">
                  <span className="text-xl">🚀</span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Belum ada produk</p>
                <p className="text-[10px] text-slate-500">Produk yang sudah siap launching akan muncul di sini.</p>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
