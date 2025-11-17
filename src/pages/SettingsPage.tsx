import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import PMCLogo from '../components/PMCLogo';
import Navigation from '../components/Navigation';
import PlayerManager from '../components/PlayerManager';
import { Save, Download, Upload, Trash2 } from 'lucide-react';
import { exportToJSON, importFromJSON } from '../utils/helpers';
import { storage } from '../utils/storage';

export default function SettingsPage() {
  const { settings, updateSettings, players, setPlayers } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Settings saved!');
  };

  const handleExport = () => {
    const data = {
      players,
      settings,
      exportDate: new Date().toISOString(),
    };
    exportToJSON(data, `football-optimizer-${Date.now()}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON<any>(file);
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.settings) {
        updateSettings(data.settings);
        setLocalSettings(data.settings);
      }
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleClearAll = () => {
    if (confirm('This will delete ALL data including players, lineup, and settings. Are you sure?')) {
      storage.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pmc-primary to-pmc-secondary text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <PMCLogo className="mb-4" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Settings */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Team Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={localSettings.teamName}
                onChange={(e) => setLocalSettings({ ...localSettings, teamName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coach Name
              </label>
              <input
                type="text"
                value={localSettings.coachName}
                onChange={(e) => setLocalSettings({ ...localSettings, coachName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Substitutions
              </label>
              <input
                type="number"
                min="3"
                max="7"
                value={localSettings.maxSubstitutions}
                onChange={(e) => setLocalSettings({ ...localSettings, maxSubstitutions: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Duration (minutes)
              </label>
              <input
                type="number"
                min="60"
                max="120"
                value={localSettings.gameDuration}
                onChange={(e) => setLocalSettings({ ...localSettings, gameDuration: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Management</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>

            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleClearAll}
              className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Player Management */}
        <PlayerManager />
      </div>
    </div>
  );
}
