import { Edit, Trash2 } from 'lucide-react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

export default function PlayerCard({
  player,
  onEdit,
  onDelete,
  showActions = true,
}: PlayerCardProps) {
  const avgRating =
    player.ratings.length > 0
      ? (player.ratings.reduce((sum, r) => sum + r.rating, 0) / player.ratings.length).toFixed(1)
      : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {player.jerseyNumber}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{player.name}</h3>
            <p className="text-sm text-gray-600">Avg Rating: {avgRating}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit player"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete player"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-1">Positions:</p>
        <div className="flex flex-wrap gap-1">
          {player.positions.map((pos) => (
            <span
              key={pos}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
            >
              {pos}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Ratings:</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {player.ratings.slice(0, 6).map((rating) => (
            <div
              key={rating.position}
              className="flex justify-between bg-gray-50 px-2 py-1 rounded"
            >
              <span className="font-medium text-gray-700">{rating.position}:</span>
              <span className="text-gray-900 font-bold">{rating.rating}</span>
            </div>
          ))}
          {player.ratings.length > 6 && (
            <div className="col-span-2 text-center text-gray-500 text-xs py-1">
              +{player.ratings.length - 6} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
