import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Player,
  LineupPlayer,
  Formation,
  SetPieceLayout,
  GameState,
  AppSettings,
  AppContextType,
  SubstitutionSuggestion,
} from '../types';
import { storage } from '../utils/storage';
import { generateSubstitutionSuggestions } from '../utils/optimizer';
import { generateId } from '../utils/helpers';
import { FORMATIONS } from '../utils/formations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [players, setPlayersState] = useState<Player[]>([]);
  const [lineup, setLineupState] = useState<LineupPlayer[]>([]);
  const [formation, setFormationState] = useState<Formation | null>(null);
  const [setPieces, setSetPiecesState] = useState<SetPieceLayout[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>({
    teamName: 'My Team',
    coachName: 'Coach',
    maxSubstitutions: 5,
    gameDuration: 90,
    defaultFormation: '4-3-3',
  });
  const [gameState, setGameStateState] = useState<GameState>({
    currentMinute: 0,
    score: { home: 0, away: 0 },
    substitutionsUsed: 0,
    maxSubstitutions: 5,
  });

  // Load data from storage on mount
  useEffect(() => {
    const loadedPlayers = storage.loadPlayers();
    const loadedLineup = storage.loadLineup();
    const loadedFormation = storage.loadFormation();
    const loadedSetPieces = storage.loadSetPieces();
    const loadedSettings = storage.loadSettings();

    setPlayersState(loadedPlayers);
    setLineupState(loadedLineup);
    setFormationState(loadedFormation || FORMATIONS[0]);
    setSetPiecesState(loadedSetPieces);
    setSettingsState(loadedSettings);
    setGameStateState(prev => ({ ...prev, maxSubstitutions: loadedSettings.maxSubstitutions }));
  }, []);

  // Player operations
  const setPlayers = (newPlayers: Player[]) => {
    setPlayersState(newPlayers);
    storage.savePlayers(newPlayers);
  };

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer: Player = { ...player, id: generateId() };
    const newPlayers = [...players, newPlayer];
    setPlayers(newPlayers);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    const newPlayers = players.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPlayers(newPlayers);
  };

  const deletePlayer = (id: string) => {
    const newPlayers = players.filter(p => p.id !== id);
    setPlayers(newPlayers);
  };

  // Lineup operations
  const setLineup = (newLineup: LineupPlayer[]) => {
    setLineupState(newLineup);
    storage.saveLineup(newLineup);
  };

  // Formation operations
  const setFormation = (newFormation: Formation) => {
    setFormationState(newFormation);
    storage.saveFormation(newFormation);
  };

  // Set pieces operations
  const addSetPiece = (setPiece: Omit<SetPieceLayout, 'id'>) => {
    const newSetPiece: SetPieceLayout = { ...setPiece, id: generateId() };
    const newSetPieces = [...setPieces, newSetPiece];
    setSetPiecesState(newSetPieces);
    storage.saveSetPieces(newSetPieces);
  };

  const updateSetPiece = (id: string, updates: Partial<SetPieceLayout>) => {
    const newSetPieces = setPieces.map(sp => (sp.id === id ? { ...sp, ...updates } : sp));
    setSetPiecesState(newSetPieces);
    storage.saveSetPieces(newSetPieces);
  };

  const deleteSetPiece = (id: string) => {
    const newSetPieces = setPieces.filter(sp => sp.id !== id);
    setSetPiecesState(newSetPieces);
    storage.saveSetPieces(newSetPieces);
  };

  // Game state operations
  const setGameState = (updates: Partial<GameState>) => {
    setGameStateState(prev => ({ ...prev, ...updates }));
  };

  // Settings operations
  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    storage.saveSettings(newSettings);
  };

  // Helper functions
  const getPlayerById = (id: string): Player | undefined => {
    return players.find(p => p.id === id);
  };

  const getAvailablePlayers = (): Player[] => {
    return players.filter(p => p.status === 'available' && !p.notes?.isInjured);
  };

  const getSubstitutionSuggestions = (): SubstitutionSuggestion[] => {
    return generateSubstitutionSuggestions(lineup, players, gameState.currentMinute);
  };

  const value: AppContextType = {
    players,
    setPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
    lineup,
    setLineup,
    formation,
    setFormation,
    setPieces,
    addSetPiece,
    updateSetPiece,
    deleteSetPiece,
    gameState,
    setGameState,
    settings,
    updateSettings,
    getPlayerById,
    getAvailablePlayers,
    getSubstitutionSuggestions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
