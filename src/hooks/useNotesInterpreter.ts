import { useMemo } from 'react';
import type { Player, NotesInterpretation } from '../types';
import { interpretPlayerNotes, getModifierSummary } from '../utils/interpretNotes';

export function useNotesInterpreter(players: Player[]) {
  const interpretations = useMemo(() => {
    return players.map(player => interpretPlayerNotes(player.id, player.notes));
  }, [players]);

  const getPlayerInterpretation = (playerId: string): NotesInterpretation | undefined => {
    return interpretations.find(i => i.playerId === playerId);
  };

  const getPlayerModifierSummary = (playerId: string, position?: string): string => {
    const interpretation = getPlayerInterpretation(playerId);
    if (!interpretation) return 'No notes';

    return getModifierSummary(interpretation.modifiers, position as any);
  };

  const hasWarnings = (playerId: string): boolean => {
    const interpretation = getPlayerInterpretation(playerId);
    return interpretation ? interpretation.warnings.length > 0 : false;
  };

  return {
    interpretations,
    getPlayerInterpretation,
    getPlayerModifierSummary,
    hasWarnings
  };
}
