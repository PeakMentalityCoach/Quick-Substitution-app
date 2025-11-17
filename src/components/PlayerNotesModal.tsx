import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, MapPin, Settings } from 'lucide-react';
import { Player, PlayerNotes, STANDARD_POSITIONS } from '../types';

interface PlayerNotesModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: PlayerNotes) => void;
}

export default function PlayerNotesModal({ player, isOpen, onClose, onSave }: PlayerNotesModalProps) {
  const [notes, setNotes] = useState<PlayerNotes>({
    hasInjury: false,
    injurySeverity: undefined,
    minutesRestriction: undefined,
    safePositions: [...player.positions],
    allowOptimizerOverride: false,
  });

  useEffect(() => {
    if (player.notes) {
      setNotes(player.notes);
    } else {
      setNotes({
        hasInjury: false,
        injurySeverity: undefined,
        minutesRestriction: undefined,
        safePositions: [...player.positions],
        allowOptimizerOverride: false,
      });
    }
  }, [player]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const togglePosition = (position: string) => {
    setNotes(prev => {
      const safePositions = prev.safePositions.includes(position)
        ? prev.safePositions.filter(p => p !== position)
        : [...prev.safePositions, position];
      return { ...prev, safePositions };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Player Notes</h2>
                  <p className="text-pmc-green-100 text-sm mt-1">
                    {player.name} #{player.jerseyNumber}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-pmc-green-500 transition-colors"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
                <div className="space-y-6">
                  {/* Injury Status */}
                  <div className="bg-pmc-gray-50 rounded-xl p-5 border border-pmc-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="text-pmc-gold-500" size={24} />
                      <h3 className="text-lg font-semibold text-pmc-gray-800">Injury Status</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notes.hasInjury}
                          onChange={(e) => setNotes({ ...notes, hasInjury: e.target.checked })}
                          className="w-5 h-5 rounded border-pmc-gray-300 text-pmc-green-600 focus:ring-pmc-green-500"
                        />
                        <span className="font-medium text-pmc-gray-700">Player has injury concern</span>
                      </label>

                      {notes.hasInjury && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 space-y-2"
                        >
                          <label className="block text-sm font-medium text-pmc-gray-700">Severity</label>
                          <div className="flex gap-2">
                            {(['minor', 'moderate', 'severe'] as const).map((severity) => (
                              <button
                                key={severity}
                                onClick={() => setNotes({ ...notes, injurySeverity: severity })}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                  notes.injurySeverity === severity
                                    ? 'bg-pmc-green-600 text-white shadow-md'
                                    : 'bg-white border border-pmc-gray-300 text-pmc-gray-700 hover:border-pmc-green-500'
                                }`}
                              >
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Minutes Restriction */}
                  <div className="bg-pmc-gray-50 rounded-xl p-5 border border-pmc-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="text-pmc-gold-500" size={24} />
                      <h3 className="text-lg font-semibold text-pmc-gray-800">Minutes Restriction</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-pmc-gray-700">
                        Maximum minutes allowed (leave empty for no restriction)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={notes.minutesRestriction || ''}
                        onChange={(e) => setNotes({ ...notes, minutesRestriction: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="e.g., 60"
                        className="w-full px-4 py-2 border border-pmc-gray-300 rounded-lg focus:ring-2 focus:ring-pmc-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Safe Positions */}
                  <div className="bg-pmc-gray-50 rounded-xl p-5 border border-pmc-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="text-pmc-gold-500" size={24} />
                      <h3 className="text-lg font-semibold text-pmc-gray-800">Safe Positions</h3>
                    </div>
                    <p className="text-sm text-pmc-gray-600 mb-4">
                      Select positions where this player can safely play
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {STANDARD_POSITIONS.map((position) => (
                        <button
                          key={position}
                          onClick={() => togglePosition(position)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                            notes.safePositions.includes(position)
                              ? 'bg-pmc-green-600 text-white shadow-md'
                              : 'bg-white border border-pmc-gray-300 text-pmc-gray-700 hover:border-pmc-green-500'
                          }`}
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optimizer Override */}
                  <div className="bg-pmc-gray-50 rounded-xl p-5 border border-pmc-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="text-pmc-gold-500" size={24} />
                      <h3 className="text-lg font-semibold text-pmc-gray-800">Optimizer Settings</h3>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notes.allowOptimizerOverride}
                        onChange={(e) => setNotes({ ...notes, allowOptimizerOverride: e.target.checked })}
                        className="w-5 h-5 rounded border-pmc-gray-300 text-pmc-green-600 focus:ring-pmc-green-500"
                      />
                      <div>
                        <span className="font-medium text-pmc-gray-700 block">
                          Allow optimizer to override restrictions
                        </span>
                        <span className="text-sm text-pmc-gray-500">
                          If enabled, optimizer can suggest positions outside safe positions when necessary
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-pmc-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-pmc-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-medium text-pmc-gray-700 bg-white border border-pmc-gray-300 hover:bg-pmc-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 hover:from-pmc-green-700 hover:to-pmc-green-600 shadow-lg shadow-pmc-green-200 transition-all"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
