import React, { useState } from 'react';
import { useSettings, SettingsData } from '../context/SettingsContext';
import { Plus, X, Settings as SettingsIcon, Package, Layers, Users, KeyRound } from 'lucide-react';
import { cn } from '../lib/utils';

type TabType = keyof SettingsData;

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
  { id: 'subProducts', label: 'Sub Produk', icon: <Layers className="w-4 h-4" /> },
  { id: 'pics', label: 'PIC (Kanban)', icon: <Users className="w-4 h-4" /> },
  { id: 'loginUsers', label: 'Login User', icon: <KeyRound className="w-4 h-4" /> },
];

export function Settings() {
  const { settings, addItem, removeItem } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans -mx-8 -my-6 px-6 py-5 overflow-hidden">
      
      <div className="flex flex-col gap-4 mb-5 flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <SettingsIcon className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-0.5 tracking-tight">Pengaturan Master Data</h1>
            <p className="text-[13px] text-slate-500">Kelola daftar referensi untuk produk, sub produk, PIC, dan login user.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-700 bg-emerald-50/50" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl pb-8">
          {activeTab === 'products' && (
            <SettingsColumn 
              title="Produk" 
              settingKey="products" 
              items={settings.products} 
              onAdd={(item) => addItem('products', item)}
              onRemove={(index) => removeItem('products', index)}
            />
          )}
          {activeTab === 'subProducts' && (
            <SettingsColumn 
              title="Sub Produk" 
              settingKey="subProducts" 
              items={settings.subProducts} 
              onAdd={(item) => addItem('subProducts', item)}
              onRemove={(index) => removeItem('subProducts', index)}
            />
          )}
          {activeTab === 'pics' && (
            <SettingsColumn 
              title="PIC (Kanban)" 
              settingKey="pics" 
              items={settings.pics} 
              onAdd={(item) => addItem('pics', item)}
              onRemove={(index) => removeItem('pics', index)}
            />
          )}
          {activeTab === 'loginUsers' && (
            <SettingsColumn 
              title="Login User" 
              settingKey="loginUsers" 
              items={settings.loginUsers} 
              onAdd={(item) => addItem('loginUsers', item)}
              onRemove={(index) => removeItem('loginUsers', index)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingsColumnProps {
  title: string;
  settingKey: keyof SettingsData;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

function SettingsColumn({ title, items, onAdd, onRemove }: SettingsColumnProps) {
  const [newValue, setNewValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-[13px] text-slate-800 uppercase tracking-tight">{title}</h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded">
          {items.length}
        </span>
      </div>
      
      <div className="p-3 border-b border-slate-100 bg-white">
        <form onSubmit={handleAdd} className="relative">
          <input 
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Tambah ${title.toLowerCase()}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!newValue.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-slate-50/30">
        <div className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded-lg group hover:border-slate-200 transition-colors shadow-sm">
              <span className="text-[13px] font-medium text-slate-700 truncate pr-2">{item}</span>
              <button 
                onClick={() => onRemove(index)}
                className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-6 text-[12px] text-slate-400">
              Belum ada data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
