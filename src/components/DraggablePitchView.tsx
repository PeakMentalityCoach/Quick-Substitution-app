import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Player, PlayerAssignment } from '../types';
import { getPlayerRating } from '../utils/optimizer';

interface DraggablePitchViewProps {
  lineup: PlayerAssignment[];
  squad: Player[];
  highlightedPlayers?: string[];
  onPositionChange?: (playerId: string, newPosition: string) => void;
  editable?: boolean;
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

function DraggablePlayer({
  player,
  position,
  rating,
  isHighlighted,
  editable
}: {
  player: Player;
  position: string;
  rating: number;
  isHighlighted: boolean;
  editable: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id,
    disabled: !editable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(editable ? listeners : {})}
      {...attributes}
      className={`${editable ? 'cursor-move' : 'cursor-default'} ${isDragging ? 'opacity-50' : ''}`}
    >
      <motion.div
        whileHover={editable ? { scale: 1.1 } : {}}
        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-xl transition-all ${
          isHighlighted
            ? 'bg-gradient-to-br from-pmc-gold-500 to-pmc-gold-600 ring-4 ring-pmc-gold-300'
            : 'bg-gradient-to-br from-pmc-green-600 to-pmc-green-500'
        }`}
      >
        {player.jerseyNumber}
      </motion.div>

      {/* Player info */}
      <div className="mt-2 text-center">
        <div className="bg-white bg-opacity-95 px-3 py-1 rounded-lg text-xs font-semibold text-pmc-gray-800 shadow-lg border border-pmc-gray-200">
          {player.name}
        </div>
        <div className="bg-pmc-green-700 bg-opacity-95 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg mt-1 border border-pmc-green-600">
          {position} ({rating})
        </div>
      </div>
    </div>
  );
}

function DropZone({ position }: { position: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: position,
  });

  const coords = DEFAULT_POSITIONS[position] || { x: 50, y: 50 };

  return (
    <div
      ref={setNodeRef}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${coords.x}%`,
        top: `${coords.y}%`,
      }}
    >
      <div
        className={`w-16 h-16 rounded-full border-4 border-dashed flex items-center justify-center text-xs font-bold transition-all ${
          isOver
            ? 'border-pmc-gold-400 bg-pmc-gold-100 text-pmc-gold-700 scale-110'
            : 'border-white/40 bg-white/10 text-white/60'
        }`}
      >
        {position}
      </div>
    </div>
  );
}

export default function DraggablePitchView({
  lineup,
  squad,
  highlightedPlayers = [],
  onPositionChange,
  editable = false,
}: DraggablePitchViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onPositionChange) {
      onPositionChange(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative w-full bg-pitch-green rounded-2xl overflow-hidden shadow-2xl border-4 border-pmc-green-800" style={{ paddingBottom: '66.67%' }}>
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
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Center line */}
          <line
            x1="50"
            y1="2"
            x2="50"
            y2="64.67"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Center circle */}
          <circle
            cx="50"
            cy="33.33"
            r="8"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Left penalty area */}
          <rect
            x="2"
            y="20"
            width="16"
            height="26.67"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Right penalty area */}
          <rect
            x="82"
            y="20"
            width="16"
            height="26.67"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Left goal area */}
          <rect
            x="2"
            y="26.67"
            width="8"
            height="13.33"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* Right goal area */}
          <rect
            x="90"
            y="26.67"
            width="8"
            height="13.33"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
            opacity="0.8"
          />
        </svg>

        {/* Drop zones (only visible when editable) */}
        {editable && (
          <div className="absolute inset-0">
            {Object.keys(DEFAULT_POSITIONS).map((pos) => {
              const hasPlayer = lineup.some(a => a.position === pos);
              if (hasPlayer) return null;
              return <DropZone key={pos} position={pos} />;
            })}
          </div>
        )}

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
                <DraggablePlayer
                  player={player}
                  position={assignment.position}
                  rating={rating}
                  isHighlighted={isHighlighted}
                  editable={editable}
                />
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {/* This will show a ghost of the dragged item */}
      </DragOverlay>
    </DndContext>
  );
}
