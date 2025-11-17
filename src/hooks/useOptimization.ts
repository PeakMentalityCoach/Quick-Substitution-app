import { useState, useCallback } from 'react';
import type {
  Player,
  LineupPosition,
  OptimizationConfig,
  OptimizationResult
} from '../types';
import { optimizeLineup, getDefaultFormationWeights } from '../utils/optimizer';
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

interface UseOptimizationOptions {
  useNotes?: boolean;
  considerFatigue?: boolean;
}

export function useOptimization(options: UseOptimizationOptions = {}) {
  const settingsContext = useContext(SettingsContext);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);

  const optimize = useCallback(
    async (
      players: Player[],
      positions: LineupPosition[]
    ): Promise<OptimizationResult> => {
      setIsOptimizing(true);

      try {
        // Use settings context if available, otherwise use options
        const useNotes = settingsContext
          ? settingsContext.settings.useNotesForOptimization
          : options.useNotes ?? true;

        const config: OptimizationConfig = {
          useNotes,
          prioritizePositions: [],
          considerFatigue: options.considerFatigue ?? true,
          formationWeights: getDefaultFormationWeights()
        };

        // Simulate async operation (can be useful for future enhancements)
        await new Promise(resolve => setTimeout(resolve, 100));

        const result = optimizeLineup(players, positions, config);
        setLastResult(result);

        return result;
      } finally {
        setIsOptimizing(false);
      }
    },
    [options.useNotes, options.considerFatigue, settingsContext]
  );

  const optimizeWithConfig = useCallback(
    async (
      players: Player[],
      positions: LineupPosition[],
      config: OptimizationConfig
    ): Promise<OptimizationResult> => {
      setIsOptimizing(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = optimizeLineup(players, positions, config);
        setLastResult(result);
        return result;
      } finally {
        setIsOptimizing(false);
      }
    },
    []
  );

  return {
    optimize,
    optimizeWithConfig,
    isOptimizing,
    lastResult
  };
}
