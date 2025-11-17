import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppablePositionProps {
  id: string;
  x: number;
  y: number;
  children: ReactNode;
}

export default function DroppablePosition({ id, x, y, children }: DroppablePositionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute transition-all
        ${isOver ? 'scale-110' : ''}
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {isOver && (
        <div className="absolute inset-0 -m-4 bg-white bg-opacity-30 rounded-full animate-pulse" />
      )}
      {children}
    </div>
  );
}
