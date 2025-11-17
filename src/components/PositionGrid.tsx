import React from 'react';
import { useDndContext, DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { LineupPlayer, Player } from '../types';
import { getPositionColor } from '../utils/helpers';
import DraggablePlayer from './DraggablePlayer';
import DroppablePosition from './DroppablePosition';

interface PositionGridProps {
  lineup: LineupPlayer[];
  onDragEnd: (event: DragEndEvent) => void;
  getPlayerById: (id: string) => Player | undefined;
  interactive?: boolean;
}

export default function PositionGrid({ lineup, onDragEnd, getPlayerById, interactive = true }: PositionGridProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const activePlayer = activeId ? getPlayerById(activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full bg-gradient-to-b from-green-600 to-green-700 rounded-xl shadow-lg overflow-hidden">
        {/* Field markings */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white rounded-b-full" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
        </div>

        {/* Positions */}
        <div className="relative w-full pb-[133%]">
          <div className="absolute inset-0 p-4">
            {lineup.map((lineupPlayer) => {
              const player = getPlayerById(lineupPlayer.playerId);
              if (!player) return null;

              return (
                <DroppablePosition
                  key={`${lineupPlayer.playerId}-${lineupPlayer.position}`}
                  id={`position-${lineupPlayer.position}-${lineupPlayer.x}-${lineupPlayer.y}`}
                  x={lineupPlayer.x}
                  y={lineupPlayer.y}
                >
                  <DraggablePlayer
                    player={player}
                    position={lineupPlayer.position}
                    interactive={interactive}
                  />
                </DroppablePosition>
              );
            })}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activePlayer && (
          <div className="bg-white rounded-lg shadow-xl p-2 border-2 border-pmc-primary">
            <div className="w-12 h-12 bg-pmc-primary text-white rounded-full flex items-center justify-center font-bold">
              {activePlayer.number}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
