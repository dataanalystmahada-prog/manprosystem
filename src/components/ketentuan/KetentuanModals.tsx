import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useKetentuan } from '../../context/KetentuanContext';
import { useProductContext } from '../../context/ProductContext';
import { KetentuanPoster } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadPosterModal({ isOpen, onClose }: ModalProps) {
  const { addPoster } = useKetentuan();
  const { products } = useProductContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    poster_name: '',
    product_name: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.poster_name) return;

    try {
      setIsSubmitting(true);
      await addPoster(formData, file);
      onClose();
    } catch (error) {
      console.error('Failed to upload poster:', error);
      alert('Gagal mengupload poster');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique product names from products master data
  const uniqueProductNames = Array.from(new Set(products.map(p => p.name))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl border border-slate-700/50 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Upload Poster Ketentuan</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Poster *</label>
              <input
                type="text"
                required
                value={formData.poster_name}
                onChange={e => setFormData({ ...formData, poster_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Contoh: Ketentuan Garansi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Produk</label>
              <select
                value={formData.product_name}
                onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="">Semua Produk / Tidak Spesifik</option>
                {uniqueProductNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi (Opsional)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none h-20"
                placeholder="Tambahkan deskripsi singkat..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">File Poster (Potrait) *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors relative">
                <div className="space-y-2 text-center">
                  {preview ? (
                    <div className="relative inline-block">
                      <img src={preview} alt="Preview" className="max-h-48 rounded shadow-sm mx-auto" />
                      <button 
                        type="button"
                        onClick={() => { setFile(null); setPreview(''); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-500" />
                      <div className="flex text-sm text-slate-400 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-500 hover:text-emerald-400 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} required />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB (Potrait)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={isSubmitting || !file || !formData.poster_name}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Poster
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ViewPosterModalProps extends ModalProps {
  poster: KetentuanPoster | null;
}

export function ViewPosterModal({ isOpen, onClose, poster }: ViewPosterModalProps) {
  if (!isOpen || !poster) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative max-w-lg w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-full flex justify-center bg-black">
          <img 
            src={poster.image_url} 
            alt={poster.poster_name} 
            className="max-h-[70vh] object-contain"
          />
        </div>
        
        <div className="p-5 border-t border-slate-800">
          <h3 className="text-xl font-bold text-white mb-1">{poster.poster_name}</h3>
          {poster.product_name && (
            <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded mb-3">
              {poster.product_name}
            </span>
          )}
          {poster.description && (
            <p className="text-sm text-slate-300 mt-2">{poster.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
