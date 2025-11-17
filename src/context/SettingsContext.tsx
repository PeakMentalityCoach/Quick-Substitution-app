import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings, Formation } from '../types';
import { loadSettings, saveSettings, getDefaultSettings } from '../utils/persistence';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  toggleNotesOptimization: () => void;
  toggleAnimations: () => void;
  toggleAutoSave: () => void;
  setDefaultFormation: (formation: Formation) => void;
  setMaxSubstitutions: (max: number) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());

  // Load settings from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);

    // Apply theme
    if (loaded.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(settings);

    // Apply theme changes
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const toggleNotesOptimization = () => {
    setSettings(prev => ({
      ...prev,
      useNotesForOptimization: !prev.useNotesForOptimization
    }));
  };

  const toggleAnimations = () => {
    setSettings(prev => ({
      ...prev,
      enableAnimations: !prev.enableAnimations
    }));
  };

  const toggleAutoSave = () => {
    setSettings(prev => ({
      ...prev,
      autoSave: !prev.autoSave
    }));
  };

  const setDefaultFormation = (formation: Formation) => {
    setSettings(prev => ({ ...prev, defaultFormation: formation }));
  };

  const setMaxSubstitutions = (max: number) => {
    setSettings(prev => ({ ...prev, maxSubstitutions: max }));
  };

  const resetSettings = () => {
    setSettings(getDefaultSettings());
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleTheme,
        toggleNotesOptimization,
        toggleAnimations,
        toggleAutoSave,
        setDefaultFormation,
        setMaxSubstitutions,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
