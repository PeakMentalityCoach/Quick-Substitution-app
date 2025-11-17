import { useState } from 'react';
import { Player, PlayerAssignment, SetPieceLayout } from '../types';
import { getDefaultSetPieceLayouts } from '../utils/setPieces';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TabletSetPieceViewProps {
  lineup: PlayerAssignment[];
  players: Player[];
}

export default function TabletSetPieceView({ lineup, players }: TabletSetPieceViewProps) {
  const [layouts] = useState<SetPieceLayout[]>(getDefaultSetPieceLayouts());
  const [selectedLayoutIndex, setSelectedLayoutIndex] = useState(0);

  const selectedLayout = layouts[selectedLayoutIndex];

  // Map current lineup players to set piece positions based on their primary position
  const assignPlayersToSetPiece = (layout: SetPieceLayout): Map<string, Player | null> => {
    const assignments = new Map<string, Player | null>();

    // For each position in the set piece, try to find a player from the lineup
    layout.positions.forEach((setPiecePos) => {
      // Try to find a player currently playing this position
      const assignment = lineup.find((a) => a.position === setPiecePos.label);

      if (assignment) {
        const player = players.find((p) => p.id === assignment.playerId);
        assignments.set(setPiecePos.id, player || null);
      } else {
        // Try to find any player who can play this position
        const availablePlayer = lineup
          .map((a) => players.find((p) => p.id === a.playerId))
          .find((p) => p && p.positions.includes(setPiecePos.label));

        assignments.set(setPiecePos.id, availablePlayer || null);
      }
    });

    return assignments;
  };

  const playerAssignments = assignPlayersToSetPiece(selectedLayout);

  const goToPrevious = () => {
    setSelectedLayoutIndex((prev) => (prev === 0 ? layouts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedLayoutIndex((prev) => (prev === layouts.length - 1 ? 0 : prev + 1));
  };

  // Get background gradient based on set piece type
  const getPitchBackground = (type: SetPieceLayout['type']): string => {
    if (type.includes('offensive')) {
      return 'linear-gradient(180deg, #15803d 0%, #16a34a 50%, #22c55e 100%)';
    } else if (type.includes('defensive')) {
      return 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)';
    }
    return 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Set Pieces</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedLayoutIndex + 1} / {layouts.length}
            </span>
          </div>
        </div>

        {/* Layout selector */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={goToPrevious}
            className="tablet-button tablet-button-outline p-2"
            aria-label="Previous set piece"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex-1 text-center">
            <h3 className="text-xl font-bold text-gray-800">{selectedLayout.name}</h3>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              {selectedLayout.type.replace(/-/g, ' ')}
            </p>
          </div>

          <button
            onClick={goToNext}
            className="tablet-button tablet-button-outline p-2"
            aria-label="Next set piece"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Quick navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {layouts.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedLayoutIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === selectedLayoutIndex
                  ? 'bg-green-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
                }`}
              aria-label={`Go to set piece ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Pitch View */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="tablet-pitch h-full min-h-[600px] relative"
          style={{ background: getPitchBackground(selectedLayout.type) }}
        >
          {/* Pitch markings based on set piece type */}
          <svg
            className="tablet-pitch-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Goal lines */}
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="0"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="100"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />

            {/* Penalty area */}
            {selectedLayout.type.includes('offensive') && (
              <rect
                x="30"
                y="0"
                width="40"
                height="18"
                fill="none"
                stroke="white"
                strokeWidth="0.3"
                opacity="0.5"
              />
            )}
            {selectedLayout.type.includes('defensive') && (
              <rect
                x="30"
                y="82"
                width="40"
                height="18"
                fill="none"
                stroke="white"
                strokeWidth="0.3"
                opacity="0.5"
              />
            )}

            {/* Center circle for free kicks */}
            {selectedLayout.type.includes('free-kick') && (
              <>
                <circle
                  cx="50"
                  cy="50"
                  r="12"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="100"
                  y2="50"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
              </>
            )}

            {/* Corner arc */}
            {selectedLayout.type.includes('corner') && (
              <>
                <path
                  d="M 95 0 Q 95 5, 100 5"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                <path
                  d="M 5 0 Q 5 5, 0 5"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
              </>
            )}
          </svg>

          {/* Players */}
          {selectedLayout.positions.map((pos) => {
            const player = playerAssignments.get(pos.id);

            return (
              <div
                key={pos.id}
                className="tablet-pitch-position"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
              >
                <div
                  className={`tablet-pitch-player ${!player ? 'opacity-40 border-dashed' : ''
                    }`}
                >
                  {player ? (
                    <>
                      <span className="tablet-pitch-player-number">
                        {player.jerseyNumber}
                      </span>
                      <span className="tablet-pitch-player-position">{pos.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="tablet-pitch-player-number text-gray-400">?</span>
                      <span className="tablet-pitch-player-position text-gray-400">
                        {pos.label}
                      </span>
                    </>
                  )}
                </div>
                {player && (
                  <div className="mt-1 text-center">
                    <span className="text-white text-xs font-semibold bg-black bg-opacity-60 px-2 py-1 rounded">
                      {player.name.split(' ').pop()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-green-600 flex items-center justify-center text-xs font-bold">
              #
            </div>
            <span className="text-gray-700">Assigned Player</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400">
              ?
            </div>
            <span className="text-gray-700">No Player Assigned</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Swipe or use arrows to view different set piece configurations
        </p>
      </div>
    </div>
  );
}
