import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { SetPiece, SetPieceType, SetPiecePosition } from '../types';
import { loadSetPieces, saveSetPieces } from '../utils/persistence';

interface SetPieceContextType {
  setPieces: SetPiece[];
  addSetPiece: (setPiece: SetPiece) => void;
  updateSetPiece: (id: string, updates: Partial<SetPiece>) => void;
  deleteSetPiece: (id: string) => void;
  getSetPiece: (id: string) => SetPiece | undefined;
  getSetPiecesByType: (type: SetPieceType) => SetPiece[];
  updateSetPiecePositions: (id: string, positions: SetPiecePosition[]) => void;
}

export const SetPieceContext = createContext<SetPieceContextType | undefined>(undefined);

interface SetPieceProviderProps {
  children: ReactNode;
}

// Default set piece templates
const getDefaultSetPieces = (): SetPiece[] => [
  {
    id: 'default-defensive-corner',
    type: 'defensive_corner',
    name: 'Defensive Corner - Zonal',
    description: 'Standard zonal marking defensive corner setup',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Near Post', x: 15, y: 45, instructions: 'Guard near post' },
      { playerId: null, role: 'Far Post', x: 15, y: 55, instructions: 'Guard far post' },
      { playerId: null, role: 'Six Yard', x: 10, y: 50, instructions: 'Protect six yard box' },
      { playerId: null, role: 'Edge of Box', x: 25, y: 50, instructions: 'Cover edge of box' },
      { playerId: null, role: 'Deep', x: 30, y: 50, instructions: 'Sweeper role' }
    ]
  },
  {
    id: 'default-offensive-corner',
    type: 'offensive_corner',
    name: 'Offensive Corner - Near Post Flick',
    description: 'Attack near post with flick-on option',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Near Post', x: 15, y: 45, instructions: 'Flick on' },
      { playerId: null, role: 'Far Post', x: 15, y: 60, instructions: 'Attack far post' },
      { playerId: null, role: 'Penalty Spot', x: 18, y: 50, instructions: 'Attack center' },
      { playerId: null, role: 'Edge of Box', x: 30, y: 50, instructions: 'Cutback option' },
      { playerId: null, role: 'Short Option', x: 35, y: 35, instructions: 'Short corner option' }
    ]
  },
  {
    id: 'default-central-fk',
    type: 'central_free_kick',
    name: 'Central Free Kick - Wall & Run',
    description: 'Central free kick with wall and runner',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Striker', x: 10, y: 50, instructions: 'Wall or runner' },
      { playerId: null, role: 'Taker', x: 30, y: 50, instructions: 'Take the kick' },
      { playerId: null, role: 'Far Post', x: 15, y: 60, instructions: 'Attack far post' },
      { playerId: null, role: 'Near Post', x: 15, y: 40, instructions: 'Attack near post' }
    ]
  },
  {
    id: 'default-corridor-fk',
    type: 'corridor_free_kick',
    name: 'Corridor Free Kick - Cross',
    description: 'Wide free kick for crossing',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Near Post', x: 10, y: 45, instructions: 'Near post run' },
      { playerId: null, role: 'Far Post', x: 10, y: 60, instructions: 'Far post run' },
      { playerId: null, role: 'Penalty Spot', x: 18, y: 50, instructions: 'Central position' },
      { playerId: null, role: 'Taker', x: 40, y: 30, instructions: 'Deliver cross' }
    ]
  },
  {
    id: 'default-long-throw',
    type: 'long_throw',
    name: 'Long Throw - Near Post Flick',
    description: 'Long throw aiming for near post',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Near Post', x: 12, y: 40, instructions: 'Flick on' },
      { playerId: null, role: 'Far Post', x: 12, y: 65, instructions: 'Far post' },
      { playerId: null, role: 'Center', x: 18, y: 50, instructions: 'Attack center' },
      { playerId: null, role: 'Thrower', x: 50, y: 20, instructions: 'Take throw' }
    ]
  },
  {
    id: 'default-wall',
    type: 'defensive_wall',
    name: 'Defensive Wall - 4 Man',
    description: 'Standard 4-man wall setup',
    isDefault: true,
    positions: [
      { playerId: null, role: 'Wall 1', x: 20, y: 45, instructions: 'Left of wall' },
      { playerId: null, role: 'Wall 2', x: 20, y: 48, instructions: 'Center-left' },
      { playerId: null, role: 'Wall 3', x: 20, y: 52, instructions: 'Center-right' },
      { playerId: null, role: 'Wall 4', x: 20, y: 55, instructions: 'Right of wall' }
    ]
  }
];

export function SetPieceProvider({ children }: SetPieceProviderProps) {
  const [setPieces, setSetPieces] = useState<SetPiece[]>(getDefaultSetPieces());

  // Load set pieces from localStorage on mount
  useEffect(() => {
    const loaded = loadSetPieces();
    if (loaded.length > 0) {
      // Merge with defaults (keep defaults if no saved ones exist)
      const defaults = getDefaultSetPieces();
      const merged = [...defaults, ...loaded.filter(sp => !sp.isDefault)];
      setSetPieces(merged);
    }
  }, []);

  // Save set pieces to localStorage whenever they change
  useEffect(() => {
    const nonDefaultPieces = setPieces.filter(sp => !sp.isDefault);
    if (nonDefaultPieces.length > 0) {
      saveSetPieces(nonDefaultPieces);
    }
  }, [setPieces]);

  const addSetPiece = (setPiece: SetPiece) => {
    setSetPieces(prev => [...prev, setPiece]);
  };

  const updateSetPiece = (id: string, updates: Partial<SetPiece>) => {
    setSetPieces(prev =>
      prev.map(sp => (sp.id === id ? { ...sp, ...updates } : sp))
    );
  };

  const deleteSetPiece = (id: string) => {
    setSetPieces(prev => prev.filter(sp => sp.id !== id || sp.isDefault));
  };

  const getSetPiece = (id: string): SetPiece | undefined => {
    return setPieces.find(sp => sp.id === id);
  };

  const getSetPiecesByType = (type: SetPieceType): SetPiece[] => {
    return setPieces.filter(sp => sp.type === type);
  };

  const updateSetPiecePositions = (id: string, positions: SetPiecePosition[]) => {
    setSetPieces(prev =>
      prev.map(sp => (sp.id === id ? { ...sp, positions } : sp))
    );
  };

  return (
    <SetPieceContext.Provider
      value={{
        setPieces,
        addSetPiece,
        updateSetPiece,
        deleteSetPiece,
        getSetPiece,
        getSetPiecesByType,
        updateSetPiecePositions
      }}
    >
      {children}
    </SetPieceContext.Provider>
  );
}
