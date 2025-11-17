import type {
  Player,
  Position,
  PlayerAttributes,
  ScoreBreakdown,
  FormationWeights
} from '../types';

// Position compatibility matrix
const POSITION_COMPATIBILITY: Record<Position, Partial<Record<Position, number>>> = {
  'GK': { 'GK': 1.0 },
  'LB': { 'LB': 1.0, 'LWB': 0.8, 'LCB': 0.5 },
  'RB': { 'RB': 1.0, 'RWB': 0.8, 'RCB': 0.5 },
  'CB': { 'CB': 1.0, 'LCB': 0.9, 'RCB': 0.9, 'CDM': 0.4 },
  'LCB': { 'LCB': 1.0, 'CB': 0.9, 'LB': 0.6 },
  'RCB': { 'RCB': 1.0, 'CB': 0.9, 'RB': 0.6 },
  'LWB': { 'LWB': 1.0, 'LB': 0.8, 'LM': 0.6 },
  'RWB': { 'RWB': 1.0, 'RB': 0.8, 'RM': 0.6 },
  'LDM': { 'LDM': 1.0, 'CDM': 0.8, 'LCM': 0.7 },
  'CDM': { 'CDM': 1.0, 'LDM': 0.8, 'RDM': 0.8, 'CM': 0.7, 'CB': 0.4 },
  'RDM': { 'RDM': 1.0, 'CDM': 0.8, 'RCM': 0.7 },
  'LCM': { 'LCM': 1.0, 'CM': 0.9, 'LDM': 0.7, 'LAM': 0.6 },
  'CM': { 'CM': 1.0, 'LCM': 0.9, 'RCM': 0.9, 'CDM': 0.7, 'CAM': 0.7 },
  'RCM': { 'RCM': 1.0, 'CM': 0.9, 'RDM': 0.7, 'RAM': 0.6 },
  'LAM': { 'LAM': 1.0, 'CAM': 0.8, 'LCM': 0.6, 'LW': 0.7 },
  'CAM': { 'CAM': 1.0, 'LAM': 0.8, 'RAM': 0.8, 'CM': 0.6, 'CF': 0.6 },
  'RAM': { 'RAM': 1.0, 'CAM': 0.8, 'RCM': 0.6, 'RW': 0.7 },
  'LW': { 'LW': 1.0, 'LF': 0.8, 'LAM': 0.7, 'LWB': 0.4 },
  'RW': { 'RW': 1.0, 'RF': 0.8, 'RAM': 0.7, 'RWB': 0.4 },
  'LF': { 'LF': 1.0, 'LW': 0.8, 'CF': 0.7, 'ST': 0.6 },
  'CF': { 'CF': 1.0, 'ST': 0.9, 'LF': 0.7, 'RF': 0.7, 'CAM': 0.5 },
  'RF': { 'RF': 1.0, 'RW': 0.8, 'CF': 0.7, 'ST': 0.6 },
  'ST': { 'ST': 1.0, 'CF': 0.9, 'LF': 0.6, 'RF': 0.6 }
};

