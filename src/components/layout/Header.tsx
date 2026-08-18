import React from 'react';
import { Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1">
        <div className="relative w-80">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products, SKUs..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border-none rounded-md text-[13px] focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-500 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex gap-2 mr-1">
          <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wide">Supabase Connected</span>
        </div>
        <button className="relative rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <span className="sr-only">View notifications</span>
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
