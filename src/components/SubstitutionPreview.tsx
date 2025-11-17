import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { SubstitutionPreview as SubPreviewType, Player } from "../types";
import { interpretPlayerNote, getNoteSeverity } from '../utils/noteInterpreter';
import { PMC_COLORS } from '../constants/brand';

interface SubstitutionPreviewProps {
  preview: SubPreviewType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SubstitutionPreview({
  preview,
  onConfirm,
  onCancel,
}: SubstitutionPreviewProps) {
  const { playerOut, playerIn, changes, scoreDelta, oldScore, newScore } = preview;

  const playerInInterpretation = interpretPlayerNote(playerIn.note);
  const playerInSeverity = getNoteSeverity(playerIn.note);

    playerInSeverity !== 'none' ||
    changes.some((c) => {
      const player = c.playerId === playerIn.id ? playerIn : playerOut;
      return getNoteSeverity(player.note) !== 'none';
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div
            className="sticky top-0 text-white px-6 py-4 flex justify-between items-center"
            style={{ backgroundColor: PMC_COLORS.secondary }}
          >
            <h2 className="text-2xl font-bold">Substitution Preview</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Score Impact */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Score Impact</h3>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{oldScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-500 mt-1">Current Score</div>
                </div>

                <div className="flex justify-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                      scoreDelta > 0
                        ? 'bg-green-100 text-green-700'
                        : scoreDelta < 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {scoreDelta > 0 ? (
                      <TrendingUp size={20} />
                    ) : scoreDelta < 0 ? (
                      <TrendingDown size={20} />
                    ) : null}
                    <span>
                      {scoreDelta > 0 ? '+' : ''}
                      {scoreDelta.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: PMC_COLORS.primary }}
                  >
                    {newScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">New Score</div>
                </div>
              </div>
            </div>

            {/* Player Change */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Player Change</h3>
              <div className="flex items-center gap-4">
                <PlayerChangeCard player={playerOut} isOut={true} />
                <ArrowRight size={24} className="text-gray-400" />
                <PlayerChangeCard player={playerIn} isOut={false} />
              </div>
            </div>

            {/* Player In Notes/Warnings */}
            {playerInSeverity !== 'none' && playerIn.noteAffectsOptimization && (
              <div
                className={`p-4 rounded-lg ${
                  playerInSeverity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className={
                      playerInSeverity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }
                    size={20}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">
                      Warning for {playerIn.name}:
                    </h4>
                    {playerInInterpretation.warningMessage && (
                      <p className="text-sm mb-2">{playerInInterpretation.warningMessage}</p>
                    )}
                    {playerInInterpretation.forbiddenPositions.length > 0 && (
                      <p className="text-sm">
                        • Forbidden positions:{' '}
                        {playerInInterpretation.forbiddenPositions.join(', ')}
                      </p>
                    )}
                    {playerInInterpretation.ratingPenalty > 0 && (
                      <p className="text-sm">
                        • Rating penalty: -{playerInInterpretation.ratingPenalty}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Position Changes */}
            {changes.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  Position Changes ({changes.length})
                </h3>
                <div className="space-y-2">
                  {changes.map((change) => {
                    const player =
                      change.playerId === playerIn.id ? playerIn : playerOut;
                    return (
                      <div
                        key={change.playerId}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            #{player.jerseyNumber} {player.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">
                            {change.oldPosition || 'Bench'}
                          </span>
                          <ArrowRight size={16} className="text-gray-400" />
                          <span
                            className="font-medium"
                            style={{ color: PMC_COLORS.primary }}
                          >
                            {change.newPosition}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p>
                    The optimizer has recalculated the best positions for all players
                    based on their ratings and current note constraints.
                  </p>
                </div>
              </div>
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
              onClick={onConfirm}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: PMC_COLORS.primary }}
            >
              Confirm Substitution
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function PlayerChangeCard({ player, isOut }: { player: Player; isOut: boolean }) {
  const severity = getNoteSeverity(player.note);

  return (
    <div
      className={`flex-1 p-4 rounded-lg border-2 ${
        isOut
          ? 'bg-red-50 border-red-200'
          : 'bg-green-50 border-green-200'
      }`}
    >
      <div className="text-xs font-semibold mb-2 uppercase tracking-wide">
        {isOut ? (
          <span className="text-red-700">Coming Off</span>
        ) : (
          <span className="text-green-700">Coming On</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-800">#{player.jerseyNumber}</span>
        <span className="font-bold text-lg text-gray-800">{player.name}</span>
        {severity !== 'none' && (
          <AlertCircle
            size={18}
            className={severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}
          />
        )}
      </div>
      <div className="text-sm text-gray-600">
        {player.positions.slice(0, 3).join(', ')}
        {player.positions.length > 3 && ` +${player.positions.length - 3}`}
      </div>
      {player.note && player.noteAffectsOptimization && (
        <div className="mt-2 text-xs text-gray-500 italic line-clamp-2">
          {player.note}
        </div>
      )}
    </div>
  );
}
