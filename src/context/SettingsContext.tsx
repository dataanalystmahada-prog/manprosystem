import React, { createContext, useContext, useState, useEffect } from 'react';

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
    localStorage.setItem('manpro_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key: keyof SettingsData, items: string[]) => {
    setSettings(prev => ({ ...prev, [key]: items }));
  };

  const addItem = (key: keyof SettingsData, item: string) => {
    if (!item.trim()) return;
    setSettings(prev => ({
      ...prev,
      [key]: [...prev[key], item.trim()]
    }));
  };

  const removeItem = (key: keyof SettingsData, index: number) => {
    setSettings(prev => {
      const newItems = [...prev[key]];
      newItems.splice(index, 1);
      return { ...prev, [key]: newItems };
    });
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
