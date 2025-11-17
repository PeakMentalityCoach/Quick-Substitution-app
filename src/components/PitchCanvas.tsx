import React from 'react';
import { useDndContext, DndContext, DragEndEvent } from '@dnd-kit/core';
import type { Player, LineupPosition } from '../types';
import { motion } from 'framer-motion';

interface PitchCanvasProps {
  lineup: LineupPosition[];
  onPlayerMove?: (playerId: string, newPosition: { x: number; y: number }) => void;
  onPlayerClick?: (player: Player) => void;
  showNames?: boolean;
  interactive?: boolean;
}

export function PitchCanvas({
  lineup,
  onPlayerMove,
  onPlayerClick,
  showNames = true,
  interactive = false
}: PitchCanvasProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (!onPlayerMove) return;

    const { active, delta } = event;
    const playerId = active.id as string;

    // Find the player in lineup
    const player Pos = lineup.find(lp => lp.player?.id === playerId);
    if (!playerPos) return;

    // Calculate new position (delta is in pixels, convert to percentage)
    const pitchWidth = 600; // Reference width
    const pitchHeight = 400; // Reference height

    const newX = Math.max(0, Math.min(100, playerPos.x + (delta.x / pitchWidth) * 100));
    const newY = Math.max(0, Math.min(100, playerPos.y + (delta.y / pitchHeight) * 100));

    onPlayerMove(playerId, { x: newX, y: newY });
  };

  return (
    <div className="relative w-full aspect-[3/2] bg-green-600 rounded-lg overflow-hidden shadow-lg">
      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Outer lines */}
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="white" strokeWidth="0.3" />

        {/* Center line */}
        <line x1="50" y1="1" x2="50" y2="99" stroke="white" strokeWidth="0.3" />

        {/* Center circle */}
        <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="0.5" fill="white" />

        {/* Penalty areas */}
        <rect x="1" y="30" width="16" height="40" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="83" y="30" width="16" height="40" fill="none" stroke="white" strokeWidth="0.3" />

        {/* Goal areas */}
        <rect x="1" y="42" width="6" height="16" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="93" y="42" width="6" height="16" fill="none" stroke="white" strokeWidth="0.3" />

        {/* Penalty spots */}
        <circle cx="12" cy="50" r="0.5" fill="white" />
        <circle cx="88" cy="50" r="0.5" fill="white" />
      </svg>

      {/* Players */}
      {lineup.map((pos, index) => {
        if (!pos.player) return null;

        const PlayerMarker = (
          <motion.div
            key={pos.player.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: interactive ? 1.2 : 1 }}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            className={`${interactive ? 'cursor-move' : ''}`}
            onClick={() => onPlayerClick && onPlayerClick(pos.player!)}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {pos.player.number}
              </div>
              {showNames && (
                <div className="mt-1 px-2 py-0.5 bg-white bg-opacity-90 rounded text-xs font-semibold text-gray-900 shadow">
                  {pos.player.name}
                </div>
              )}
              <div className="mt-0.5 px-1.5 py-0.5 bg-blue-500 bg-opacity-90 rounded text-xs font-semibold text-white">
                {pos.position}
              </div>
            </div>
          </motion.div>
        );

        return PlayerMarker;
      })}
    </div>
  );
}
