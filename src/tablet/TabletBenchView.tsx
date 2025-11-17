import { useState } from 'react';
import { Player } from '../types';
import { UserPlus, Search, Filter, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { PlayerMetadata } from './hooks/useMatchMode';
import { getPlayerRating } from '../utils/optimizer';

interface TabletBenchViewProps {
  bench: string[];
  players: Player[];
  metadata: Map<string, PlayerMetadata>;
  onPlayerClick: (player: Player) => void;
  selectedPlayerIn: Player | null;
  substitutionStep: 'idle' | 'selecting-out' | 'selecting-in' | 'preview' | 'confirmed';
  playerOut: Player | null;
}

type SortOption = 'name' | 'number' | 'rating' | 'freshness';

export default function TabletBenchView({
  bench,
  players,
  metadata,
  onPlayerClick,
  selectedPlayerIn,
  substitutionStep,
  playerOut,
}: TabletBenchViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  const benchPlayers = bench
    .map((playerId) => players.find((p) => p.id === playerId))
    .filter((p): p is Player => p !== undefined);

  // Filter by search term
  const filteredPlayers = benchPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.jerseyNumber.toString().includes(searchTerm)
  );

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'number':
        return a.jerseyNumber - b.jerseyNumber;
      case 'rating': {
        const avgA = a.ratings.reduce((sum, r) => sum + r.rating, 0) / a.ratings.length;
        const avgB = b.ratings.reduce((sum, r) => sum + r.rating, 0) / b.ratings.length;
        return avgB - avgA;
      }
      case 'freshness': {
        const metaA = metadata.get(a.id);
        const metaB = metadata.get(b.id);
        const fatigueA = metaA?.fatigueLevel || 0;
        const fatigueB = metaB?.fatigueLevel || 0;
        return fatigueA - fatigueB;
      }
      default:
        return 0;
    }
  });

  const canSelectPlayer = substitutionStep === 'selecting-in';

  // Get compatibility rating for substitution
  const getCompatibilityRating = (player: Player): { compatible: boolean; reason: string; rating?: number } => {
    if (!playerOut) {
      return { compatible: true, reason: 'Ready' };
    }

    // Check if player can play any of the positions
    const outPosition = playerOut.positions;
    const canPlayOutPosition = player.positions.some((pos) =>
      outPosition.includes(pos)
    );

    if (!canPlayOutPosition) {
      return { compatible: false, reason: 'No matching positions' };
    }

    // Calculate average rating for compatible positions
    const compatiblePositions = player.positions.filter((pos) =>
      outPosition.includes(pos)
    );
    const avgRating = compatiblePositions.reduce((sum, pos) => {
      return sum + getPlayerRating(player, pos);
    }, 0) / compatiblePositions.length;

    return {
      compatible: true,
      reason: `Avg rating: ${avgRating.toFixed(1)}`,
      rating: avgRating,
    };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Bench</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Available:</span>
            <span className="text-xl font-bold text-green-600">{bench.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 text-base"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="tablet-button tablet-button-outline flex items-center gap-2"
          >
            <Filter size={18} />
            Sort & Filter
          </button>
          {showFilters && (
            <div className="flex gap-2 animate-fadeIn">
              <button
                onClick={() => setSortBy('name')}
                className={`tablet-button ${sortBy === 'name' ? 'tablet-button-primary' : 'tablet-button-outline'
                  }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('number')}
                className={`tablet-button ${sortBy === 'number' ? 'tablet-button-primary' : 'tablet-button-outline'
                  }`}
              >
                Number
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`tablet-button ${sortBy === 'rating' ? 'tablet-button-primary' : 'tablet-button-outline'
                  }`}
              >
                Rating
              </button>
              <button
                onClick={() => setSortBy('freshness')}
                className={`tablet-button ${sortBy === 'freshness' ? 'tablet-button-primary' : 'tablet-button-outline'
                  }`}
              >
                Freshness
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Substitution Context */}
      {substitutionStep === 'selecting-in' && playerOut && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">
              Select a player to replace <strong>{playerOut.name}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Bench Players Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlayers.map((player) => {
            const meta = metadata.get(player.id);
            const isSelected = selectedPlayerIn?.id === player.id;
            const compatibility = getCompatibilityRating(player);
            const isCompatible = compatibility.compatible;

            if (!meta) return null;

            const avgRating = player.ratings.length > 0
              ? (player.ratings.reduce((sum, r) => sum + r.rating, 0) / player.ratings.length).toFixed(1)
              : '0.0';

            return (
              <div
                key={player.id}
                onClick={() => canSelectPlayer && isCompatible && onPlayerClick(player)}
                className={`tablet-player-card ${isSelected ? 'tablet-player-card-selected' : ''
                  } ${canSelectPlayer && isCompatible
                    ? 'cursor-pointer hover:shadow-lg'
                    : ''
                  } ${canSelectPlayer && !isCompatible
                    ? 'opacity-40 cursor-not-allowed'
                    : ''
                  }`}
                role={canSelectPlayer && isCompatible ? 'button' : undefined}
                tabIndex={canSelectPlayer && isCompatible ? 0 : undefined}
              >
                <div className="flex items-start gap-3">
                  <div className="tablet-jersey-badge">{player.jerseyNumber}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">Avg Rating:</span>
                      <span className="text-base font-bold text-green-600">{avgRating}</span>
                    </div>

                    {/* Positions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {player.positions.slice(0, 4).map((pos) => (
                        <span
                          key={pos}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                        >
                          {pos}
                        </span>
                      ))}
                      {player.positions.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{player.positions.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="tablet-metadata-badge tablet-metadata-minutes">
                        {meta.minutesPlayed}' played
                      </span>
                      {meta.fatigueLevel < 30 && (
                        <span className="tablet-metadata-badge bg-green-100 text-green-800">
                          <TrendingUp size={14} />
                          Fresh
                        </span>
                      )}
                      {meta.fatigueLevel >= 30 && meta.fatigueLevel < 60 && (
                        <span className="tablet-metadata-badge tablet-metadata-fatigue">
                          Normal
                        </span>
                      )}
                      {meta.fatigueLevel >= 60 && (
                        <span className="tablet-metadata-badge tablet-metadata-fatigue-high">
                          <TrendingDown size={14} />
                          Tired
                        </span>
                      )}
                    </div>

                    {/* Fatigue bar */}
                    <div className="tablet-fatigue-bar mt-2">
                      <div
                        className="tablet-fatigue-fill"
                        style={{ width: `${meta.fatigueLevel}%` }}
                      />
                    </div>

                    {/* Compatibility indicator */}
                    {canSelectPlayer && (
                      <div className="mt-2">
                        {isCompatible ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <span className="text-xs font-semibold">
                              ✓ {compatibility.reason}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle size={14} />
                            <span className="text-xs font-semibold">
                              {compatibility.reason}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedPlayers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <UserPlus size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No players on bench</h3>
            <p className="text-gray-400">
              {searchTerm
                ? 'No players match your search'
                : 'All players are in the lineup'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
