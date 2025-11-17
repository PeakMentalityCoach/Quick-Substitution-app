import { motion } from 'framer-motion';
import { Edit, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
  onNotes?: () => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export default function PlayerCard({
  player,
  onEdit,
  onDelete,
  onNotes,
  showActions = true,
  variant = 'default',
}: PlayerCardProps) {
  const avgRating =
    player.ratings.length > 0
      ? (player.ratings.reduce((sum, r) => sum + r.rating, 0) / player.ratings.length).toFixed(1)
      : '0.0';

  const hasInjury = player.notes?.hasInjury;
  const hasRestrictions = player.notes?.minutesRestriction || (player.notes?.safePositions.length ?? 0) < player.positions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${
        hasInjury ? 'border-red-300' : 'border-transparent'
      } ${variant === 'compact' ? 'p-3' : 'p-4'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`${
                variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12'
              } bg-gradient-to-br from-pmc-green-600 to-pmc-green-500 text-white rounded-full flex items-center justify-center font-bold ${
                variant === 'compact' ? 'text-base' : 'text-lg'
              } shadow-lg`}
            >
              {player.jerseyNumber}
            </motion.div>
            {hasInjury && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
              >
                <AlertTriangle size={12} className="text-white" />
              </motion.div>
            )}
          </div>
          <div>
            <h3 className={`font-bold ${variant === 'compact' ? 'text-base' : 'text-lg'} text-pmc-gray-800`}>
              {player.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-pmc-gray-600">Avg: {avgRating}</p>
              {hasRestrictions && (
                <span className="text-xs bg-pmc-gold-100 text-pmc-gold-700 px-2 py-0.5 rounded-full font-medium">
                  Restricted
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-1">
            {onNotes && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotes}
                className="p-2 text-pmc-gold-600 hover:bg-pmc-gold-50 rounded-lg transition-colors"
                title="Player notes"
              >
                <FileText size={18} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 text-pmc-green-600 hover:bg-pmc-green-50 rounded-lg transition-colors"
              title="Edit player"
            >
              <Edit size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete player"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        )}
      </div>

      {variant !== 'compact' && (
        <>
          <div className="mb-2">
            <p className="text-sm font-semibold text-pmc-gray-700 mb-1">Positions:</p>
            <div className="flex flex-wrap gap-1">
              {player.positions.map((pos) => {
                const isSafe = player.notes?.safePositions.includes(pos) ?? true;
                return (
                  <span
                    key={pos}
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      isSafe
                        ? 'bg-pmc-green-100 text-pmc-green-800'
                        : 'bg-pmc-gray-100 text-pmc-gray-600 line-through'
                    }`}
                  >
                    {pos}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-pmc-gray-700 mb-1">Ratings:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {player.ratings.slice(0, 6).map((rating) => (
                <div
                  key={rating.position}
                  className="flex justify-between bg-pmc-gray-50 px-2 py-1 rounded border border-pmc-gray-100"
                >
                  <span className="font-medium text-pmc-gray-700">{rating.position}:</span>
                  <span className="text-pmc-gray-900 font-bold">{rating.rating}</span>
                </div>
              ))}
              {player.ratings.length > 6 && (
                <div className="col-span-2 text-center text-pmc-gray-500 text-xs py-1">
                  +{player.ratings.length - 6} more
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
