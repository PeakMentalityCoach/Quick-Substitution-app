import React, { useState } from 'react';
import { Player, Position, PlayerNote } from '../types';
import { ALL_POSITIONS, getPositionLabel } from '../utils/helpers';
import { X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotesModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerId: string, notes: PlayerNote) => void;
}

export default function NotesModal({ player, isOpen, onClose, onSave }: NotesModalProps) {
  const [notes, setNotes] = useState<PlayerNote>(
    player.notes || {
      isInjured: false,
      minutesLimit: undefined,
      safePositions: undefined,
      excludeFromOptimizer: false,
      notes: '',
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(player.id, notes);
    onClose();
  };

  const toggleSafePosition = (position: Position) => {
    const current = notes.safePositions || [];
    setNotes({
      ...notes,
      safePositions: current.includes(position)
        ? current.filter(p => p !== position)
        : [...current, position],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Player Notes: {player.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Player Notes</p>
              <p>
                These notes help the optimizer make better decisions. Set injury status, minutes
                limits, and position restrictions to ensure safe and effective substitutions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="injured"
                checked={notes.isInjured}
                onChange={(e) => setNotes({ ...notes, isInjured: e.target.checked })}
                className="w-4 h-4 text-pmc-primary border-gray-300 rounded focus:ring-pmc-accent"
              />
              <label htmlFor="injured" className="font-medium text-gray-900">
                Player is injured or unavailable
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="exclude"
                checked={notes.excludeFromOptimizer}
                onChange={(e) => setNotes({ ...notes, excludeFromOptimizer: e.target.checked })}
                className="w-4 h-4 text-pmc-primary border-gray-300 rounded focus:ring-pmc-accent"
              />
              <label htmlFor="exclude" className="font-medium text-gray-900">
                Exclude from auto-optimizer (manual control only)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minutes Limit (optional)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={notes.minutesLimit || ''}
                onChange={(e) =>
                  setNotes({
                    ...notes,
                    minutesLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optimizer will suggest substitution when this limit is reached
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safe Positions (optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select positions where this player should be allowed to play. Leave empty for no
                restrictions.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALL_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => toggleSafePosition(pos)}
                    className={`
                      px-3 py-2 text-sm rounded border transition-colors
                      ${
                        (notes.safePositions || []).includes(pos)
                          ? 'bg-pmc-primary text-white border-pmc-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-pmc-primary'
                      }
                    `}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes.notes || ''}
                onChange={(e) => setNotes({ ...notes, notes: e.target.value })}
                rows={4}
                placeholder="Any additional notes about this player..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Save Notes
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
