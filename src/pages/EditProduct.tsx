import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { useFaqs } from '../context/FaqContext';
import { Product } from '../types';
import { ArrowLeft, Save, Edit, Trash2, X, ImagePlus, Loader2, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

export function EditProduct({ isNew = false }: { isNew?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, updateProduct, deleteProduct, addProduct } = useProducts();
  const { settings } = useSettings();
  const { faqs } = useFaqs();
  
  const [product, setProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingImages, setPendingImages] = useState<Record<number, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const matchedFaqs = faqs.filter(f => {
    if (!product) return false;
    const matchProd = f.product === 'ALL Produk' || f.product === product.produk;
    const matchSubProd = f.subProduct === 'ALL Sub Produk' || f.subProduct === product.subProduk;
    return matchProd && matchSubProd;
  });

  useEffect(() => {
    if (isNew) {
      setProduct({
        name: '',
        price: 0,
        priceSample: 0,
        minimalOrder: 0,
        status: 'Draft',
        description: '',
        produk: '',
        subProduk: '',
        color: '',
        rincianPenawaran: '',
        specifications: '',
        material: '',
        size: '',
        weight: '',
        productionInfo: '',
        internalNotes: '',
        tags: [],
        images: []
      });
      setIsEditing(true);
    } else {
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct({ ...found, images: [...(found.images || [])] }); 
      }
    }
  }, [id, products, isNew]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
        <p className="text-slate-500 font-medium">Loading product...</p>
      </div>
    );
  }

  const handleTagToggle = (tag: string) => {
    if (!isEditing) return;
    setProduct(prev => {
      if (!prev) return prev;
      const tags = prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag];
      return { ...prev, tags };
    });
  };

  const validateForm = () => {
    if (!product.name?.trim()) return "Product Name wajib diisi.";
    if (product.price === undefined || product.price < 0) return "Harga tidak boleh negatif.";
    if (product.weight && !isNaN(Number(product.weight)) && Number(product.weight) < 0) return "Berat tidak boleh negatif.";
    
    return null;
  };

  const handleSave = async () => {
    setErrorMsg(null);
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setIsSaving(true);
      if (isNew) {
        await addProduct(product as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, pendingImages);
        navigate('/products/all');
      } else {
        await updateProduct(product as Product, pendingImages, removedImages);
        setIsEditing(false);
        setPendingImages({});
        setPreviewUrls({});
        setRemovedImages([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan data produk.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini? Semua data terkait (gambar, kategori) juga akan dihapus.")) {
      try {
        setIsSaving(true);
        await deleteProduct(product.id as string);
        navigate('/products/all');
      } catch (err) {
        alert("Produk gagal dihapus.");
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate(-1);
      return;
    }
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct({ ...found, images: [...(found.images || [])] }); 
    }
    setIsEditing(false);
    setPendingImages({});
    setPreviewUrls({});
    setRemovedImages([]);
    setErrorMsg(null);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImages(prev => ({ ...prev, [index]: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [index]: url }));
    }
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add to removed if it's an existing URL
    const existingUrl = product.images?.[index];
    if (existingUrl && !existingUrl.startsWith('blob:')) {
      setRemovedImages(prev => [...prev, existingUrl]);
    }

    // Clear from product state
    setProduct(prev => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      newImages[index] = '';
      return { ...prev, images: newImages };
    });

    // Clear pending/preview
    setPendingImages(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setPreviewUrls(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const Field = ({ label, value, field, type = 'text', prefix }: { label: string, value: any, field: keyof Product, type?: string, prefix?: string }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {isEditing ? (
        <div className="relative">
          {prefix && <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 text-[13px] font-medium">{prefix}</div>}
          <input
            type={type}
            value={value || ''}
            onChange={(e) => setProduct(prev => prev ? { ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value } : null)}
            className={`w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${prefix ? 'pl-8' : ''}`}
            disabled={isSaving}
          />
        </div>
      ) : (
        <div className="text-[13px] font-semibold text-slate-900 py-1 min-h-[32px] flex items-center">
          {value ? `${prefix ? prefix + ' ' : ''}${value}` : <span className="text-slate-400 font-normal italic">Not specified</span>}
        </div>
      )}
    </div>
  );

  const TextAreaField = ({ label, value, field }: { label: string, value: any, field: keyof Product }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {isEditing ? (
        <textarea
          value={value || ''}
          onChange={(e) => setProduct(prev => prev ? { ...prev, [field]: e.target.value } : null)}
          rows={3}
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-y"
          disabled={isSaving}
        />
      ) : (
        <div className="text-[13px] font-medium text-slate-700 py-1 whitespace-pre-wrap min-h-[32px]">
          {value || <span className="text-slate-400 font-normal italic">Not specified</span>}
        </div>
      )}
    </div>
  );

  const SelectField = ({ label, value, field, options }: { label: string, value: any, field: keyof Product, options: string[] }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {isEditing ? (
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => setProduct(prev => prev ? { ...prev, [field]: e.target.value } : null)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none pr-8"
            disabled={isSaving}
          >
            <option value="" disabled>Pilih {label}</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <div className="text-[13px] font-medium text-slate-700 py-1 min-h-[32px] flex items-center">
          {value || <span className="text-slate-400 font-normal italic">Not specified</span>}
        </div>
      )}
    </div>
  );

  const ImageSlot = ({ index, label }: { index: number, label: string }) => {
    const existingUrl = product?.images?.[index];
    const previewUrl = previewUrls[index];
    const displayUrl = previewUrl || (existingUrl && existingUrl !== '' ? existingUrl : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      if (isEditing && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => handleImageChange(index, e)}
          disabled={isSaving}
        />
        {displayUrl ? (
          <div 
            onClick={handleClick}
            className={`relative w-full h-full group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
          >
             <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
             {isEditing && (
               <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-wider mb-2">Change</span>
                  <button 
                    onClick={(e) => handleRemoveImage(index, e)}
                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded shadow hover:bg-red-700"
                  >
                    Remove
                  </button>
               </div>
             )}
          </div>
        ) : (
          <div 
            onClick={handleClick}
            className={`w-full h-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 ${isEditing ? 'hover:bg-slate-100 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors' : ''}`}
          >
             <ImagePlus className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">{label}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-colors bg-white shadow-sm disabled:opacity-50"
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{product.name || 'New Product'}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <>
              <button 
                onClick={handleDelete} 
                className="px-3 py-1.5 rounded-md shadow-sm text-[13px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 inline-flex items-center transition-colors uppercase tracking-wide disabled:opacity-50"
                disabled={isSaving}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </button>
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-3 py-1.5 rounded-md shadow-sm text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center transition-colors uppercase tracking-wide disabled:opacity-50"
                disabled={isSaving}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleCancel} 
                className="px-3 py-1.5 rounded-md shadow-sm text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center transition-colors uppercase tracking-wide disabled:opacity-50"
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-3 py-1.5 rounded-md shadow-sm text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center transition-colors uppercase tracking-wide disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 font-medium">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Images */}
        <div className="lg:col-span-1 space-y-4">
          {/* Gallery (Max 4 slots) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 aspect-square">
              <ImageSlot index={0} label="Main Photo (Photo 1)" />
            </div>
            <div className="col-span-1 aspect-square">
              <ImageSlot index={1} label="Photo 2" />
            </div>
            <div className="col-span-1 aspect-square">
              <ImageSlot index={2} label="Photo 3" />
            </div>
            <div className="col-span-1 aspect-square">
              <ImageSlot index={3} label="Photo 4" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Rincian Penawaran : manual edit</h2>
            <div>
              {isEditing ? (
                <textarea
                  value={product.rincianPenawaran || ''}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, rincianPenawaran: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors min-h-[250px] resize-y"
                  placeholder="Tumbler Stainles&#10;Kode : A312&#10;Logo : Laser&#10;Qty : 100&#10;&#10;Rp 12.000/pcs&#10;&#10;Noted :"
                  disabled={isSaving}
                />
              ) : (
                <div className="text-[13px] text-slate-700 py-1 whitespace-pre-wrap leading-relaxed min-h-[250px] bg-slate-50 p-3 rounded-md border border-slate-100">
                  {product.rincianPenawaran || <span className="text-slate-400 font-normal italic">Belum ada rincian penawaran</span>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> FAQ Produk
            </h2>
            <div className="space-y-2">
              {matchedFaqs.length > 0 ? (
                matchedFaqs.map((faq) => (
                  <div key={faq.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <span className="text-[13px] font-semibold text-blue-900 pr-4">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform flex-shrink-0 ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-4 py-3 text-[13px] text-slate-700 border-t border-slate-100 whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-slate-500 italic text-center py-4">Belum ada FAQ untuk produk ini.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between items-center">
              General Details
              {isEditing && <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">EDITING MODE</span>}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product Name" value={product.name} field="name" />
              <SelectField label="Produk" value={product.produk} field="produk" options={settings.products} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Warna" value={product.color} field="color" />
              <SelectField label="Sub Produk" value={product.subProduk} field="subProduk" options={settings.subProducts} />
            </div>

            <TextAreaField label="Keunggulan Produk" value={product.description} field="description" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <Field label="Price (100 pcs)" value={product.price} field="price" type="number" prefix="Rp" />
              <Field label="Minimal Order" value={product.minimalOrder} field="minimalOrder" type="number" />
              <Field label="Price Sample" value={product.priceSample} field="priceSample" type="number" prefix="Rp" />
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={product.status || 'Draft'}
                      onChange={(e) => setProduct(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none pr-8"
                      disabled={isSaving}
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-900 py-1 flex items-center min-h-[36px]">
                    <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' :
                      product.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <Field label="Specifications" value={product.specifications} field="specifications" />
              <Field label="Material" value={product.material} field="material" />
              <Field label="Size / Dimensions" value={product.size} field="size" />
              <Field label="Weight" value={product.weight} field="weight" />
            </div>
            
            <TextAreaField label="Production Info" value={product.productionInfo} field="productionInfo" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Internal & Management</h2>
            
            <TextAreaField label="Internal Notes" value={product.internalNotes} field="internalNotes" />
            
            {/* Categories / Tags Checklist */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Product Tags & Classification</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {categories.map(cat => {
                  const tag = cat.name;
                  const isChecked = product.tags?.includes(tag) || false;
                  return (
                    <label 
                      key={tag} 
                      className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                        !isEditing 
                          ? (isChecked ? 'border-slate-300 bg-slate-50' : 'border-slate-100 opacity-50 grayscale cursor-default')
                          : (isChecked ? 'border-blue-500 bg-blue-50/50 cursor-pointer' : 'border-slate-200 hover:bg-slate-50 cursor-pointer')
                      } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                        isChecked 
                          ? (!isEditing ? 'bg-slate-400 border-slate-400' : 'bg-blue-600 border-blue-600') 
                          : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleTagToggle(tag)}
                        disabled={!isEditing || isSaving}
                        className="sr-only"
                      />
                      <span className={`text-[12px] font-bold uppercase tracking-wide ${
                        isChecked 
                          ? (!isEditing ? 'text-slate-600' : 'text-blue-900') 
                          : 'text-slate-500'
                      }`}>
                        {tag}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
