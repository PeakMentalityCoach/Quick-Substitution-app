import { SetPieceLayout } from '../types';

/**
 * Returns default set piece layouts with position coordinates
 * Coordinates are in percentage (0-100) of pitch dimensions
 */
export function getDefaultSetPieceLayouts(): SetPieceLayout[] {
  return [
    {
      id: 'offensive-corner-right',
      name: 'Offensive Corner (Right)',
      type: 'offensive-corner',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 25, y: 35 },
        { id: 'pos-3', label: 'CB2', x: 25, y: 65 },
        { id: 'pos-4', label: 'LM', x: 70, y: 20 },
        { id: 'pos-5', label: 'RM', x: 92, y: 10 },
        { id: 'pos-6', label: 'KA', x: 85, y: 35 },
        { id: 'pos-7', label: 'PC', x: 85, y: 50 },
        { id: 'pos-8', label: 'ST', x: 85, y: 65 },
        { id: 'pos-9', label: 'LW', x: 75, y: 80 },
        { id: 'pos-10', label: 'CDM', x: 45, y: 50 },
        { id: 'pos-11', label: 'CM', x: 60, y: 45 },
      ],
    },
    {
      id: 'offensive-corner-left',
      name: 'Offensive Corner (Left)',
      type: 'offensive-corner',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 25, y: 35 },
        { id: 'pos-3', label: 'CB2', x: 25, y: 65 },
        { id: 'pos-4', label: 'RM', x: 70, y: 80 },
        { id: 'pos-5', label: 'LM', x: 92, y: 90 },
        { id: 'pos-6', label: 'KA', x: 85, y: 65 },
        { id: 'pos-7', label: 'PC', x: 85, y: 50 },
        { id: 'pos-8', label: 'ST', x: 85, y: 35 },
        { id: 'pos-9', label: 'RW', x: 75, y: 20 },
        { id: 'pos-10', label: 'CDM', x: 45, y: 50 },
        { id: 'pos-11', label: 'CM', x: 60, y: 55 },
      ],
    },
    {
      id: 'defensive-corner',
      name: 'Defensive Corner',
      type: 'defensive-corner',
      positions: [
        { id: 'pos-1', label: 'GK', x: 10, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 15, y: 40 },
        { id: 'pos-3', label: 'CB2', x: 15, y: 60 },
        { id: 'pos-4', label: 'LB', x: 15, y: 25 },
        { id: 'pos-5', label: 'RB', x: 15, y: 75 },
        { id: 'pos-6', label: 'CDM', x: 20, y: 50 },
        { id: 'pos-7', label: 'CM', x: 35, y: 50 },
        { id: 'pos-8', label: 'LM', x: 25, y: 15 },
        { id: 'pos-9', label: 'RM', x: 25, y: 85 },
        { id: 'pos-10', label: 'ST', x: 50, y: 50 },
        { id: 'pos-11', label: 'CF', x: 70, y: 50 },
      ],
    },
    {
      id: 'free-kick-central',
      name: 'Free Kick (Central)',
      type: 'free-kick-central',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 20, y: 40 },
        { id: 'pos-3', label: 'CB2', x: 20, y: 60 },
        { id: 'pos-4', label: 'LB', x: 30, y: 25 },
        { id: 'pos-5', label: 'RB', x: 30, y: 75 },
        { id: 'pos-6', label: 'CDM', x: 35, y: 50 },
        { id: 'pos-7', label: 'LW', x: 75, y: 20 },
        { id: 'pos-8', label: 'RW', x: 75, y: 80 },
        { id: 'pos-9', label: 'ST', x: 85, y: 50 },
        { id: 'pos-10', label: 'CAM', x: 60, y: 50 },
        { id: 'pos-11', label: 'RM', x: 90, y: 40 },
      ],
    },
    {
      id: 'free-kick-wide',
      name: 'Free Kick (Wide)',
      type: 'free-kick-wide',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 20, y: 45 },
        { id: 'pos-3', label: 'CB2', x: 20, y: 70 },
        { id: 'pos-4', label: 'LB', x: 30, y: 30 },
        { id: 'pos-5', label: 'CDM', x: 35, y: 55 },
        { id: 'pos-6', label: 'CM', x: 50, y: 50 },
        { id: 'pos-7', label: 'KA', x: 80, y: 35 },
        { id: 'pos-8', label: 'PC', x: 80, y: 55 },
        { id: 'pos-9', label: 'ST', x: 85, y: 70 },
        { id: 'pos-10', label: 'LM', x: 75, y: 15 },
        { id: 'pos-11', label: 'RM', x: 92, y: 5 },
      ],
    },
    {
      id: 'throw-in-attacking',
      name: 'Throw-In (Attacking)',
      type: 'throw-in-attacking',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 25, y: 40 },
        { id: 'pos-3', label: 'CB2', x: 25, y: 60 },
        { id: 'pos-4', label: 'LB', x: 70, y: 5 },
        { id: 'pos-5', label: 'CDM', x: 40, y: 50 },
        { id: 'pos-6', label: 'CM', x: 55, y: 40 },
        { id: 'pos-7', label: 'CAM', x: 65, y: 25 },
        { id: 'pos-8', label: 'LW', x: 80, y: 15 },
        { id: 'pos-9', label: 'RW', x: 75, y: 70 },
        { id: 'pos-10', label: 'ST', x: 85, y: 50 },
        { id: 'pos-11', label: 'CF', x: 55, y: 65 },
      ],
    },
    {
      id: 'throw-in-defending',
      name: 'Throw-In (Defending)',
      type: 'throw-in-defending',
      positions: [
        { id: 'pos-1', label: 'GK', x: 5, y: 50 },
        { id: 'pos-2', label: 'CB1', x: 20, y: 40 },
        { id: 'pos-3', label: 'CB2', x: 20, y: 60 },
        { id: 'pos-4', label: 'LB', x: 30, y: 5 },
        { id: 'pos-5', label: 'RB', x: 30, y: 80 },
        { id: 'pos-6', label: 'CDM', x: 35, y: 50 },
        { id: 'pos-7', label: 'LM', x: 45, y: 25 },
        { id: 'pos-8', label: 'RM', x: 45, y: 70 },
        { id: 'pos-9', label: 'CM', x: 55, y: 50 },
        { id: 'pos-10', label: 'ST', x: 70, y: 40 },
        { id: 'pos-11', label: 'CF', x: 70, y: 60 },
      ],
    },
  ];
}

/**
 * Gets all unique position labels from all set pieces
 */
export function getAllPositionLabels(): string[] {
  const layouts = getDefaultSetPieceLayouts();
  const labels = new Set<string>();

  for (const layout of layouts) {
    for (const position of layout.positions) {
      labels.add(position.label);
    }
  }

  return Array.from(labels).sort();
}
