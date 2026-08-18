import React from 'react';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import { mockProducts } from '../mockData';

export function Dashboard() {
  const activeProducts = mockProducts.filter(p => p.status === 'Active').length;
  const lowStock = mockProducts.filter(p => p.minimalOrder > 0 && p.minimalOrder <= 10).length;
  const outOfStock = mockProducts.filter(p => p.minimalOrder === 0).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Overview of your product inventory and metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active Products</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{activeProducts}</h3>
            <Package className="h-6 w-6 text-blue-500 opacity-20" />
          </div>
          <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +2% from last month
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Low Stock Alerts</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-600">{lowStock}</h3>
            <AlertCircle className="h-6 w-6 text-amber-500 opacity-20" />
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Requires attention</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Out of Stock</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600">{outOfStock}</h3>
            <AlertCircle className="h-6 w-6 text-red-500 opacity-20" />
          </div>
          <p className="text-[11px] text-red-400 font-medium mt-1">Immediate action needed</p>
        </div>
      </div>

      {/* Recent Activity or Quick List could go here */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-[13px] text-slate-800">Recently Added Products</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {mockProducts.slice(0, 3).map((product) => (
            <div key={product.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{product.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">{product.minimalOrder} Min. Order</p>
                </div>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  product.status === 'Active' ? 'bg-green-100 text-green-700' :
                  product.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
