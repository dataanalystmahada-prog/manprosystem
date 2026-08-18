import React from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export function Categories() {
  const { categories, products } = useProducts();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">Organize your products into categories.</p>
        </div>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm text-[13px] font-semibold hover:bg-blue-700 inline-flex items-center transition-colors">
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = products.filter(p => p.tags?.includes(category.name)).length;
          
          return (
            <div key={category.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <FolderTree className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 leading-tight">{category.name}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">/{category.slug}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-[13px]">
                  <span className="font-bold text-slate-900">{productCount}</span>
                  <span className="text-slate-500 text-[10px] ml-1 uppercase font-bold tracking-wider">Products</span>
                </div>
                <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Manage
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
