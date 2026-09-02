import React, { useState } from 'react';
import { RndProduct, RndHistory, RndStep } from '../../types';
import { X, Search } from 'lucide-react';
import { useRnd } from '../../context/RndContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useSettings } from '../../context/SettingsContext';

interface RndFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: RndProduct;
}

export function RndFormModal({ isOpen, onClose, product }: RndFormModalProps) {
  const { addProduct, updateProduct, histories } = useRnd();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    pic: product?.pic || '',
    deadline: product?.deadline ? product.deadline.split('T')[0] : '',
    notes: product?.notes || '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        product_name: product?.product_name || '',
        pic: product?.pic || '',
        deadline: product?.deadline ? product.deadline.split('T')[0] : '',
        notes: product?.notes || '',
      });
      setActiveTab('detail');
    }
  }, [isOpen, product]);

  const [activeTab, setActiveTab] = useState<'detail' | 'history'>('detail');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      updateProduct(product.id, {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      });
    } else {
      addProduct({
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      });
    }
    onClose();
  };

  const productHistories = product 
    ? histories.filter(h => h.product_id === product.id).sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{product ? 'Detail Produk' : 'Tambah Produk RND'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {product && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
            <button 
              className={`flex-1 py-2.5 text-[13px] font-bold text-center border-b-2 transition-colors ${activeTab === 'detail' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('detail')}
            >
              Detail
            </button>
            <button 
              className={`flex-1 py-2.5 text-[13px] font-bold text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('history')}
            >
              Riwayat Progress
            </button>
          </div>
        )}

        <div className="overflow-y-auto p-5 flex-1">
          {(!product || activeTab === 'detail') && (
            <form id="rnd-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Nama Produk</label>
                {product ? (
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] font-semibold text-slate-700">
                    {product.product_name}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    required
                    value={formData.product_name}
                    onChange={e => setFormData({...formData, product_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Contoh: Payung Fullprint"
                  />
                )}
              </div>

              {product && (
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Step Saat Ini</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] font-semibold text-slate-700">
                    {product.current_step}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">PIC</label>
                  <select 
                    required
                    value={formData.pic}
                    onChange={e => setFormData({...formData, pic: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Pilih PIC...</option>
                    {settings.pics.map(pic => (
                      <option key={pic} value={pic}>{pic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {product && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                    <div className="text-[13px] text-slate-600 px-1 py-0.5">
                      {format(new Date(product.start_date), 'dd MMMM yyyy', { locale: id })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 mb-1">Last Update</label>
                    <div className="text-[13px] text-slate-600 px-1 py-0.5">
                      {format(new Date(product.last_update), 'dd MMMM yyyy', { locale: id })}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Catatan</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Tambahkan catatan jika ada..."
                />
              </div>
            </form>
          )}

          {product && activeTab === 'history' && (
            <div className="space-y-4">
              {productHistories.length > 0 ? (
                <div className="relative border-l border-slate-200 ml-3 space-y-5 py-2">
                  {productHistories.map(h => (
                    <div key={h.id} className="relative pl-5">
                      <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        {format(new Date(h.changed_at), 'dd MMMM yyyy', { locale: id })} • {h.changed_by}
                      </div>
                      <div className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-slate-500 font-medium">{h.from_step}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-emerald-700">{h.to_step}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[13px] text-slate-500 border border-dashed border-slate-200 rounded-lg">
                  Belum ada riwayat perpindahan
                </div>
              )}
            </div>
          )}
        </div>

        {(!product || activeTab === 'detail') && (
          <div className="flex justify-end gap-2 p-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {product ? 'Tutup' : 'Batal'}
            </button>
            <button 
              type="submit"
              form="rnd-form"
              className="px-4 py-1.5 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm shadow-emerald-600/20"
            >
              Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
