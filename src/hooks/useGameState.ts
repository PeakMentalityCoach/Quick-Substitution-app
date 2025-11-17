import { useContext } from 'react';
import { GameStateContext } from '../context/GameStateContext';

export function useGameState() {
  const context = useContext(GameStateContext);

  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }

  return context;
}
