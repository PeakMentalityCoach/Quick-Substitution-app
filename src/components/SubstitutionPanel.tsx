import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { usePlayers } from '../hooks/usePlayers';
import { useOptimization } from '../hooks/useOptimization';
import { calculateSubstitutionImpact, getDefaultFormationWeights } from '../utils/optimizer';
import type { Player } from '../types';

export function SubstitutionPanel() {
  const { gameState, makeSubstitution, updateMatchTime } = useGameState();
  const { players } = usePlayers();
  const [playerOut, setPlayerOut] = useState<Player | null>(null);
  const [playerIn, setPlayerIn] = useState<Player | null>(null);
  const [currentMinute, setCurrentMinute] = useState(gameState.matchTime);

  const canSubstitute = gameState.substitutionsUsed < gameState.maxSubstitutions;

  const handleMakeSubstitution = () => {
    if (!playerOut || !playerIn || !canSubstitute) return;

    makeSubstitution(playerOut.id, playerIn.id, currentMinute);
    setPlayerOut(null);
    setPlayerIn(null);
  };

  // Calculate impact if both players selected
  let impact = null;
  if (playerOut && playerIn) {
    impact = calculateSubstitutionImpact(
      gameState.startingLineup,
      playerOut,
      playerIn,
      {
        useNotes: true,
        prioritizePositions: [],
        considerFatigue: true,
        formationWeights: getDefaultFormationWeights()
      }
    );
  }

  const startingPlayers = gameState.startingLineup
    .filter(lp => lp.player !== null)
    .map(lp => lp.player!);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Substitutions
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Substitutions Used
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {gameState.substitutionsUsed} / {gameState.maxSubstitutions}
          </p>
        </div>
      </div>

      {!canSubstitute && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Maximum substitutions reached
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Match Minute
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={currentMinute}
            onChange={(e) => setCurrentMinute(parseInt(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Out */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Player Out
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {startingPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setPlayerOut(player)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    playerOut?.id === player.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-300 bg-white dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fatigue: {player.fatigueLevel}%
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="w-12 h-12 text-gray-400" />
          </div>

          {/* Player In */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Player In
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {gameState.substitutes.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setPlayerIn(player)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    playerIn?.id === player.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-300 bg-white dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {player.position} - Fatigue: {player.fatigueLevel}%
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {impact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg"
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Substitution Impact
            </h4>
            <div className="flex items-center justify-between">
              <p className="text-blue-800 dark:text-blue-200">
                Score Change:
              </p>
              <p className={`text-2xl font-bold ${
                impact.scoreDelta > 0
                  ? 'text-green-600'
                  : impact.scoreDelta < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {impact.scoreDelta > 0 && '+'}{impact.scoreDelta.toFixed(1)}
              </p>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleMakeSubstitution}
          disabled={!playerOut || !playerIn || !canSubstitute}
          className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Make Substitution
        </button>
      </div>

      {/* Substitution History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Substitution History
        </h2>
        <div className="space-y-2">
          {gameState.matchEvents
            .filter(e => e.type === 'substitution')
            .reverse()
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="text-gray-900 dark:text-white">
                  {event.description}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {event.minute}'
                </span>
              </div>
            ))}
          {gameState.matchEvents.filter(e => e.type === 'substitution').length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No substitutions made yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
