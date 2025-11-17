import { Player, GameState, PlayerAssignment, SetPieceLayout, AppData } from '../types';
import { getDefaultSetPieceLayouts } from './setPieces';

const STORAGE_KEY = 'football-optimizer-data';

/**
 * Loads app data from localStorage
 */
export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AppData;

      // Migrate old player data to new format (backward compatibility)
      if (data.squad) {
        data.squad = data.squad.map((player) => ({
          ...player,
          note: player.note || '',
          noteAffectsOptimization: player.noteAffectsOptimization ?? false,
        }));
      }

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
 * Saves app data to localStorage
 */
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

/**
 * Saves squad to localStorage
 */
export function saveSquad(squad: Player[]): void {
  const data = loadData();
  data.squad = squad;
  saveData(data);
}

/**
 * Saves game state to localStorage
 */
export function saveGameState(gameState: GameState | null): void {
  const data = loadData();
  data.gameState = gameState;
  saveData(data);
}

/**
 * Saves current lineup to localStorage
 */
export function saveLineup(lineup: PlayerAssignment[]): void {
  const data = loadData();
  data.currentLineup = lineup;
  saveData(data);
}

/**
 * Saves set piece layouts to localStorage
 */
export function saveSetPieceLayouts(layouts: SetPieceLayout[]): void {
  const data = loadData();
  data.setPieceLayouts = layouts;
  saveData(data);
}

/**
 * Clears all data from localStorage
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
