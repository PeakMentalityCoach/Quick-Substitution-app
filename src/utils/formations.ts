import type { Formation, FormationTemplate, LineupPosition } from '../types';

export const FORMATION_TEMPLATES: Record<Formation, FormationTemplate> = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LB', x: 25, y: 15, role: 'Left Back' },
      { position: 'LCB', x: 25, y: 38, role: 'Left Center Back' },
      { position: 'RCB', x: 25, y: 62, role: 'Right Center Back' },
      { position: 'RB', x: 25, y: 85, role: 'Right Back' },
      { position: 'LM', x: 50, y: 20, role: 'Left Midfielder' },
      { position: 'LCM', x: 50, y: 40, role: 'Left Central Midfielder' },
      { position: 'RCM', x: 50, y: 60, role: 'Right Central Midfielder' },
      { position: 'RM', x: 50, y: 80, role: 'Right Midfielder' },
      { position: 'LF', x: 75, y: 35, role: 'Left Forward' },
      { position: 'RF', x: 75, y: 65, role: 'Right Forward' }
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LB', x: 25, y: 15, role: 'Left Back' },
      { position: 'LCB', x: 25, y: 38, role: 'Left Center Back' },
      { position: 'RCB', x: 25, y: 62, role: 'Right Center Back' },
      { position: 'RB', x: 25, y: 85, role: 'Right Back' },
      { position: 'LDM', x: 45, y: 35, role: 'Left Defensive Mid' },
      { position: 'CDM', x: 45, y: 50, role: 'Central Defensive Mid' },
      { position: 'RDM', x: 45, y: 65, role: 'Right Defensive Mid' },
      { position: 'LW', x: 75, y: 20, role: 'Left Winger' },
      { position: 'ST', x: 75, y: 50, role: 'Striker' },
      { position: 'RW', x: 75, y: 80, role: 'Right Winger' }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LB', x: 25, y: 15, role: 'Left Back' },
      { position: 'LCB', x: 25, y: 38, role: 'Left Center Back' },
      { position: 'RCB', x: 25, y: 62, role: 'Right Center Back' },
      { position: 'RB', x: 25, y: 85, role: 'Right Back' },
      { position: 'LDM', x: 42, y: 38, role: 'Left Defensive Mid' },
      { position: 'RDM', x: 42, y: 62, role: 'Right Defensive Mid' },
      { position: 'LAM', x: 60, y: 25, role: 'Left Attacking Mid' },
      { position: 'CAM', x: 60, y: 50, role: 'Central Attacking Mid' },
      { position: 'RAM', x: 60, y: 75, role: 'Right Attacking Mid' },
      { position: 'ST', x: 80, y: 50, role: 'Striker' }
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LCB', x: 25, y: 25, role: 'Left Center Back' },
      { position: 'CB', x: 25, y: 50, role: 'Center Back' },
      { position: 'RCB', x: 25, y: 75, role: 'Right Center Back' },
      { position: 'LWB', x: 50, y: 10, role: 'Left Wing Back' },
      { position: 'LCM', x: 50, y: 35, role: 'Left Central Mid' },
      { position: 'CM', x: 50, y: 50, role: 'Central Mid' },
      { position: 'RCM', x: 50, y: 65, role: 'Right Central Mid' },
      { position: 'RWB', x: 50, y: 90, role: 'Right Wing Back' },
      { position: 'LF', x: 75, y: 38, role: 'Left Forward' },
      { position: 'RF', x: 75, y: 62, role: 'Right Forward' }
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LCB', x: 25, y: 25, role: 'Left Center Back' },
      { position: 'CB', x: 25, y: 50, role: 'Center Back' },
      { position: 'RCB', x: 25, y: 75, role: 'Right Center Back' },
      { position: 'LM', x: 50, y: 20, role: 'Left Midfielder' },
      { position: 'LCM', x: 50, y: 40, role: 'Left Central Mid' },
      { position: 'RCM', x: 50, y: 60, role: 'Right Central Mid' },
      { position: 'RM', x: 50, y: 80, role: 'Right Midfielder' },
      { position: 'LW', x: 75, y: 20, role: 'Left Winger' },
      { position: 'ST', x: 75, y: 50, role: 'Striker' },
      { position: 'RW', x: 75, y: 80, role: 'Right Winger' }
    ]
  },
  '5-3-2': {
    name: '5-3-2',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LWB', x: 30, y: 10, role: 'Left Wing Back' },
      { position: 'LCB', x: 30, y: 30, role: 'Left Center Back' },
      { position: 'CB', x: 30, y: 50, role: 'Center Back' },
      { position: 'RCB', x: 30, y: 70, role: 'Right Center Back' },
      { position: 'RWB', x: 30, y: 90, role: 'Right Wing Back' },
      { position: 'LCM', x: 55, y: 35, role: 'Left Central Mid' },
      { position: 'CM', x: 55, y: 50, role: 'Central Mid' },
      { position: 'RCM', x: 55, y: 65, role: 'Right Central Mid' },
      { position: 'LF', x: 75, y: 38, role: 'Left Forward' },
      { position: 'RF', x: 75, y: 62, role: 'Right Forward' }
    ]
  },
  '4-1-4-1': {
    name: '4-1-4-1',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LB', x: 25, y: 15, role: 'Left Back' },
      { position: 'LCB', x: 25, y: 38, role: 'Left Center Back' },
      { position: 'RCB', x: 25, y: 62, role: 'Right Center Back' },
      { position: 'RB', x: 25, y: 85, role: 'Right Back' },
      { position: 'CDM', x: 40, y: 50, role: 'Defensive Mid' },
      { position: 'LM', x: 58, y: 20, role: 'Left Midfielder' },
      { position: 'LCM', x: 58, y: 40, role: 'Left Central Mid' },
      { position: 'RCM', x: 58, y: 60, role: 'Right Central Mid' },
      { position: 'RM', x: 58, y: 80, role: 'Right Midfielder' },
      { position: 'ST', x: 80, y: 50, role: 'Striker' }
    ]
  },
  '4-5-1': {
    name: '4-5-1',
    positions: [
      { position: 'GK', x: 10, y: 50, role: 'Goalkeeper' },
      { position: 'LB', x: 25, y: 15, role: 'Left Back' },
      { position: 'LCB', x: 25, y: 38, role: 'Left Center Back' },
      { position: 'RCB', x: 25, y: 62, role: 'Right Center Back' },
      { position: 'RB', x: 25, y: 85, role: 'Right Back' },
      { position: 'LM', x: 50, y: 15, role: 'Left Midfielder' },
      { position: 'LCM', x: 50, y: 35, role: 'Left Central Mid' },
      { position: 'CM', x: 50, y: 50, role: 'Central Mid' },
      { position: 'RCM', x: 50, y: 65, role: 'Right Central Mid' },
      { position: 'RM', x: 50, y: 85, role: 'Right Midfielder' },
      { position: 'ST', x: 80, y: 50, role: 'Striker' }
    ]
  }
};

export function getFormationPositions(formation: Formation): LineupPosition[] {
  const template = FORMATION_TEMPLATES[formation];
  if (!template) {
    throw new Error(`Formation ${formation} not found`);
  }

  return template.positions.map(pos => ({
    position: pos.position,
    player: null,
    x: pos.x,
    y: pos.y
  }));
}

export function getFormationTemplate(formation: Formation): FormationTemplate {
  return FORMATION_TEMPLATES[formation];
}
