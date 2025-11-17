import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { Player } from '../types';
import { loadPlayers, savePlayers } from '../utils/persistence';

interface PlayersContextType {
  players: Player[];
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;
  clearPlayers: () => void;
}

export const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

interface PlayersProviderProps {
  children: ReactNode;
}

export function PlayersProvider({ children }: PlayersProviderProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  // Load players from localStorage on mount
  useEffect(() => {
    const loadedPlayers = loadPlayers();
    if (loadedPlayers.length > 0) {
      setPlayers(loadedPlayers);
    }
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (players.length > 0) {
      savePlayers(players);
    }
  }, [players]);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === id ? { ...player, ...updates } : player
      )
    );
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(player => player.id !== id));
  };

  const getPlayer = (id: string): Player | undefined => {
    return players.find(player => player.id === id);
  };

  const clearPlayers = () => {
    setPlayers([]);
  };

  return (
    <PlayersContext.Provider
      value={{
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayer,
        clearPlayers
      }}
    >
      {children}
    </PlayersContext.Provider>
  );
}
