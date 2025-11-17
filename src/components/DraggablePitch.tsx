import { useState } from 'react';
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
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Player, SetPiecePosition, PlayerAssignment } from '../types';
import { getNoteSeverity } from '../utils/noteInterpreter';
import { PMC_COLORS } from '../constants/brand';

interface DraggablePitchProps {
  positions: SetPiecePosition[];
  assignments: PlayerAssignment[];
  availablePlayers: Player[];
  onAssignmentsChange: (assignments: PlayerAssignment[]) => void;
  readonly?: boolean;
}

export default function DraggablePitch({
  positions,
  assignments,
  availablePlayers,
  onAssignmentsChange,
  readonly = false,
}: DraggablePitchProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || readonly) return;

    const playerId = active.id as string;
    const positionLabel = over.id as string;

    // Find if this position already has a player
    const existingAssignment = assignments.find((a) => a.position === positionLabel);

    let newAssignments = [...assignments];

    if (existingAssignment) {
      // Remove the existing player from this position
      newAssignments = newAssignments.filter((a) => a.position !== positionLabel);
    }

    // Remove player from any current assignment
    newAssignments = newAssignments.filter((a) => a.playerId !== playerId);

    // Add new assignment
    newAssignments.push({
      playerId,
      position: positionLabel,
    });

    onAssignmentsChange(newAssignments);
  };

  const getPlayerForPosition = (positionLabel: string): Player | undefined => {
    const assignment = assignments.find((a) => a.position === positionLabel);
    if (!assignment) return undefined;
    return availablePlayers.find((p) => p.id === assignment.playerId);
  };

  const assignedPlayerIds = new Set(assignments.map((a) => a.playerId));
  const unassignedPlayers = availablePlayers.filter((p) => !assignedPlayerIds.has(p.id));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch */}
        <div className="lg:col-span-2">
          <div
            className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-lg shadow-lg overflow-hidden"
            style={{ paddingBottom: '75%' }} // 4:3 aspect ratio
          >
            {/* Pitch markings */}
            <div className="absolute inset-0">
              <svg className="w-full h-full opacity-20">
                {/* Center circle */}
                <circle cx="50%" cy="50%" r="15%" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="50%" cy="50%" r="1%" fill="white" />

                {/* Halfway line */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />

                {/* Goal areas */}
                <rect x="40%" y="2%" width="20%" height="10%" stroke="white" strokeWidth="2" fill="none" />
                <rect x="40%" y="88%" width="20%" height="10%" stroke="white" strokeWidth="2" fill="none" />

                {/* Penalty areas */}
                <rect x="30%" y="2%" width="40%" height="18%" stroke="white" strokeWidth="2" fill="none" />
                <rect x="30%" y="80%" width="40%" height="18%" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Position slots */}
            {positions.map((position) => (
              <PositionSlot
                key={position.id}
                position={position}
                player={getPlayerForPosition(position.label)}
                readonly={readonly}
              />
            ))}
          </div>
        </div>

        {/* Available Players */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            {readonly ? 'Lineup' : 'Available Players'}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {readonly ? (
              assignments.map((assignment) => {
                const player = availablePlayers.find((p) => p.id === assignment.playerId);
                return player ? (
                  <div
                    key={player.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">#{player.jerseyNumber}</span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{assignment.position}</div>
                  </div>
                ) : null;
              })
            ) : (
              <>
                {unassignedPlayers.map((player) => (
                  <DraggablePlayer key={player.id} player={player} />
                ))}
                {unassignedPlayers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    All players assigned
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="p-2 bg-white rounded-lg shadow-xl border-2 border-green-500">
            <span className="font-medium text-sm">
              {availablePlayers.find((p) => p.id === activeId)?.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggablePlayer({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id,
  });

  const severity = getNoteSeverity(player.note);

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.02 }}
      className={`p-3 bg-white rounded-lg border-2 cursor-move transition ${
        isDragging
          ? 'opacity-50 border-green-500'
          : 'border-gray-200 hover:border-green-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-green-600">#{player.jerseyNumber}</span>
        <span className="font-medium flex-1">{player.name}</span>
        {severity !== 'none' && (
          <AlertCircle
            size={16}
            className={
              severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
            }
          />
        )}
      </div>
      <div className="text-xs text-gray-600 mt-1">{player.positions.join(', ')}</div>
    </motion.div>
  );
}

function PositionSlot({
  position,
  player,
  readonly,
}: {
  position: SetPiecePosition;
  player?: Player;
  readonly: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: position.label,
    disabled: readonly,
  });

  const severity = player ? getNoteSeverity(player.note) : 'none';

  return (
    <div
      ref={setNodeRef}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <motion.div
        whileHover={readonly ? {} : { scale: 1.1 }}
        className={`relative ${readonly ? '' : 'cursor-pointer'}`}
      >
        {player ? (
          <div
            className={`px-3 py-2 rounded-lg shadow-lg font-medium text-sm text-white flex flex-col items-center min-w-[60px] ${
              isOver ? 'ring-4 ring-yellow-400' : ''
            }`}
            style={{
              backgroundColor:
                severity === 'critical'
                  ? PMC_COLORS.status.error
                  : severity === 'warning'
                  ? PMC_COLORS.status.warning
                  : PMC_COLORS.primary,
            }}
          >
            <div className="font-bold">#{player.jerseyNumber}</div>
            <div className="text-xs truncate max-w-[60px]">{player.name}</div>
            <div className="text-xs opacity-75">{position.label}</div>
          </div>
        ) : (
          <div
            className={`w-14 h-14 rounded-full border-3 border-dashed flex items-center justify-center text-xs font-semibold transition ${
              isOver
                ? 'border-yellow-400 bg-yellow-400 bg-opacity-30 text-white scale-110'
                : 'border-white bg-white bg-opacity-20 text-white'
            }`}
          >
            {position.label}
          </div>
        )}
      </motion.div>
    </div>
  );
}
