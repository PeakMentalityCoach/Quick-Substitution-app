import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

export function PlayerCard({
  player,
  onEdit,
  onDelete,
  onClick,
  showActions = true
}: PlayerCardProps) {
  const avgAttribute =
    Object.values(player.attributes).reduce((sum, val) => sum + val, 0) / 8;

  const getAvgColor = (avg: number) => {
    if (avg >= 16) return 'text-green-600';
    if (avg >= 12) return 'text-blue-600';
    if (avg >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: showActions ? 1.02 : 1 }}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
        onClick ? 'cursor-pointer' : ''
      } ${!player.isAvailable ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {player.number}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {player.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {player.position}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">PAC</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {player.attributes.pace}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">SHO</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {player.attributes.shooting}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">PAS</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {player.attributes.passing}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">DEF</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {player.attributes.defending}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${getAvgColor(avgAttribute)}`}>
          AVG: {avgAttribute.toFixed(1)}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Fatigue: {player.fatigueLevel}%
        </span>
      </div>

      {!player.isAvailable && (
        <div className="mt-2 flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Unavailable</span>
        </div>
      )}

      {player.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {player.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
