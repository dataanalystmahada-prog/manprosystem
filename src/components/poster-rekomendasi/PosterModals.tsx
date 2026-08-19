import React, { useState } from 'react';
import { X, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Poster } from '../../types';
import { cn } from '../../lib/utils';
import { useProducts } from '../../context/ProductContext';

export function PosterFormModal({ 
  isOpen, onClose, poster, onSave 
}: { 
  isOpen: boolean, onClose: () => void, poster?: Poster, 
  onSave: (data: Partial<Poster>) => void 
}) {
  const [formData, setFormData] = useState<Partial<Poster>>(poster || {
    poster_name: '',
    category: 'Elektronik', // Default category
    description: '',
    status: 'Aktif',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.poster_name) {
      alert("Nama poster wajib diisi");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{poster ? 'Edit Poster' : 'Tambah Poster Baru'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Upload Poster (Portrait)</label>
            <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors bg-slate-50 relative group">
              <div className="space-y-1 text-center">
                {formData.image_url && formData.image_url.startsWith('data:image') ? (
                  <div className="flex justify-center mb-3">
                    <img src={formData.image_url} alt="Preview" className="h-32 w-auto object-contain border border-slate-200 rounded-md bg-white p-1" />
                  </div>
                ) : formData.image_url ? (
                  <div className="flex justify-center mb-3">
                    <img src={formData.image_url} alt="Preview" className="h-32 w-auto object-contain border border-slate-200 rounded-md bg-white p-1" />
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-10 w-10 text-slate-400" />
                )}
                <div className="flex text-[13px] text-slate-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, image_url: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-slate-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Nama Poster</label>
            <input 
              type="text" 
              required
              value={formData.poster_name} 
              onChange={e => setFormData({...formData, poster_name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Contoh: Flashdisk 25 Tahun"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Kategori</label>
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
            >
              <option value="Elektronik">Elektronik</option>
              <option value="Apparel">Apparel</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Agenda">Agenda</option>
              <option value="Tumbler">Tumbler</option>
              <option value="Payung">Payung</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as any})}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
            >
              <option value="Aktif">Aktif</option>
              <option value="Draft">Draft</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Masukkan deskripsi poster..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm shadow-emerald-600/20"
            >
              Simpan Poster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmationModal({
  isOpen, onClose, onConfirm, posterName, isRecommended
}: {
  isOpen: boolean, onClose: () => void, onConfirm: () => void, posterName: string, isRecommended: boolean
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1.5">Hapus Poster?</h2>
          <p className="text-[13px] text-slate-500 mb-5">
            Anda yakin ingin menghapus poster <strong className="text-slate-900">{posterName}</strong> dari library?
          </p>
          
          {isRecommended && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-700 text-[12px] font-medium mb-5 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <p>Poster ini sedang digunakan. Menghapus akan melepaskannya dari daftar rekomendasi.</p>
            </div>
          )}

          <div className="flex w-full gap-2.5">
            <button 
              onClick={onClose}
              className="flex-1 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-1.5 text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm shadow-red-600/20"
            >
              {isRecommended ? 'Hapus & Lepaskan' : 'Hapus Poster'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
