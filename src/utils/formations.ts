import { Formation } from '../types';

export const FORMATIONS: Formation[] = [
  {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 20 },
      { position: 'CB', x: 40, y: 15 },
      { position: 'CB', x: 60, y: 15 },
      { position: 'RB', x: 80, y: 20 },
      { position: 'CDM', x: 50, y: 35 },
      { position: 'CM', x: 35, y: 50 },
      { position: 'CM', x: 65, y: 50 },
      { position: 'LW', x: 20, y: 75 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 80, y: 75 },
    ],
  },
  {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 20 },
      { position: 'CB', x: 40, y: 15 },
      { position: 'CB', x: 60, y: 15 },
      { position: 'RB', x: 80, y: 20 },
      { position: 'LM', x: 20, y: 50 },
      { position: 'CM', x: 40, y: 45 },
      { position: 'CM', x: 60, y: 45 },
      { position: 'RM', x: 80, y: 50 },
      { position: 'ST', x: 40, y: 80 },
      { position: 'ST', x: 60, y: 80 },
    ],
  },
  {
    name: '3-5-2',
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 15 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 15 },
      { position: 'LWB', x: 15, y: 40 },
      { position: 'CDM', x: 40, y: 35 },
      { position: 'CDM', x: 60, y: 35 },
      { position: 'RWB', x: 85, y: 40 },
      { position: 'CAM', x: 50, y: 60 },
      { position: 'ST', x: 40, y: 80 },
      { position: 'ST', x: 60, y: 80 },
    ],
  },
  {
    name: '4-2-3-1',
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 20 },
      { position: 'CB', x: 40, y: 15 },
      { position: 'CB', x: 60, y: 15 },
      { position: 'RB', x: 80, y: 20 },
      { position: 'CDM', x: 40, y: 35 },
      { position: 'CDM', x: 60, y: 35 },
      { position: 'LM', x: 20, y: 60 },
      { position: 'CAM', x: 50, y: 60 },
      { position: 'RM', x: 80, y: 60 },
      { position: 'ST', x: 50, y: 85 },
    ],
  },
  {
    name: '3-4-3',
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 15 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 15 },
      { position: 'LM', x: 20, y: 45 },
      { position: 'CM', x: 40, y: 40 },
      { position: 'CM', x: 60, y: 40 },
      { position: 'RM', x: 80, y: 45 },
      { position: 'LW', x: 25, y: 75 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 75, y: 75 },
    ],
  },
];

export function getFormationByName(name: string): Formation | undefined {
  return FORMATIONS.find(f => f.name === name);
}
