import { Player, SubstitutionPreview } from '../types';
import { ArrowRight, X, Check, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TabletSubstitutionFlowProps {
  playerOut: Player | null;
  playerIn: Player | null;
  preview: SubstitutionPreview | null;
  step: 'idle' | 'selecting-out' | 'selecting-in' | 'preview' | 'confirmed';
  onConfirm: () => void;
  onCancel: () => void;
  coachOverrideMode: boolean;
  substitutionsRemaining: number;
  allPlayers: Player[];
}

export default function TabletSubstitutionFlow({
  playerOut,
  playerIn,
  preview,
  step,
  onConfirm,
  onCancel,
  coachOverrideMode,
  substitutionsRemaining,
  allPlayers,
}: TabletSubstitutionFlowProps) {
  // Don't show anything if idle or just selecting
  if (step === 'idle' || step === 'selecting-out') {
    return null;
  }

  // Show instruction when selecting-in
  if (step === 'selecting-in' && playerOut) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-2xl animate-slideInUp">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {playerOut.jerseyNumber}
            </div>
            <div>
              <p className="text-sm opacity-90">Substituting out</p>
              <p className="font-bold text-lg">{playerOut.name}</p>
            </div>
            <ArrowRight size={32} className="mx-4" />
            <div>
              <p className="text-sm opacity-90">Select replacement from bench</p>
              <p className="font-bold">Tap a player to continue</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="tablet-button bg-white text-blue-600 hover:bg-gray-100"
          >
            <X size={20} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show preview modal
  if (step === 'preview' && playerOut && playerIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div className="tablet-sub-preview w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Substitution Preview</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Substitutions Remaining</p>
              <p className="text-2xl font-bold text-green-600">{substitutionsRemaining - 1}</p>
            </div>
          </div>

          {/* Players involved */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            {/* Player OUT */}
            <div className="tablet-player-card tablet-player-card-out">
              <div className="flex flex-col items-center text-center">
                <div className="tablet-jersey-badge mb-2">{playerOut.jerseyNumber}</div>
                <h3 className="font-bold text-lg text-gray-800">{playerOut.name}</h3>
                <p className="text-sm text-red-600 font-semibold mt-1">OUT</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight size={48} className="text-gray-400" />
            </div>

            {/* Player IN */}
            <div className="tablet-player-card tablet-player-card-in">
              <div className="flex flex-col items-center text-center">
                <div className="tablet-jersey-badge mb-2">{playerIn.jerseyNumber}</div>
                <h3 className="font-bold text-lg text-gray-800">{playerIn.name}</h3>
                <p className="text-sm text-green-600 font-semibold mt-1">IN</p>
              </div>
            </div>
          </div>

          {/* Score impact */}
          {preview && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Score</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {preview.oldScore.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight size={24} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">New Score</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      {preview.newScore.toFixed(1)}
                    </p>
                    {preview.scoreDelta !== 0 && (
                      <span
                        className={`text-lg font-bold flex items-center ${preview.scoreDelta > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          }`}
                      >
                        {preview.scoreDelta > 0 ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                        {preview.scoreDelta > 0 ? '+' : ''}
                        {preview.scoreDelta.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Position changes */}
          {preview && preview.changes.length > 0 && !coachOverrideMode && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                Position Changes ({preview.changes.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.changes.map((change) => {
                  const player = allPlayers.find((p) => p.id === change.playerId);
                  if (!player) return null;

                  const isNewPlayer = change.playerId === playerIn.id;

                  return (
                    <div
                      key={change.playerId}
                      className={`flex items-center gap-3 p-3 rounded-lg ${isNewPlayer
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50'
                        }`}
                    >
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {player.jerseyNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{player.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          {change.oldPosition ? (
                            <>
                              <span className="text-gray-600">{change.oldPosition}</span>
                              <ArrowRight size={14} className="text-gray-400" />
                              <span className="text-green-600 font-semibold">
                                {change.newPosition}
                              </span>
                            </>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              {change.newPosition}
                            </span>
                          )}
                        </div>
                      </div>
                      {isNewPlayer && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coach override mode notice */}
          {coachOverrideMode && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">
                    Coach Override Mode Active
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {playerIn.name} will directly replace {playerOut.name} in their current
                    position without automatic optimization. Other players will not be moved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="flex-1 tablet-button tablet-button-outline flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 tablet-button tablet-button-primary flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirm Substitution
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
