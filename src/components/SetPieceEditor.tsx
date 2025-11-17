import React from 'react';
import { useDndMonitor, DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { SetPiece, Player } from '../types';

interface SetPieceEditorProps {
  setPiece: SetPiece;
  availablePlayers: Player[];
  onUpdatePositions: (positions: SetPiece['positions']) => void;
}

export function SetPieceEditor({ setPiece, availablePlayers, onUpdatePositions }: SetPieceEditorProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const positionId = active.id as string;

    const pitchWidth = 600;
    const pitchHeight = 400;

    const updatedPositions = setPiece.positions.map(pos => {
      if (`pos-${setPiece.positions.indexOf(pos)}` === positionId) {
        const newX = Math.max(0, Math.min(100, pos.x + (delta.x / pitchWidth) * 100));
        const newY = Math.max(0, Math.min(100, pos.y + (delta.y / pitchHeight) * 100));
        return { ...pos, x: newX, y: newY };
      }
      return pos;
    });

    onUpdatePositions(updatedPositions);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {setPiece.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {setPiece.description}
        </p>

        {/* Pitch Canvas with draggable positions */}
        <div className="relative w-full aspect-[3/2] bg-green-600 rounded-lg overflow-hidden shadow-lg">
          {/* Pitch markings */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="1" y="1" width="98" height="98" fill="none" stroke="white" strokeWidth="0.3" />
            <line x1="50" y1="1" x2="50" y2="99" stroke="white" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.3" />
            <rect x="1" y="30" width="16" height="40" fill="none" stroke="white" strokeWidth="0.3" />
            <rect x="83" y="30" width="16" height="40" fill="none" stroke="white" strokeWidth="0.3" />
          </svg>

          {/* Position markers */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {setPiece.positions.map((pos, index) => (
              <motion.div
                key={`pos-${index}`}
                drag
                dragMomentum={false}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'move'
                }}
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2 }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-white bg-opacity-90 rounded text-xs font-semibold text-gray-900">
                    {pos.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </DndContext>
        </div>
      </div>

      {/* Position Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Position Instructions
        </h3>
        <div className="space-y-3">
          {setPiece.positions.map((pos, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {pos.role}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pos.instructions || 'No specific instructions'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
