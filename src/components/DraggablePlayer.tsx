import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player, Position } from '../types';
import { getPositionColor } from '../utils/helpers';

interface DraggablePlayerProps {
  player: Player;
  position: Position;
  interactive?: boolean;
}

export default function DraggablePlayer({ player, position, interactive = true }: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: !interactive,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(interactive ? listeners : {})}
      {...(interactive ? attributes : {})}
      className={`
        flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className={`
        w-12 h-12 ${getPositionColor(position)} text-white rounded-full 
        flex items-center justify-center font-bold text-lg shadow-lg
        border-2 border-white transition-transform hover:scale-110
      `}>
        {player.number}
      </div>
      <div className="bg-white px-2 py-0.5 rounded shadow-md">
        <span className="text-xs font-semibold text-gray-900">{player.name.split(' ')[0]}</span>
      </div>
    </div>
  );
}
