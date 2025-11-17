import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { FormationGrid } from '../components/FormationGrid';
import { exportData, importData, clearAllData } from '../utils/persistence';
import type { Formation } from '../types';

export function SettingsPage() {
  const settingsContext = useContext(SettingsContext);

  if (!settingsContext) {
    return <div>Loading...</div>;
  }

  const {
    settings,
    toggleTheme,
    toggleNotesOptimization,
    toggleAnimations,
    toggleAutoSave,
    setDefaultFormation,
    setMaxSubstitutions,
    resetSettings
  } = settingsContext;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-optimizer-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = importData(content);
          if (success) {
            alert('Data imported successfully! Please refresh the page.');
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      alert('All data cleared! Please refresh the page.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Animations</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable or disable UI animations
              </p>
            </div>
            <button
              onClick={toggleAnimations}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableAnimations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Optimization
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Use Notes for Optimization
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI will consider player notes when optimizing lineups
              </p>
            </div>
            <button
              onClick={toggleNotesOptimization}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.useNotesForOptimization ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.useNotesForOptimization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-4">
              Default Formation
            </p>
            <FormationGrid
              selectedFormation={settings.defaultFormation}
              onFormationChange={(formation: Formation) => setDefaultFormation(formation)}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Maximum Substitutions
            </p>
            <input
              type="number"
              min="3"
              max="9"
              value={settings.maxSubstitutions}
              onChange={(e) => setMaxSubstitutions(parseInt(e.target.value))}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-Save</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically save changes to local storage
              </p>
            </div>
            <button
              onClick={toggleAutoSave}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>

            <button
              onClick={handleImport}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Import Data</span>
            </button>

            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          About
        </h2>
        <div className="text-gray-600 dark:text-gray-400 space-y-2">
          <p>Football Optimizer v1.0.0</p>
          <p>Powered by Peak Mentality Coach</p>
          <p className="text-sm">
            AI-powered lineup optimization with notes interpretation
          </p>
        </div>
      </div>
    </div>
  );
}
