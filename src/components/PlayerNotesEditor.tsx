import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertCircle } from 'lucide-react';
import type { Player } from '../types';
import { useNotesInterpreter } from '../hooks/useNotesInterpreter';

interface PlayerNotesEditorProps {
  player: Player;
  onSave: (notes: string) => void;
  onCancel: () => void;
}

export function PlayerNotesEditor({ player, onSave, onCancel }: PlayerNotesEditorProps) {
  const [notes, setNotes] = useState(player.notes);
  const { getPlayerInterpretation } = useNotesInterpreter([{ ...player, notes }]);

  const interpretation = getPlayerInterpretation(player.id);

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Notes - {player.name}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add notes about this player's strengths, weaknesses, preferred positions..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use keywords like "excellent", "great", "weak at", "avoid", etc. along with position names.
            </p>
          </div>

          {interpretation && interpretation.modifiers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Interpreted Modifiers:
              </h3>
              <ul className="space-y-1 text-sm">
                {interpretation.modifiers.map((mod, i) => (
                  <li key={i} className="text-blue-800 dark:text-blue-200">
                    {mod.type === 'boost' && '+ '}
                    {mod.type === 'penalty' && '- '}
                    {mod.type === 'restriction' && '! '}
                    {mod.reason}
                    {mod.position && ` (${mod.position})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interpretation && interpretation.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Warnings:
                </h3>
              </div>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                {interpretation.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            <span>Save Notes</span>
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