// Attribute weights for different positions
const POSITION_ATTRIBUTE_WEIGHTS: Record<Position, Partial<Record<keyof PlayerAttributes, number>>> = {
  'GK': { defending: 0.3, physical: 0.3, mental: 0.2, tactical: 0.2 },
  'LB': { pace: 0.25, defending: 0.25, physical: 0.2, tactical: 0.15, passing: 0.15 },
  'RB': { pace: 0.25, defending: 0.25, physical: 0.2, tactical: 0.15, passing: 0.15 },
  'CB': { defending: 0.3, physical: 0.25, tactical: 0.2, mental: 0.15, pace: 0.1 },
  'LCB': { defending: 0.3, physical: 0.25, tactical: 0.2, mental: 0.15, pace: 0.1 },
  'RCB': { defending: 0.3, physical: 0.25, tactical: 0.2, mental: 0.15, pace: 0.1 },
  'LWB': { pace: 0.3, physical: 0.2, passing: 0.2, defending: 0.15, dribbling: 0.15 },
  'RWB': { pace: 0.3, physical: 0.2, passing: 0.2, defending: 0.15, dribbling: 0.15 },
  'LDM': { defending: 0.25, tactical: 0.25, passing: 0.2, physical: 0.15, mental: 0.15 },
  'CDM': { defending: 0.25, tactical: 0.25, passing: 0.2, physical: 0.15, mental: 0.15 },
  'RDM': { defending: 0.25, tactical: 0.25, passing: 0.2, physical: 0.15, mental: 0.15 },
  'LCM': { passing: 0.25, tactical: 0.2, mental: 0.2, physical: 0.15, defending: 0.1, dribbling: 0.1 },
  'CM': { passing: 0.25, tactical: 0.2, mental: 0.2, physical: 0.15, defending: 0.1, dribbling: 0.1 },
  'RCM': { passing: 0.25, tactical: 0.2, mental: 0.2, physical: 0.15, defending: 0.1, dribbling: 0.1 },
  'LAM': { passing: 0.25, dribbling: 0.25, mental: 0.2, shooting: 0.15, pace: 0.15 },
  'CAM': { passing: 0.25, dribbling: 0.25, mental: 0.2, shooting: 0.15, pace: 0.15 },
  'RAM': { passing: 0.25, dribbling: 0.25, mental: 0.2, shooting: 0.15, pace: 0.15 },
  'LW': { pace: 0.3, dribbling: 0.25, shooting: 0.2, mental: 0.15, passing: 0.1 },
  'RW': { pace: 0.3, dribbling: 0.25, shooting: 0.2, mental: 0.15, passing: 0.1 },
  'LF': { shooting: 0.3, pace: 0.25, dribbling: 0.2, mental: 0.15, physical: 0.1 },
  'CF': { shooting: 0.3, mental: 0.25, physical: 0.2, dribbling: 0.15, pace: 0.1 },
  'RF': { shooting: 0.3, pace: 0.25, dribbling: 0.2, mental: 0.15, physical: 0.1 },
  'ST': { shooting: 0.35, mental: 0.25, physical: 0.2, pace: 0.1, dribbling: 0.1 }
};

export function calculatePositionFit(playerPosition: Position, requiredPosition: Position): number {
  const compatibility = POSITION_COMPATIBILITY[playerPosition]?.[requiredPosition] ?? 0;
  return compatibility * 100; // Return as percentage (0-100)
}

export function calculateAttributeFit(
  attributes: PlayerAttributes,
  requiredPosition: Position
): number {
  const weights = POSITION_ATTRIBUTE_WEIGHTS[requiredPosition];
  if (!weights) return 50; // Default neutral score

  let totalScore = 0;
  let totalWeight = 0;

  for (const [attr, weight] of Object.entries(weights)) {
    const attrKey = attr as keyof PlayerAttributes;
    const value = attributes[attrKey] || 10; // Default to 10 if missing
    totalScore += (value / 20) * 100 * weight; // Normalize to 0-100 and apply weight
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 50;
}

export function calculateFatiguePenalty(fatigueLevel: number): number {
  // Linear penalty: 0% fatigue = 0 penalty, 100% fatigue = -40 penalty
  return -(fatigueLevel * 0.4);
}

export function calculateChemistryFit(player: Player, adjacentPositions: Position[]): number {
  // Simplified chemistry: check if player's natural position is compatible with adjacent ones
  let chemistryScore = 50; // Base chemistry

  for (const adjPos of adjacentPositions) {
    const compatibility = POSITION_COMPATIBILITY[player.position]?.[adjPos] ?? 0;
    chemistryScore += compatibility * 10; // Add up to 10 points per adjacent position
  }

  return Math.min(100, chemistryScore); // Cap at 100
}

export function calculatePlayerScore(
  player: Player,
  requiredPosition: Position,
  weights: FormationWeights,
  adjacentPositions: Position[] = [],
  notesModifier: number = 0
): ScoreBreakdown {
  const positionFit = calculatePositionFit(player.position, requiredPosition);
  const attributeFit = calculateAttributeFit(player.attributes, requiredPosition);
  const fatiguePenalty = calculateFatiguePenalty(player.fatigueLevel);
  const chemistryFit = calculateChemistryFit(player, adjacentPositions);

  const total =
    positionFit * weights.positionMatch +
    attributeFit * weights.attributeMatch +
    chemistryFit * weights.chemistry +
    fatiguePenalty * weights.fatigue +
    notesModifier * weights.notes;

  return {
    positionFit,
    attributeFit,
    chemistryFit,
    fatiguePenalty,
    notesModifier,
    total
  };
}

export function normalizeScore(score: number): number {
  // Normalize score to 0-100 range
  return Math.max(0, Math.min(100, score));
}

export function getScoreRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}
