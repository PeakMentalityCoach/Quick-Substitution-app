import { Player, GameState, PlayerAssignment, SetPieceLayout, AppData } from '../types';
import { getDefaultSetPieceLayouts } from './setPieces';
import * as api from '../api/client';

const STORAGE_KEY = 'football-optimizer-data';
const USE_API = import.meta.env.VITE_USE_API !== 'false'; // Use API by default

/**
 * Loads app data from localStorage (fallback)
 */
function loadDataFromLocalStorage(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AppData;

      // Ensure set piece layouts exist (for backward compatibility)
      if (!data.setPieceLayouts || data.setPieceLayouts.length === 0) {
        data.setPieceLayouts = getDefaultSetPieceLayouts();
      }

      return data;
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }

  // Return default data
  return {
    squad: [],
    gameState: null,
    currentLineup: [],
    setPieceLayouts: getDefaultSetPieceLayouts(),
  };
}

/**
 * Loads app data from API or localStorage fallback
 */
export async function loadData(): Promise<AppData> {
  if (!USE_API) {
    return loadDataFromLocalStorage();
  }

  try {
    const [squad, currentLineup, gameState, setPieceLayouts] = await Promise.all([
      api.getPlayers(),
      api.getCurrentLineup(),
      api.getGameState(),
      api.getSetPieceLayouts(),
    ]);

    // If no set piece layouts, get defaults
    const layouts = setPieceLayouts.length > 0 ? setPieceLayouts : await api.getDefaultSetPieceLayouts();

    return {
      squad,
      gameState,
      currentLineup,
      setPieceLayouts: layouts,
    };
  } catch (error) {
    console.warn('Failed to load from API, falling back to localStorage:', error);
    return loadDataFromLocalStorage();
  }
}

/**
 * Saves app data to localStorage (fallback)
 */
function saveDataToLocalStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

/**
 * Saves app data to API or localStorage fallback
 */
export async function saveData(data: AppData): Promise<void> {
  if (!USE_API) {
    saveDataToLocalStorage(data);
    return;
  }

  try {
    // Save all data in parallel
    await Promise.all([
      api.saveCurrentLineup(data.currentLineup),
      api.saveGameState(data.gameState),
    ]);

    // Also save to localStorage as backup
    saveDataToLocalStorage(data);
  } catch (error) {
    console.warn('Failed to save to API, falling back to localStorage:', error);
    saveDataToLocalStorage(data);
  }
}

/**
 * Saves squad to storage
 */
export async function saveSquad(squad: Player[]): Promise<void> {
  if (!USE_API) {
    const data = loadDataFromLocalStorage();
    data.squad = squad;
    saveDataToLocalStorage(data);
    return;
  }

  // When using API, players are saved individually via the API client
  // This function is kept for compatibility but doesn't need to do anything
  // as players are created/updated via api.createPlayer() and api.updatePlayer()
}

/**
 * Saves game state to storage
 */
export async function saveGameState(gameState: GameState | null): Promise<void> {
  if (!USE_API) {
    const data = loadDataFromLocalStorage();
    data.gameState = gameState;
    saveDataToLocalStorage(data);
    return;
  }

  try {
    await api.saveGameState(gameState);
  } catch (error) {
    console.warn('Failed to save game state to API, falling back to localStorage:', error);
    const data = loadDataFromLocalStorage();
    data.gameState = gameState;
    saveDataToLocalStorage(data);
  }
}

/**
 * Saves current lineup to storage
 */
export async function saveLineup(lineup: PlayerAssignment[]): Promise<void> {
  if (!USE_API) {
    const data = loadDataFromLocalStorage();
    data.currentLineup = lineup;
    saveDataToLocalStorage(data);
    return;
  }

  try {
    await api.saveCurrentLineup(lineup);
  } catch (error) {
    console.warn('Failed to save lineup to API, falling back to localStorage:', error);
    const data = loadDataFromLocalStorage();
    data.currentLineup = lineup;
    saveDataToLocalStorage(data);
  }
}

/**
 * Saves set piece layouts to storage
 */
export async function saveSetPieceLayouts(layouts: SetPieceLayout[]): Promise<void> {
  if (!USE_API) {
    const data = loadDataFromLocalStorage();
    data.setPieceLayouts = layouts;
    saveDataToLocalStorage(data);
    return;
  }

  // When using API, set pieces are saved individually via the API client
  // This function is kept for compatibility
}

/**
 * Clears all data from storage
 */
export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
}

/**
 * Exports data as JSON file
 */
export function exportData(): void {
  const data = loadData();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `football-optimizer-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Imports data from JSON file
 */
export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        saveData(data);
        resolve();
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
