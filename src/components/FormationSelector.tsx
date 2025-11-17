import React from 'react';
import { Formation } from '../types';
import { FORMATIONS } from '../utils/formations';
import { Check } from 'lucide-react';

interface FormationSelectorProps {
  currentFormation: Formation | null;
  onSelect: (formation: Formation) => void;
}

export default function FormationSelector({ currentFormation, onSelect }: FormationSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {FORMATIONS.map((formation) => (
        <button
          key={formation.name}
          onClick={() => onSelect(formation)}
          className={`
            card transition-all cursor-pointer relative
            ${
              currentFormation?.name === formation.name
                ? 'ring-2 ring-pmc-primary bg-pmc-light'
                : 'hover:shadow-xl'
            }
          `}
        >
          {currentFormation?.name === formation.name && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-pmc-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">{formation.name}</h3>
            <div className="w-full aspect-[3/4] bg-gradient-to-b from-green-600 to-green-700 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 p-2">
                {formation.positions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
