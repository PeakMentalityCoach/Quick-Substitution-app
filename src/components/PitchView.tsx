import { Player, PlayerAssignment } from '../types';
import { getPlayerRating } from '../utils/optimizer';

interface PitchViewProps {
  lineup: PlayerAssignment[];
  squad: Player[];
  highlightedPlayers?: string[]; // Player IDs to highlight
}

// Default positions layout for a 4-3-3 formation
const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  GK: { x: 10, y: 50 },
  CB1: { x: 25, y: 35 },
  CB2: { x: 25, y: 65 },
  LB: { x: 25, y: 15 },
  RB: { x: 25, y: 85 },
  CDM: { x: 40, y: 50 },
  CM: { x: 55, y: 40 },
  CAM: { x: 55, y: 60 },
  LM: { x: 50, y: 20 },
  RM: { x: 50, y: 80 },
  LW: { x: 70, y: 20 },
  RW: { x: 70, y: 80 },
  ST: { x: 80, y: 50 },
  CF: { x: 75, y: 50 },
  KA: { x: 65, y: 35 },
  PC: { x: 65, y: 65 },
};

export default function PitchView({ lineup, squad, highlightedPlayers = [] }: PitchViewProps) {
  return (
    <div className="relative w-full bg-pitch-green rounded-lg overflow-hidden" style={{ paddingBottom: '66.67%' }}>
      {/* Pitch markings */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 66.67"
        preserveAspectRatio="none"
      >
        {/* Outer boundary */}
        <rect
          x="2"
          y="2"
          width="96"
          height="62.67"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Center line */}
        <line
          x1="50"
          y1="2"
          x2="50"
          y2="64.67"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Center circle */}
        <circle
          cx="50"
          cy="33.33"
          r="8"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Left penalty area */}
        <rect
          x="2"
          y="20"
          width="16"
          height="26.67"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Right penalty area */}
        <rect
          x="82"
          y="20"
          width="16"
          height="26.67"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Left goal area */}
        <rect
          x="2"
          y="26.67"
          width="8"
          height="13.33"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />

        {/* Right goal area */}
        <rect
          x="90"
          y="26.67"
          width="8"
          height="13.33"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />
      </svg>

      {/* Players */}
      <div className="absolute inset-0">
        {lineup.map((assignment) => {
          const player = squad.find((p) => p.id === assignment.playerId);
          if (!player) return null;

          const position = DEFAULT_POSITIONS[assignment.position] || { x: 50, y: 50 };
          const rating = getPlayerRating(player, assignment.position);
          const isHighlighted = highlightedPlayers.includes(player.id);

          return (
            <div
              key={assignment.playerId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              {/* Player circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all ${
                  isHighlighted
                    ? 'bg-yellow-500 ring-4 ring-yellow-300 scale-110'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {player.jerseyNumber}
              </div>

              {/* Player info */}
              <div className="mt-1 text-center">
                <div className="bg-white bg-opacity-90 px-2 py-0.5 rounded text-xs font-semibold text-gray-800 shadow">
                  {player.name}
                </div>
                <div className="bg-green-700 bg-opacity-90 px-2 py-0.5 rounded text-xs font-bold text-white shadow mt-0.5">
                  {assignment.position} ({rating})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
