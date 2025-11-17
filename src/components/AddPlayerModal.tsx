import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Player, PositionRating, STANDARD_POSITIONS } from '../types';

interface AddPlayerModalProps {
  player: Player | null;
  onSave: (player: Player) => void;
  onClose: () => void;
  existingPlayers: Player[];
}

export default function AddPlayerModal({
  player,
  onSave,
  onClose,
  existingPlayers,
}: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (player) {
      setName(player.name);
      setJerseyNumber(player.jerseyNumber.toString());
      setSelectedPositions(player.positions);

      const ratingsMap: Record<string, number> = {};
      player.ratings.forEach((r) => {
        ratingsMap[r.position] = r.rating;
      });
      setRatings(ratingsMap);
    }
  }, [player]);

  const handlePositionToggle = (position: string) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter((p) => p !== position));
      const newRatings = { ...ratings };
      delete newRatings[position];
      setRatings(newRatings);
    } else {
      setSelectedPositions([...selectedPositions, position]);
      setRatings({ ...ratings, [position]: 5 });
    }
  };

  const handleRatingChange = (position: string, value: number) => {
    setRatings({ ...ratings, [position]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const jerseyNum = parseInt(jerseyNumber);

    // Validation
    if (!name.trim()) {
      alert('Please enter a player name');
      return;
    }

    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      alert('Please enter a valid jersey number (1-99)');
      return;
    }

    // Check for duplicate jersey number
    const duplicate = existingPlayers.find(
      (p) => p.jerseyNumber === jerseyNum && p.id !== player?.id
    );
    if (duplicate) {
      alert(`Jersey number ${jerseyNum} is already assigned to ${duplicate.name}`);
      return;
    }

    if (selectedPositions.length === 0) {
      alert('Please select at least one position');
      return;
    }

    const playerRatings: PositionRating[] = selectedPositions.map((pos) => ({
      position: pos,
      rating: ratings[pos] || 5,
    }));

    const newPlayer: Player = {
      id: player?.id || `player-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      jerseyNumber: jerseyNum,
      positions: selectedPositions,
      ratings: playerRatings,
      note: player?.note || '',
      noteAffectsOptimization: player?.noteAffectsOptimization ?? false,
    };

    onSave(newPlayer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {player ? 'Edit Player' : 'Add New Player'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Player Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter player name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jersey Number *
              </label>
              <input
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                min="1"
                max="99"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1-99"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Positions (Select all that apply) *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {STANDARD_POSITIONS.map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => handlePositionToggle(position)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPositions.includes(position)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>

          {selectedPositions.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Position Ratings (1-10)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPositions.map((position) => (
                  <div
                    key={position}
                    className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="font-medium text-gray-700 w-16">{position}</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={ratings[position] || 5}
                      onChange={(e) =>
                        handleRatingChange(position, parseInt(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span className="font-bold text-green-700 w-8 text-center">
                      {ratings[position] || 5}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {player ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
