import type { Player, ValidationResult, ValidationError, PlayerAttributes, Position } from '../types';

export function validatePlayer(player: Partial<Player>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!player.name || player.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Player name is required',
      severity: 'error'
    });
  }

  if (player.number === undefined || player.number < 1 || player.number > 99) {
    errors.push({
      field: 'number',
      message: 'Player number must be between 1 and 99',
      severity: 'error'
    });
  }

  if (!player.position) {
    errors.push({
      field: 'position',
      message: 'Player position is required',
      severity: 'error'
    });
  }

  if (player.attributes) {
    const attrErrors = validateAttributes(player.attributes);
    errors.push(...attrErrors);
  }

  if (player.fatigueLevel !== undefined && (player.fatigueLevel < 0 || player.fatigueLevel > 100)) {
    warnings.push('Fatigue level should be between 0 and 100');
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings
  };
}

export function validateAttributes(attributes: Partial<PlayerAttributes>): ValidationError[] {
  const errors: ValidationError[] = [];
  const attributeNames: (keyof PlayerAttributes)[] = [
    'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical', 'tactical', 'mental'
  ];

  for (const attr of attributeNames) {
    const value = attributes[attr];
    if (value !== undefined && (value < 1 || value > 20)) {
      errors.push({
        field: `attributes.${attr}`,
        message: `${attr} must be between 1 and 20`,
        severity: 'error'
      });
    }
  }

  return errors;
}

export function validateLineup(players: (Player | null)[], formation: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  const validPlayers = players.filter(p => p !== null) as Player[];

  if (validPlayers.length < 11) {
    errors.push({
      field: 'lineup',
      message: 'Lineup must have 11 players',
      severity: 'error'
    });
  }

  if (validPlayers.length > 11) {
    errors.push({
      field: 'lineup',
      message: 'Lineup cannot have more than 11 players',
      severity: 'error'
    });
  }

  // Check for goalkeeper
  const hasGoalkeeper = validPlayers.some(p => p.position === 'GK');
  if (!hasGoalkeeper) {
    errors.push({
      field: 'lineup',
      message: 'Lineup must include a goalkeeper',
      severity: 'error'
    });
  }

  // Check for duplicate players
  const playerIds = validPlayers.map(p => p.id);
  const uniqueIds = new Set(playerIds);
  if (playerIds.length !== uniqueIds.size) {
    errors.push({
      field: 'lineup',
      message: 'Lineup contains duplicate players',
      severity: 'error'
    });
  }

  // Check for unavailable players
  const unavailablePlayers = validPlayers.filter(p => !p.isAvailable);
  if (unavailablePlayers.length > 0) {
    warnings.push(`${unavailablePlayers.length} unavailable player(s) in lineup`);
  }

  // Check fatigue levels
  const highFatiguePlayers = validPlayers.filter(p => p.fatigueLevel > 75);
  if (highFatiguePlayers.length > 0) {
    warnings.push(`${highFatiguePlayers.length} player(s) with high fatigue (>75%)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function isValidPosition(position: string): position is Position {
  const validPositions: Position[] = [
    'GK',
    'LB', 'LCB', 'CB', 'RCB', 'RB',
    'LWB', 'RWB',
    'LDM', 'CDM', 'RDM',
    'LCM', 'CM', 'RCM',
    'LAM', 'CAM', 'RAM',
    'LW', 'RW',
    'LF', 'CF', 'RF',
    'ST'
  ];
  return validPositions.includes(position as Position);
}
