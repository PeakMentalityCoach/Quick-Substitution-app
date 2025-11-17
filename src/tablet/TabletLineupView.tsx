import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Player, PlayerAssignment } from '../types';
import { Clock, AlertCircle, FileText } from 'lucide-react';
import { PlayerMetadata } from './hooks/useMatchMode';

interface TabletLineupViewProps {
  lineup: PlayerAssignment[];
  players: Player[];
  metadata: Map<string, PlayerMetadata>;
  onPlayerClick: (player: Player) => void;
  onPositionSwap: (player1Id: string, player2Id: string) => void;
  selectedPlayerOut: Player | null;
  coachOverrideMode: boolean;
  currentScore: number;
  currentTime: number;
}

interface DraggablePlayerProps {
  player: Player;
  position: string;
  metadata: PlayerMetadata;
  isSelected: boolean;
  onClick: () => void;
}

function DraggablePlayer({
  player,
  position,
  metadata,
  isSelected,
  onClick,
}: DraggablePlayerProps) {
  const hasYellow = metadata.bookings.includes('yellow');
  const hasRed = metadata.bookings.includes('red');
  const highFatigue = metadata.fatigueLevel > 70;

  return (
    <div
      onClick={onClick}
      className={`tablet-player-card ${isSelected ? 'tablet-player-card-selected' : ''
        } cursor-pointer hover:shadow-lg`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center gap-3">
        <div className="tablet-jersey-badge">{player.jerseyNumber}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-800 truncate">{player.name}</h3>
          <p className="text-sm font-semibold text-green-600">{position}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="tablet-metadata-badge tablet-metadata-minutes">
              <Clock size={14} />
              {metadata.minutesPlayed}'
            </span>
            {hasYellow && (
              <span className="tablet-metadata-badge tablet-metadata-yellow">⚠️ Yellow</span>
            )}
            {hasRed && (
              <span className="tablet-metadata-badge tablet-metadata-red">⛔ Red</span>
            )}
            {highFatigue && (
              <span className="tablet-metadata-badge tablet-metadata-fatigue-high">
                <AlertCircle size={14} />
                Tired
              </span>
            )}
            {metadata.notes && (
              <span className="tablet-metadata-badge bg-blue-100 text-blue-800">
                <FileText size={14} />
              </span>
            )}
          </div>
          {/* Fatigue bar */}
          <div className="tablet-fatigue-bar mt-2">
            <div
              className="tablet-fatigue-fill"
              style={{ width: `${metadata.fatigueLevel}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Position coordinates for 4-3-3 formation (percentage of pitch)
const FORMATION_POSITIONS: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 90 },
  CB1: { x: 35, y: 75 },
  CB2: { x: 65, y: 75 },
  LB: { x: 15, y: 70 },
  RB: { x: 85, y: 70 },
  CDM: { x: 50, y: 60 },
  CM: { x: 50, y: 50 },
  LM: { x: 25, y: 50 },
  RM: { x: 75, y: 50 },
  CAM: { x: 50, y: 40 },
  LW: { x: 20, y: 25 },
  RW: { x: 80, y: 25 },
  ST: { x: 50, y: 15 },
  CF: { x: 50, y: 20 },
  KA: { x: 35, y: 30 },
  PC: { x: 65, y: 30 },
};

export default function TabletLineupView({
  lineup,
  players,
  metadata,
  onPlayerClick,
  onPositionSwap,
  selectedPlayerOut,
  coachOverrideMode,
  currentScore,
  currentTime,
}: TabletLineupViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch');

  // Configure sensors for both mouse and touch
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onPositionSwap(active.id as string, over.id as string);
    }

    setActiveId(null);
  };

  const getPlayerById = (id: string): Player | undefined => {
    return players.find((p) => p.id === id);
  };

  const activePlayer = activeId ? getPlayerById(activeId) : null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Current Lineup</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Score:</span>
            <span className="text-xl font-bold text-green-600">{currentScore.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">{currentTime}'</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('pitch')}
            className={`tablet-button ${viewMode === 'pitch' ? 'tablet-button-primary' : 'tablet-button-outline'
              }`}
          >
            Pitch View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`tablet-button ${viewMode === 'list' ? 'tablet-button-primary' : 'tablet-button-outline'
              }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {viewMode === 'pitch' ? (
            <div className="tablet-pitch h-full min-h-[600px] relative">
              {/* Pitch markings */}
              <svg className="tablet-pitch-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Center circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                {/* Center line */}
                <line
                  x1="0"
                  y1="50"
                  x2="100"
                  y2="50"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                {/* Penalty areas */}
                <rect
                  x="30"
                  y="85"
                  width="40"
                  height="15"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                <rect
                  x="30"
                  y="0"
                  width="40"
                  height="15"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
              </svg>

              {/* Players */}
              {lineup.map((assignment) => {
                const player = getPlayerById(assignment.playerId);
                const meta = metadata.get(assignment.playerId);
                const pos = FORMATION_POSITIONS[assignment.position] || { x: 50, y: 50 };

                if (!player || !meta) return null;

                const isSelected = selectedPlayerOut?.id === player.id;

                return (
                  <div
                    key={player.id}
                    className="tablet-pitch-position"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                    }}
                  >
                    <div
                      className={`tablet-pitch-player ${isSelected ? 'ring-4 ring-red-500' : ''
                        }`}
                      onClick={() => onPlayerClick(player)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="tablet-pitch-player-number">
                        {player.jerseyNumber}
                      </span>
                      <span className="tablet-pitch-player-position">
                        {assignment.position}
                      </span>
                    </div>
                    <div className="mt-1 text-center">
                      <span className="text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">
                        {player.name.split(' ').pop()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineup.map((assignment) => {
                const player = getPlayerById(assignment.playerId);
                const meta = metadata.get(assignment.playerId);

                if (!player || !meta) return null;

                const isSelected = selectedPlayerOut?.id === player.id;

                return (
                  <DraggablePlayer
                    key={player.id}
                    player={player}
                    position={assignment.position}
                    metadata={meta}
                    isSelected={isSelected}
                    onClick={() => onPlayerClick(player)}
                  />
                );
              })}
            </div>
          )}

          <DragOverlay>
            {activePlayer && (
              <div className="tablet-player-card tablet-drag-overlay">
                <div className="flex items-center gap-3">
                  <div className="tablet-jersey-badge">{activePlayer.jerseyNumber}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{activePlayer.name}</h3>
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Coach Override Mode Indicator */}
      {coachOverrideMode && (
        <div className="p-3 bg-yellow-100 border-t border-yellow-300">
          <p className="text-center text-sm font-semibold text-yellow-800">
            ⚠️ Coach Override Mode Active - Substitutions will maintain positions
          </p>
        </div>
      )}
    </div>
  );
}
