import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Users } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { usePlayers } from '../hooks/usePlayers';
import { PitchCanvas } from './PitchCanvas';

export function MatchDayDashboard() {
  const { gameState, startMatch, endMatch, updateMatchTime, updateScore } = useGameState();
  const { players } = usePlayers();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && gameState.isMatchActive) {
      interval = setInterval(() => {
        updateMatchTime(gameState.matchTime + 1);
      }, 60000); // Increment every minute in real-time (adjust for faster testing)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, gameState.isMatchActive, gameState.matchTime, updateMatchTime]);

  const handleStartMatch = () => {
    if (!gameState.isMatchActive) {
      startMatch();
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleEndMatch = () => {
    endMatch();
    setIsTimerRunning(false);
  };

  const handleResetMatch = () => {
    updateMatchTime(0);
    updateScore(0, 0);
    setIsTimerRunning(false);
  };

  const startingPlayers = gameState.startingLineup.filter(lp => lp.player !== null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Match Day Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {gameState.matchTime}'
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-3 gap-4 text-white">
          <div className="text-center">
            <p className="text-sm mb-2">HOME</p>
            <input
              type="number"
              min="0"
              value={gameState.currentScore.home}
              onChange={(e) => updateScore(parseInt(e.target.value), gameState.currentScore.away)}
              className="w-20 h-20 bg-white bg-opacity-20 rounded-lg text-center text-4xl font-bold border-2 border-white"
            />
          </div>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold">-</span>
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">AWAY</p>
            <input
              type="number"
              min="0"
              value={gameState.currentScore.away}
              onChange={(e) => updateScore(gameState.currentScore.home, parseInt(e.target.value))}
              className="w-20 h-20 bg-white bg-opacity-20 rounded-lg text-center text-4xl font-bold border-2 border-white"
            />
          </div>
        </div>
      </div>

      {/* Match Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleStartMatch}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetMatch}
            className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          {gameState.isMatchActive && (
            <button
              onClick={handleEndMatch}
              className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <span>End Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Pitch View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Formation
        </h2>
        {startingPlayers.length === 11 ? (
          <PitchCanvas lineup={gameState.startingLineup} showNames />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <p>Set up your starting lineup first</p>
          </div>
        )}
      </div>

      {/* Match Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Substitutions
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {gameState.substitutionsUsed} / {gameState.maxSubstitutions}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Match Events
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {gameState.matchEvents.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Formation
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {gameState.formation}
          </p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Match Events
        </h2>
        <div className="space-y-2">
          {gameState.matchEvents.slice(-10).reverse().map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm font-semibold">
                  {event.minute}'
                </span>
                <p className="text-gray-900 dark:text-white">
                  {event.description}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {event.type}
              </span>
            </motion.div>
          ))}
          {gameState.matchEvents.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No events recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
