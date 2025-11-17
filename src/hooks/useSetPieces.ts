import { useContext } from 'react';
import { SetPieceContext } from '../context/SetPieceContext';

export function useSetPieces() {
  const context = useContext(SetPieceContext);

  if (!context) {
    throw new Error('useSetPieces must be used within SetPieceProvider');
  }

  return context;
}
