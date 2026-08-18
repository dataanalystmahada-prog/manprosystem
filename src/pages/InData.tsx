import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function InData() {
  const { products, deleteProduct, categories, updateProductTags } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleToggleCategory = (productId: string, currentTags: string[], categoryName: string) => {
    const isSelected = currentTags.some(t => t.toLowerCase() === categoryName.toLowerCase());
    let newTags = [...currentTags];
    if (isSelected) {
      newTags = newTags.filter(t => t.toLowerCase() !== categoryName.toLowerCase());
    } else {
      newTags.push(categoryName);
    }
    updateProductTags(productId, newTags);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">In-Data & Choice Product</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage products and assign categories.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] focus:ring-2 focus:ring-slate-300 outline-none w-48 lg:w-56 shadow-sm"
            />
          </div>
          <button 
            onClick={() => navigate('/product/new')}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-[13px] min-w-max">
          <thead className="bg-white text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-3 py-2 border-b border-slate-200 sticky top-0 left-0 bg-white z-20 shadow-[1px_0_0_0_#e2e8f0]">Product Name</th>
              <th className="px-3 py-2 border-b border-slate-200 sticky top-0 bg-white z-10">Price (100 pcs)</th>
              <th className="px-3 py-2 border-b border-slate-200 sticky top-0 bg-white z-10">Min. Order</th>
              <th className="px-3 py-2 border-b border-slate-200 sticky top-0 bg-white z-10">Status</th>
              
              {/* Category Columns */}
              {categories.map(cat => (
                <th key={cat.id} className="px-2 py-2 border-b border-slate-200 sticky top-0 bg-slate-50 z-10 text-center whitespace-nowrap border-l border-slate-100">
                  {cat.name}
                </th>
              ))}

              <th className="px-3 py-2 border-b border-slate-200 sticky top-0 right-0 bg-white z-20 text-right shadow-[-1px_0_0_0_#e2e8f0]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-3 py-2 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  <div className="flex items-center gap-2.5">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="w-8 h-8 rounded-md object-cover bg-slate-100 border border-slate-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] border border-slate-200">No Img</div>
                    )}
                    <span className="font-semibold text-slate-800 whitespace-nowrap">{product.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap">Rp {product.price?.toLocaleString('id-ID')}</td>
                <td className="px-3 py-2 text-slate-600 font-medium">{product.minimalOrder}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    product.status === 'Active' ? 'bg-green-100 text-green-700' :
                    product.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {product.status}
                  </span>
                </td>
                
                {/* Category Checkboxes */}
                {categories.map(cat => {
                  const isChecked = product.tags?.some(t => t.toLowerCase() === cat.name.toLowerCase());
                  return (
                    <td key={cat.id} className="px-2 py-2 text-center border-l border-slate-50 bg-slate-50/30 group-hover:bg-slate-100/50">
                      <div className="flex items-center justify-center h-full">
                        <input 
                          type="checkbox"
                          checked={isChecked || false}
                          onChange={() => handleToggleCategory(product.id as string, product.tags || [], cat.name)}
                          className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-slate-700 focus:ring-slate-600 focus:ring-offset-0 cursor-pointer shadow-sm transition-all"
                        />
                      </div>
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-right sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[-1px_0_0_0_#e2e8f0]">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => navigate(`/product/edit/${product.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id as string)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5 + categories.length} className="px-3 py-8 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
