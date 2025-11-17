import { useContext } from 'react';
import { PlayersContext } from '../context/PlayersContext';

export function usePlayers() {
  const context = useContext(PlayersContext);

  if (!context) {
    throw new Error('usePlayers must be used within PlayersProvider');
  }

  return context;
}
