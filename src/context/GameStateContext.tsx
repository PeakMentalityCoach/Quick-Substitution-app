import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { GameState, LineupPosition, Player, MatchEvent, Formation } from '../types';
import { loadGameState, saveGameState } from '../utils/persistence';

interface GameStateContextType {
  gameState: GameState;
  setFormation: (formation: Formation) => void;
  setStartingLineup: (lineup: LineupPosition[]) => void;
  addSubstitute: (player: Player) => void;
  removeSubstitute: (playerId: string) => void;
  makeSubstitution: (playerOutId: string, playerInId: string, minute: number) => void;
  updateScore: (home: number, away: number) => void;
  updateMatchTime: (minutes: number) => void;
  startMatch: () => void;
  endMatch: () => void;
  addMatchEvent: (event: MatchEvent) => void;
  resetGameState: () => void;
}

export const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

interface GameStateProviderProps {
  children: ReactNode;
}

const getDefaultGameState = (): GameState => ({
  formation: '4-3-3',
  startingLineup: [],
  substitutes: [],
  currentScore: { home: 0, away: 0 },
  matchTime: 0,
  isMatchActive: false,
  substitutionsUsed: 0,
  maxSubstitutions: 5,
  matchEvents: []
});

export function GameStateProvider({ children }: GameStateProviderProps) {
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState());

  // Load game state from localStorage on mount
  useEffect(() => {
    const loadedState = loadGameState();
    if (loadedState) {
      setGameState(loadedState);
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const setFormation = (formation: Formation) => {
    setGameState(prev => ({ ...prev, formation }));
  };

  const setStartingLineup = (lineup: LineupPosition[]) => {
    setGameState(prev => ({ ...prev, startingLineup: lineup }));
  };

  const addSubstitute = (player: Player) => {
    setGameState(prev => ({
      ...prev,
      substitutes: [...prev.substitutes, player]
    }));
  };

  const removeSubstitute = (playerId: string) => {
    setGameState(prev => ({
      ...prev,
      substitutes: prev.substitutes.filter(p => p.id !== playerId)
    }));
  };

  const makeSubstitution = (playerOutId: string, playerInId: string, minute: number) => {
    setGameState(prev => {
      // Find players
      const playerOut = prev.startingLineup.find(lp => lp.player?.id === playerOutId)?.player;
      const playerIn = prev.substitutes.find(p => p.id === playerInId);

      if (!playerOut || !playerIn) return prev;

      // Update lineup
      const newLineup = prev.startingLineup.map(lp =>
        lp.player?.id === playerOutId ? { ...lp, player: playerIn } : lp
      );

      // Update substitutes
      const newSubstitutes = [
        ...prev.substitutes.filter(p => p.id !== playerInId),
        playerOut
      ];

      // Create substitution event
      const event: MatchEvent = {
        id: `sub-${Date.now()}`,
        type: 'substitution',
        minute,
        playerId: playerInId,
        description: `${playerIn.name} replaces ${playerOut.name}`,
        timestamp: new Date()
      };

      return {
        ...prev,
        startingLineup: newLineup,
        substitutes: newSubstitutes,
        substitutionsUsed: prev.substitutionsUsed + 1,
        matchEvents: [...prev.matchEvents, event]
      };
    });
  };

  const updateScore = (home: number, away: number) => {
    setGameState(prev => ({
      ...prev,
      currentScore: { home, away }
    }));
  };

  const updateMatchTime = (minutes: number) => {
    setGameState(prev => ({ ...prev, matchTime: minutes }));
  };

  const startMatch = () => {
    setGameState(prev => ({
      ...prev,
      isMatchActive: true,
      matchTime: 0,
      substitutionsUsed: 0
    }));
  };

  const endMatch = () => {
    setGameState(prev => ({ ...prev, isMatchActive: false }));
  };

  const addMatchEvent = (event: MatchEvent) => {
    setGameState(prev => ({
      ...prev,
      matchEvents: [...prev.matchEvents, event]
    }));
  };

  const resetGameState = () => {
    setGameState(getDefaultGameState());
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setFormation,
        setStartingLineup,
        addSubstitute,
        removeSubstitute,
        makeSubstitution,
        updateScore,
        updateMatchTime,
        startMatch,
        endMatch,
        addMatchEvent,
        resetGameState
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}
