import React from 'react';
import type { Formation, FormationTemplate } from '../types';

interface FormationGridProps {
  selectedFormation: Formation;
  onFormationChange: (formation: Formation) => void;
}

const FORMATIONS: Formation[] = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '3-4-3',
  '5-3-2',
  '4-1-4-1',
  '4-5-1'
];

const FORMATION_DESCRIPTIONS: Record<Formation, string> = {
  '4-4-2': 'Classic balanced formation',
  '4-3-3': 'Attacking formation with wingers',
  '4-2-3-1': 'Modern attacking formation',
  '3-5-2': 'Wing-back heavy formation',
  '3-4-3': 'Aggressive attacking setup',
  '5-3-2': 'Defensive formation',
  '4-1-4-1': 'Defensive midfield anchor',
  '4-5-1': 'Ultra-defensive setup'
};

export function FormationGrid({ selectedFormation, onFormationChange }: FormationGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {FORMATIONS.map((formation) => {
        const isSelected = formation === selectedFormation;

        return (
          <button
            key={formation}
            onClick={() => onFormationChange(formation)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {formation}
              </div>
              <div className={`text-xs ${
                isSelected
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {FORMATION_DESCRIPTIONS[formation]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
