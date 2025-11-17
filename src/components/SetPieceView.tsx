import { SetPieceLayout, PlayerAssignment, Player } from '../types';

interface SetPieceViewProps {
  layout: SetPieceLayout;
  lineup: PlayerAssignment[];
  squad: Player[];
}

export default function SetPieceView({ layout, lineup, squad }: SetPieceViewProps) {
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

        {/* Corner arcs - larger and more visible */}
        <path
          d="M 2 2 Q 6 2 6 6"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />
        <path
          d="M 98 2 Q 94 2 94 6"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />
        <path
          d="M 2 64.67 Q 6 64.67 6 60.67"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />
        <path
          d="M 98 64.67 Q 94 64.67 94 60.67"
          fill="none"
          stroke="white"
          strokeWidth="0.3"
        />
      </svg>

      {/* Position markers and players */}
      <div className="absolute inset-0">
        {layout.positions.map((pos) => {
          // Find if this position is assigned to a player in the current lineup
          const assignment = lineup.find((a) => a.position === pos.label);
          const player = assignment ? squad.find((p) => p.id === assignment.playerId) : null;

          return (
            <div
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              {player ? (
                <>
                  {/* Player with assignment */}
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-white">
                    {player.jerseyNumber}
                  </div>

                  {/* Player info */}
                  <div className="mt-1 text-center">
                    <div className="bg-white bg-opacity-90 px-2 py-0.5 rounded text-xs font-semibold text-gray-800 shadow whitespace-nowrap">
                      {player.name}
                    </div>
                    <div className="bg-green-700 bg-opacity-90 px-2 py-0.5 rounded text-xs font-bold text-white shadow mt-0.5">
                      {pos.label}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Empty position marker */}
                  <div className="w-12 h-12 bg-gray-400 bg-opacity-50 border-2 border-white border-dashed rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    ?
                  </div>

                  {/* Position label */}
                  <div className="mt-1 text-center">
                    <div className="bg-gray-700 bg-opacity-90 px-2 py-0.5 rounded text-xs font-bold text-white shadow">
                      {pos.label}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
