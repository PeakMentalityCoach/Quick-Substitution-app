import { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { Player, PositionRating, STANDARD_POSITIONS } from '../types';
import { interpretPlayerNote, getNoteSeverity } from '../utils/noteInterpreter';
import { PMC_COLORS } from '../constants/brand';

interface PlayerEditorProps {
  player?: Player;
  onSave: (player: Player) => void;
  onCancel: () => void;
}

export default function PlayerEditor({ player, onSave, onCancel }: PlayerEditorProps) {
  const [name, setName] = useState(player?.name || '');
  const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber || 1);
  const [positions, setPositions] = useState<string[]>(player?.positions || []);
  const [ratings, setRatings] = useState<PositionRating[]>(player?.ratings || []);
  const [note, setNote] = useState(player?.note || '');
  const [noteAffectsOptimization, setNoteAffectsOptimization] = useState(
    player?.noteAffectsOptimization ?? false
  );

  // Update ratings when positions change
  useEffect(() => {
    const newRatings = positions.map((position) => {
      const existingRating = ratings.find((r) => r.position === position);
      return existingRating || { position, rating: 5 };
    });
    setRatings(newRatings);
  }, [positions]);

  const togglePosition = (position: string) => {
    if (positions.includes(position)) {
      setPositions(positions.filter((p) => p !== position));
    } else {
      setPositions([...positions, position]);
    }
  };

  const updateRating = (position: string, rating: number) => {
    setRatings(
      ratings.map((r) => (r.position === position ? { ...r, rating } : r))
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Player name is required');
      return;
    }

    if (positions.length === 0) {
      alert('Please select at least one position');
      return;
    }

    const newPlayer: Player = {
      id: player?.id || `player-${Date.now()}`,
      name: name.trim(),
      jerseyNumber,
      positions,
      ratings: ratings.filter((r) => positions.includes(r.position)),
      note: note.trim(),
      noteAffectsOptimization,
    };

    onSave(newPlayer);
  };

  const noteInterpretation = interpretPlayerNote(note);
  const noteSeverity = getNoteSeverity(note);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {player ? 'Edit Player' : 'Add New Player'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jersey Number *
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Positions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Positions *
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {STANDARD_POSITIONS.map((position) => {
                const isSelected = positions.includes(position);
                return (
                  <button
                    key={position}
                    onClick={() => togglePosition(position)}
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {position}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ratings */}
          {positions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Ratings (1-10)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {positions.map((position) => {
                  const rating = ratings.find((r) => r.position === position)?.rating || 5;
                  return (
                    <div key={position} className="flex items-center gap-2">
                      <span className="w-12 font-medium text-gray-700">{position}:</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={rating}
                        onChange={(e) =>
                          updateRating(position, parseInt(e.target.value))
                        }
                        className="flex-1"
                        style={{ accentColor: PMC_COLORS.primary }}
                      />
                      <span className="w-8 text-center font-bold text-green-600">
                        {rating}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              placeholder="e.g., Minor ankle injury, max 60 minutes, no GK, recovering from strain..."
            />

            {/* Note Affects Optimization Toggle */}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                id="noteAffects"
                checked={noteAffectsOptimization}
                onChange={(e) => setNoteAffectsOptimization(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                style={{ accentColor: PMC_COLORS.primary }}
              />
              <label htmlFor="noteAffects" className="font-medium text-gray-700">
                Allow note to influence optimization
              </label>
            </div>

            {/* Note Interpretation Display */}
            {note && noteAffectsOptimization && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  noteSeverity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : noteSeverity === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {noteSeverity === 'critical' ? (
                    <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  ) : noteSeverity === 'warning' ? (
                    <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                  ) : (
                    <Info className="text-blue-600 mt-0.5" size={20} />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">
                      Note Interpretation:
                    </h4>
                    {noteInterpretation.warningMessage && (
                      <p className="text-sm mb-2">
                        {noteInterpretation.warningMessage}
                      </p>
                    )}
                    <ul className="text-sm space-y-1">
                      {noteInterpretation.ratingPenalty > 0 && (
                        <li>• Rating penalty: -{noteInterpretation.ratingPenalty}</li>
                      )}
                      {noteInterpretation.forbiddenPositions.length > 0 && (
                        <li>
                          • Forbidden positions:{' '}
                          {noteInterpretation.forbiddenPositions.join(', ')}
                        </li>
                      )}
                      {noteInterpretation.mustSubOutAtMinute && (
                        <li>
                          • Must substitute at minute{' '}
                          {noteInterpretation.mustSubOutAtMinute}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: PMC_COLORS.primary }}
          >
            {player ? 'Save Changes' : 'Add Player'}
          </button>
        </div>
      </div>
    </div>
  );
}
