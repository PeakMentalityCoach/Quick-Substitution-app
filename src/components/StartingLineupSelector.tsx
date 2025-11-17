import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useGameState } from '../hooks/useGameState';
import { useOptimization } from '../hooks/useOptimization';
import { PlayerCard } from './PlayerCard';
import { PitchCanvas } from './PitchCanvas';
import { FormationGrid } from './FormationGrid';
import type { Formation, LineupPosition } from '../types';
import { getFormationPositions } from '../utils/formations';

export function StartingLineupSelector() {
  const { players } = usePlayers();
  const { gameState, setFormation, setStartingLineup } = useGameState();
  const { optimize, isOptimizing } = useOptimization();
  const [selectedFormation, setSelectedFormation] = useState<Formation>(gameState.formation);

  const availablePlayers = players.filter(p => p.isAvailable);

  const handleFormationChange = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormation(formation);
  };

  const handleOptimize = async () => {
    const positions = getFormationPositions(selectedFormation);
    const result = await optimize(availablePlayers, positions);

    if (result.lineup) {
      setStartingLineup(result.lineup);
    }
  };

  const selectedPlayers = gameState.startingLineup.filter(lp => lp.player !== null);
  const benchPlayers = availablePlayers.filter(
    p => !selectedPlayers.some(sp => sp.player?.id === p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Starting Lineup
        </h1>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isOptimizing ? 'Optimizing...' : 'AI Optimize'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Formation
        </h2>
        <FormationGrid
          selectedFormation={selectedFormation}
          onFormationChange={handleFormationChange}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Field View
        </h2>
        {selectedPlayers.length === 11 ? (
          <PitchCanvas lineup={gameState.startingLineup} showNames />
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Select 11 players or use AI Optimize to generate a lineup</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Starting XI ({selectedPlayers.length}/11)
          </h2>
          <div className="space-y-3">
            {selectedPlayers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No players selected yet
              </p>
            ) : (
              selectedPlayers.map((lp) => (
                lp.player && (
                  <div key={lp.player.id} className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold">
                      {lp.position}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {lp.player.name} (#{lp.player.number})
                    </span>
                  </div>
                )
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Players ({benchPlayers.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {benchPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.number}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {player.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {player.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
