import { X, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SubstitutionPreview, Player } from '../types';

interface SubstitutionPreviewModalProps {
  preview: SubstitutionPreview;
  squad: Player[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SubstitutionPreviewModal({
  preview,
  squad,
  onConfirm,
  onCancel,
}: SubstitutionPreviewModalProps) {
  const getPlayerName = (playerId: string) => {
    const player = squad.find((p) => p.id === playerId);
    return player ? `#${player.jerseyNumber} ${player.name}` : 'Unknown';
  };

  const scoreDeltaColor =
    preview.scoreDelta > 0
      ? 'text-green-600'
      : preview.scoreDelta < 0
      ? 'text-red-600'
      : 'text-gray-600';

  const ScoreTrendIcon =
    preview.scoreDelta > 0
      ? TrendingUp
      : preview.scoreDelta < 0
      ? TrendingDown
      : Minus;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Substitution Preview</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Substitution Summary */}
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">OUT</div>
                <div className="font-bold text-lg text-red-600">
                  #{preview.playerOut.jerseyNumber} {preview.playerOut.name}
                </div>
              </div>

              <ArrowRight size={32} className="text-gray-400" />

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">IN</div>
                <div className="font-bold text-lg text-green-600">
                  #{preview.playerIn.jerseyNumber} {preview.playerIn.name}
                </div>
              </div>
            </div>
          </div>

          {/* Score Comparison */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Current Score</div>
              <div className="text-3xl font-bold text-gray-800">{preview.oldScore}</div>
            </div>

            <div className={`bg-gray-50 rounded-lg p-4 text-center ${scoreDeltaColor}`}>
              <div className="text-sm text-gray-600 mb-1">Change</div>
              <div className="text-3xl font-bold flex items-center justify-center gap-2">
                <ScoreTrendIcon size={28} />
                {preview.scoreDelta > 0 ? '+' : ''}
                {preview.scoreDelta}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">New Score</div>
              <div className="text-3xl font-bold text-green-700">{preview.newScore}</div>
            </div>
          </div>

          {/* Position Changes */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              Position Changes ({preview.changes.length})
            </h3>

            {preview.changes.length === 0 ? (
              <p className="text-gray-600 text-sm">No position changes required</p>
            ) : (
              <div className="space-y-2">
                {preview.changes.map((change, index) => {
                  const isNewPlayer = change.playerId === preview.playerIn.id;
                  const isOutPlayer = change.playerId === preview.playerOut.id;

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isNewPlayer
                          ? 'bg-green-50 border-2 border-green-200'
                          : isOutPlayer
                          ? 'bg-red-50 border-2 border-red-200'
                          : change.oldPosition !== change.newPosition
                          ? 'bg-yellow-50 border-2 border-yellow-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          {getPlayerName(change.playerId)}
                        </span>

                        {isNewPlayer && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {change.oldPosition && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-medium">
                            {change.oldPosition}
                          </span>
                        )}

                        {change.oldPosition && change.oldPosition !== change.newPosition && (
                          <ArrowRight size={16} className="text-gray-400" />
                        )}

                        <span
                          className={`px-3 py-1 rounded font-medium ${
                            isNewPlayer
                              ? 'bg-green-600 text-white'
                              : change.oldPosition !== change.newPosition
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {change.newPosition}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning if score decreases */}
          {preview.scoreDelta < 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-red-600 font-bold text-lg">!</div>
                <div>
                  <h4 className="font-bold text-red-800 mb-1">Warning</h4>
                  <p className="text-red-700 text-sm">
                    This substitution will decrease the overall team rating by{' '}
                    {Math.abs(preview.scoreDelta)} points. Consider if this tactical change is
                    necessary.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm Substitution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
