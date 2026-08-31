import React from 'react';
import { NavLink } from 'react-router';
import { LayoutGrid, BarChart2, RefreshCcw, Ban, CheckCircle, Download, Megaphone, Settings, HelpCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

const mainNavigation = [
  { name: 'ALL Produk', href: '/products/all', icon: LayoutGrid },
  { name: 'New Produk !!!', href: '/products/new', icon: BarChart2 },
  { name: 'Discontinue', href: '/products/discontinue', icon: Ban },
  { name: 'Ketentuan Produk', href: '/products/ketentuan', icon: FileText },
];

const secondaryNavigation = [
  { name: 'Poster Promo', href: '/products/poster-rekomendasi', icon: Megaphone },
  { name: 'Kanban RND', href: '/rnd', icon: RefreshCcw },
  { name: 'Data Choise', href: '/products/indata', icon: Download },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Master', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-full flex-col bg-[#4a5568]">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#10b981] font-black text-xl text-white shadow-sm flex-shrink-0">
            M
          </div>
          <div className="flex flex-col items-start ml-1 overflow-hidden">
            <span className="font-black text-[18px] leading-none text-white tracking-wider">
              MANPRO
            </span>
            <span className="font-bold text-[8.5px] uppercase leading-none text-emerald-400 mt-1 tracking-wide opacity-90">
              Managemen Produk
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-3 overflow-y-auto mt-1">
        <div className="space-y-0.5">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold rounded-md transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="my-3 border-t border-slate-500 mx-2"></div>

        <div className="space-y-0.5">
          {secondaryNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold rounded-md transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
