import React from 'react';
import type { SetPieceType } from '../types';
import { Target, Shield, Zap, Wind } from 'lucide-react';

interface SetPieceSelectorProps {
  selectedType: SetPieceType | null;
  onTypeSelect: (type: SetPieceType) => void;
}

const SET_PIECE_TYPES: { type: SetPieceType; label: string; icon: React.ReactNode }[] = [
  { type: 'defensive_corner', label: 'Defensive Corner', icon: <Shield className="w-6 h-6" /> },
  { type: 'offensive_corner', label: 'Offensive Corner', icon: <Target className="w-6 h-6" /> },
  { type: 'central_free_kick', label: 'Central Free Kick', icon: <Zap className="w-6 h-6" /> },
  { type: 'corridor_free_kick', label: 'Corridor Free Kick', icon: <Wind className="w-6 h-6" /> },
  { type: 'long_throw', label: 'Long Throw', icon: <Wind className="w-6 h-6" /> },
  { type: 'defensive_wall', label: 'Defensive Wall', icon: <Shield className="w-6 h-6" /> }
];

export function SetPieceSelector({ selectedType, onTypeSelect }: SetPieceSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {SET_PIECE_TYPES.map(({ type, label, icon }) => {
        const isSelected = type === selectedType;

        return (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                {icon}
              </div>
              <p className={`text-sm font-medium text-center ${
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
