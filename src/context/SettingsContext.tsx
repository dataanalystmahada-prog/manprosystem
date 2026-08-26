import React, { createContext, useContext, useState, useEffect } from 'react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SettingsData {
  products: string[];
  subProducts: string[];
  pics: string[];
  loginUsers: string[];
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (key: keyof SettingsData, items: string[]) => void;
  addItem: (key: keyof SettingsData, item: string) => void;
  removeItem: (key: keyof SettingsData, index: number) => void;
}

const defaultSettings: SettingsData = {
  products: ['Payung', 'Tumbler', 'Hardbox', 'Totebag', 'Mug', 'Sticky Notes', 'Pouch'],
  subProducts: ['Payung Fullprint', 'Payung Golf', 'Tumbler Insert Paper', 'Tumbler Premium', 'Hardbox Premium', 'Totebag Canvas', 'Mug Custom'],
  pics: ['Andi', 'Budi', 'Citra', 'Dita', 'Raka', 'Sinta'],
  loginUsers: ['Admin', 'Manager', 'Staff 1'],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('manpro_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSettingsFromSupabase();
    }
  }, []);

  const fetchSettingsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('data')
        .eq('id', 'global')
        .single();
        
      if (data && data.data) {
        setSettings(data.data as SettingsData);
        localStorage.setItem('manpro_settings', JSON.stringify(data.data));
      } else if (error && error.code === 'PGRST116') {
        // No row found, let's insert the default or local storage settings
        await supabase.from('settings').insert({ id: 'global', data: settings });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const saveSettingsToSupabase = async (newSettings: SettingsData) => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('settings').upsert({ id: 'global', data: newSettings, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  const updateSettings = (key: keyof SettingsData, items: string[]) => {
    const newSettings = { ...settings, [key]: items };
    setSettings(newSettings);
    localStorage.setItem('manpro_settings', JSON.stringify(newSettings));
    saveSettingsToSupabase(newSettings);
  };

  const addItem = (key: keyof SettingsData, item: string) => {
    if (!item.trim()) return;
    const newSettings = {
      ...settings,
      [key]: [...settings[key], item.trim()]
    };
    setSettings(newSettings);
    localStorage.setItem('manpro_settings', JSON.stringify(newSettings));
    saveSettingsToSupabase(newSettings);
  };

  const removeItem = (key: keyof SettingsData, index: number) => {
    const newItems = [...settings[key]];
    newItems.splice(index, 1);
    const newSettings = { ...settings, [key]: newItems };
    setSettings(newSettings);
    localStorage.setItem('manpro_settings', JSON.stringify(newSettings));
    saveSettingsToSupabase(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, addItem, removeItem }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
