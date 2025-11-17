import { useState, useEffect, useCallback } from 'react';
import { Player, PlayerAssignment, GameState } from '../../types';
import { optimizeSubstitution, calculateLineupScore } from '../../utils/optimizer';

export interface PlayerMetadata {
  playerId: string;
  minutesPlayed: number;
  bookings: ('yellow' | 'red')[];
  notes: string;
  fatigueLevel: number; // 0-100, where 100 is completely fatigued
  lastSubstitutionTime?: number;
}

export interface MatchState {
  currentTime: number; // in minutes
  lineup: PlayerAssignment[];
  bench: string[];
  metadata: Map<string, PlayerMetadata>;
  substitutionsRemaining: number;
  coachOverrideMode: boolean;
}

export interface SubstitutionFlow {
  playerOut: Player | null;
  playerIn: Player | null;
  preview: any | null;
  step: 'idle' | 'selecting-out' | 'selecting-in' | 'preview' | 'confirmed';
}

export function useMatchMode(initialGameState: GameState | null, allPlayers: Player[]) {
  const [matchState, setMatchState] = useState<MatchState>({
    currentTime: 0,
    lineup: initialGameState?.lineup || [],
    bench: initialGameState?.bench || [],
    metadata: new Map(),
    substitutionsRemaining: 5,
    coachOverrideMode: false,
  });

  const [substitutionFlow, setSubstitutionFlow] = useState<SubstitutionFlow>({
    playerOut: null,
    playerIn: null,
    preview: null,
    step: 'idle',
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize metadata for all players
  useEffect(() => {
    if (initialGameState && matchState.metadata.size === 0) {
      const newMetadata = new Map<string, PlayerMetadata>();

      // Initialize lineup players
      initialGameState.lineup.forEach((assignment) => {
        newMetadata.set(assignment.playerId, {
          playerId: assignment.playerId,
          minutesPlayed: 0,
          bookings: [],
          notes: '',
          fatigueLevel: 0,
        });
      });

      // Initialize bench players
      initialGameState.bench.forEach((playerId) => {
        newMetadata.set(playerId, {
          playerId,
          minutesPlayed: 0,
          bookings: [],
          notes: '',
          fatigueLevel: 0,
        });
      });

      setMatchState((prev) => ({ ...prev, metadata: newMetadata }));
    }
  }, [initialGameState, matchState.metadata.size]);

  // Timer effect - increment time every minute
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setMatchState((prev) => {
        const newMetadata = new Map(prev.metadata);

        // Increment minutes played for lineup players
        prev.lineup.forEach((assignment) => {
          const meta = newMetadata.get(assignment.playerId);
          if (meta) {
            newMetadata.set(assignment.playerId, {
              ...meta,
              minutesPlayed: meta.minutesPlayed + 1,
              fatigueLevel: Math.min(100, meta.fatigueLevel + 0.5), // Gradual fatigue
            });
          }
        });

        return {
          ...prev,
          currentTime: prev.currentTime + 1,
          metadata: newMetadata,
        };
      });
    }, 60000); // Real-time: 1 minute = 60000ms (for demo, could use 1000ms)

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Start match timer
  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  // Pause match timer
  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  // Reset match timer
  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setMatchState((prev) => ({ ...prev, currentTime: 0 }));
  }, []);

  // Toggle coach override mode
  const toggleCoachOverride = useCallback(() => {
    setMatchState((prev) => ({
      ...prev,
      coachOverrideMode: !prev.coachOverrideMode,
    }));
  }, []);

  // Start substitution: select player out
  const selectPlayerOut = useCallback((player: Player) => {
    setSubstitutionFlow({
      playerOut: player,
      playerIn: null,
      preview: null,
      step: 'selecting-in',
    });
  }, []);

  // Select player in and generate preview
  const selectPlayerIn = useCallback((player: Player) => {
    if (!substitutionFlow.playerOut) return;

    if (matchState.coachOverrideMode) {
      // In coach override mode, don't optimize - just do direct swap
      setSubstitutionFlow((prev) => ({
        ...prev,
        playerIn: player,
        preview: null,
        step: 'preview',
      }));
    } else {
      // Use optimizer
      const preview = optimizeSubstitution(
        matchState.lineup,
        substitutionFlow.playerOut,
        player,
        allPlayers
      );

      setSubstitutionFlow((prev) => ({
        ...prev,
        playerIn: player,
        preview,
        step: 'preview',
      }));
    }
  }, [substitutionFlow.playerOut, matchState.lineup, matchState.coachOverrideMode, allPlayers]);

  // Confirm substitution
  const confirmSubstitution = useCallback(() => {
    if (!substitutionFlow.playerOut || !substitutionFlow.playerIn) return;

    setMatchState((prev) => {
      const newMetadata = new Map(prev.metadata);

      // Update metadata for players involved
      const outMeta = newMetadata.get(substitutionFlow.playerOut!.id);
      const inMeta = newMetadata.get(substitutionFlow.playerIn!.id);

      if (outMeta) {
        newMetadata.set(substitutionFlow.playerOut!.id, {
          ...outMeta,
          lastSubstitutionTime: prev.currentTime,
        });
      }

      if (inMeta) {
        newMetadata.set(substitutionFlow.playerIn!.id, {
          ...inMeta,
          lastSubstitutionTime: prev.currentTime,
        });
      }

      let newLineup: PlayerAssignment[];
      let newBench: string[];

      if (matchState.coachOverrideMode && substitutionFlow.playerOut) {
        // Direct swap - maintain position
        const outPosition = prev.lineup.find(
          (a) => a.playerId === substitutionFlow.playerOut!.id
        )?.position;

        newLineup = prev.lineup.map((assignment) =>
          assignment.playerId === substitutionFlow.playerOut!.id
            ? { playerId: substitutionFlow.playerIn!.id, position: outPosition || assignment.position }
            : assignment
        );

        newBench = [
          ...prev.bench.filter((id) => id !== substitutionFlow.playerIn!.id),
          substitutionFlow.playerOut!.id,
        ];
      } else if (substitutionFlow.preview) {
        // Use optimized lineup
        newLineup = substitutionFlow.preview.newLineup;
        newBench = [
          ...prev.bench.filter((id) => id !== substitutionFlow.playerIn!.id),
          substitutionFlow.playerOut!.id,
        ];
      } else {
        return prev;
      }

      return {
        ...prev,
        lineup: newLineup,
        bench: newBench,
        metadata: newMetadata,
        substitutionsRemaining: prev.substitutionsRemaining - 1,
      };
    });

    // Reset substitution flow
    setSubstitutionFlow({
      playerOut: null,
      playerIn: null,
      preview: null,
      step: 'idle',
    });
  }, [substitutionFlow, matchState.coachOverrideMode]);

  // Cancel substitution
  const cancelSubstitution = useCallback(() => {
    setSubstitutionFlow({
      playerOut: null,
      playerIn: null,
      preview: null,
      step: 'idle',
    });
  }, []);

  // Update player metadata
  const updatePlayerMetadata = useCallback((playerId: string, updates: Partial<PlayerMetadata>) => {
    setMatchState((prev) => {
      const newMetadata = new Map(prev.metadata);
      const current = newMetadata.get(playerId);

      if (current) {
        newMetadata.set(playerId, { ...current, ...updates });
      }

      return { ...prev, metadata: newMetadata };
    });
  }, []);

  // Add booking (yellow/red card)
  const addBooking = useCallback((playerId: string, cardType: 'yellow' | 'red') => {
    setMatchState((prev) => {
      const newMetadata = new Map(prev.metadata);
      const meta = newMetadata.get(playerId);

      if (meta) {
        newMetadata.set(playerId, {
          ...meta,
          bookings: [...meta.bookings, cardType],
        });
      }

      return { ...prev, metadata: newMetadata };
    });
  }, []);

  // Manual lineup adjustment (drag-and-drop)
  const adjustLineup = useCallback((newLineup: PlayerAssignment[]) => {
    setMatchState((prev) => ({
      ...prev,
      lineup: newLineup,
    }));
  }, []);

  // Get current lineup score
  const getCurrentScore = useCallback(() => {
    return calculateLineupScore(matchState.lineup, allPlayers);
  }, [matchState.lineup, allPlayers]);

  // Get player by ID
  const getPlayerById = useCallback((playerId: string): Player | undefined => {
    return allPlayers.find((p) => p.id === playerId);
  }, [allPlayers]);

  return {
    matchState,
    substitutionFlow,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    toggleCoachOverride,
    selectPlayerOut,
    selectPlayerIn,
    confirmSubstitution,
    cancelSubstitution,
    updatePlayerMetadata,
    addBooking,
    adjustLineup,
    getCurrentScore,
    getPlayerById,
  };
}
