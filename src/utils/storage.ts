import { Player, SetPieceLayout, AppSettings, LineupPlayer, Formation } from '../types';

const STORAGE_KEYS = {
  PLAYERS: 'football_optimizer_players',
  LINEUP: 'football_optimizer_lineup',
  FORMATION: 'football_optimizer_formation',
  SET_PIECES: 'football_optimizer_set_pieces',
  SETTINGS: 'football_optimizer_settings',
};

export const storage = {
  // Players
  savePlayers: (players: Player[]): void => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  },
  
  loadPlayers: (): Player[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : [];
  },
  
  // Lineup
  saveLineup: (lineup: LineupPlayer[]): void => {
    localStorage.setItem(STORAGE_KEYS.LINEUP, JSON.stringify(lineup));
  },
  
  loadLineup: (): LineupPlayer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LINEUP);
    return data ? JSON.parse(data) : [];
  },
  
  // Formation
  saveFormation: (formation: Formation): void => {
    localStorage.setItem(STORAGE_KEYS.FORMATION, JSON.stringify(formation));
  },
  
  loadFormation: (): Formation | null => {
    const data = localStorage.getItem(STORAGE_KEYS.FORMATION);
    return data ? JSON.parse(data) : null;
  },
  
  // Set Pieces
  saveSetPieces: (setPieces: SetPieceLayout[]): void => {
    localStorage.setItem(STORAGE_KEYS.SET_PIECES, JSON.stringify(setPieces));
  },
  
  loadSetPieces: (): SetPieceLayout[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SET_PIECES);
    return data ? JSON.parse(data) : [];
  },
  
  // Settings
  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  
  loadSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      teamName: 'My Team',
      coachName: 'Coach',
      maxSubstitutions: 5,
      gameDuration: 90,
      defaultFormation: '4-3-3',
    };
  },
  
  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
