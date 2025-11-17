import type { SavedData, Player, GameState, SetPiece, AppSettings } from '../types';

const STORAGE_KEY = 'football_optimizer_data';
const STORAGE_VERSION = '1.0.0';

interface StorageData extends SavedData {
  version: string;
}

export function saveData(data: SavedData): boolean {
  try {
    const storageData: StorageData = {
      ...data,
      version: STORAGE_VERSION,
      lastUpdated: new Date()
    };

    const json = JSON.stringify(storageData);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
}

export function loadData(): SavedData | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    const storageData: StorageData = JSON.parse(json);

    // Check version compatibility
    if (storageData.version !== STORAGE_VERSION) {
      console.warn('Data version mismatch. Migration may be needed.');
      // Could implement migration logic here
    }

    // Convert date strings back to Date objects
    if (storageData.lastUpdated) {
      storageData.lastUpdated = new Date(storageData.lastUpdated);
    }

    if (storageData.gameState?.matchEvents) {
      storageData.gameState.matchEvents = storageData.gameState.matchEvents.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    }

    return storageData;
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
}

export function savePlayers(players: Player[]): boolean {
  const data = loadData() || getDefaultData();
  data.players = players;
  return saveData(data);
}

export function loadPlayers(): Player[] {
  const data = loadData();
  return data?.players || [];
}

export function saveGameState(gameState: GameState): boolean {
  const data = loadData() || getDefaultData();
  data.gameState = gameState;
  return saveData(data);
}

export function loadGameState(): GameState | null {
  const data = loadData();
  return data?.gameState || null;
}

export function saveSetPieces(setPieces: SetPiece[]): boolean {
  const data = loadData() || getDefaultData();
  data.setPieces = setPieces;
  return saveData(data);
}

export function loadSetPieces(): SetPiece[] {
  const data = loadData();
  return data?.setPieces || [];
}

export function saveSettings(settings: AppSettings): boolean {
  const data = loadData() || getDefaultData();
  data.settings = settings;
  return saveData(data);
}

export function loadSettings(): AppSettings {
  const data = loadData();
  return data?.settings || getDefaultSettings();
}

export function clearAllData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
}

export function exportData(): string {
  const data = loadData() || getDefaultData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data: SavedData = JSON.parse(jsonString);
    return saveData(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

export function getDefaultSettings(): AppSettings {
  return {
    theme: 'light',
    useNotesForOptimization: true,
    defaultFormation: '4-3-3',
    maxSubstitutions: 5,
    enableAnimations: true,
    autoSave: true
  };
}

function getDefaultData(): SavedData {
  return {
    players: [],
    gameState: {
      formation: '4-3-3',
      startingLineup: [],
      substitutes: [],
      currentScore: { home: 0, away: 0 },
      matchTime: 0,
      isMatchActive: false,
      substitutionsUsed: 0,
      maxSubstitutions: 5,
      matchEvents: []
    },
    setPieces: [],
    settings: getDefaultSettings(),
    lastUpdated: new Date()
  };
}

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout | null = null;

export function enableAutoSave(callback: () => SavedData, interval: number = 30000): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }

  autoSaveTimer = setInterval(() => {
    const data = callback();
    saveData(data);
    console.log('Auto-saved at', new Date().toLocaleTimeString());
  }, interval);
}

export function disableAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}
