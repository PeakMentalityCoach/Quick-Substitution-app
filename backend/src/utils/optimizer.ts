import { Player, PlayerAssignment, SubstitutionPreview } from '../types/index.js';
import { hungarianAlgorithm, greedyAssignment } from './hungarian.js';

/**
 * Optimizes player assignments to positions using Hungarian algorithm
 * @param players - List of available players
 * @param positions - List of positions to fill
 * @returns Optimal player assignments
 */
export function optimizeLineup(
  players: Player[],
  positions: string[]
): PlayerAssignment[] {
  if (players.length === 0 || positions.length === 0) {
    return [];
  }

  // Build cost matrix
  // Cost = negative rating (to convert maximization to minimization)
  // High penalty if player can't play position
  const PENALTY = 1000;
  const costMatrix: number[][] = [];

  for (const player of players) {
    const row: number[] = [];
    for (const position of positions) {
      const rating = getPlayerRating(player, position);
      if (rating === 0) {
        // Player can't play this position
        row.push(PENALTY);
      } else {
        // Negative because Hungarian minimizes cost, we want to maximize rating
        row.push(-rating);
      }
    }
    costMatrix.push(row);
  }

  // Use Hungarian algorithm
  let assignment: number[];
  try {
    assignment = hungarianAlgorithm(costMatrix);
  } catch (error) {
    console.warn('Hungarian algorithm failed, using greedy fallback:', error);
    assignment = greedyAssignment(costMatrix);
  }

  // Convert to PlayerAssignment format
  const result: PlayerAssignment[] = [];
  for (let i = 0; i < assignment.length; i++) {
    const posIndex = assignment[i];
    if (posIndex !== -1 && posIndex < positions.length) {
      result.push({
        playerId: players[i].id,
        position: positions[posIndex],
      });
    }
  }

  return result;
}

/**
 * Gets a player's rating for a specific position
 * Returns 0 if player cannot play that position
 */
export function getPlayerRating(player: Player, position: string): number {
  // Check if player can play this position
  if (!player.positions.includes(position)) {
    return 0;
  }

  // Find the rating for this position
  const ratingEntry = player.ratings.find((r) => r.position === position);
  return ratingEntry?.rating || 0;
}

/**
 * Calculates the total lineup score (sum of all player ratings in their assigned positions)
 */
export function calculateLineupScore(
  lineup: PlayerAssignment[],
  players: Player[]
): number {
  let total = 0;

  for (const assignment of lineup) {
    const player = players.find((p) => p.id === assignment.playerId);
    if (player) {
      const rating = getPlayerRating(player, assignment.position);
      total += rating;
    }
  }

  return total;
}

/**
 * Optimizes substitution by recalculating best lineup with new player set
 * @param currentLineup - Current player assignments
 * @param playerOut - Player being substituted out
 * @param playerIn - Player being substituted in
 * @param allPlayers - All players in squad
 * @returns Preview of the substitution with position changes
 */
export function optimizeSubstitution(
  currentLineup: PlayerAssignment[],
  playerOut: Player,
  playerIn: Player,
  allPlayers: Player[]
): SubstitutionPreview {
  // Get positions from current lineup
  const positions = currentLineup.map((a) => a.position);

  // Create new player pool: remove playerOut, add playerIn
  const currentPlayerIds = currentLineup.map((a) => a.playerId);
  const newPlayerIds = currentPlayerIds.filter((id) => id !== playerOut.id);
  newPlayerIds.push(playerIn.id);

  const newPlayers = allPlayers.filter((p) => newPlayerIds.includes(p.id));

  // Optimize new lineup
  const newLineup = optimizeLineup(newPlayers, positions);

  // Calculate scores
  const oldScore = calculateLineupScore(currentLineup, allPlayers);
  const newScore = calculateLineupScore(newLineup, allPlayers);

  // Find changes
  const changes: SubstitutionPreview['changes'] = [];

  // Track all players and their position changes
  const oldPositionMap = new Map<string, string>();
  for (const assignment of currentLineup) {
    oldPositionMap.set(assignment.playerId, assignment.position);
  }

  for (const assignment of newLineup) {
    const oldPosition = oldPositionMap.get(assignment.playerId) || null;

    // Only record if position changed or it's a new player
    if (assignment.playerId === playerIn.id || oldPosition !== assignment.position) {
      changes.push({
        playerId: assignment.playerId,
        oldPosition: oldPosition,
        newPosition: assignment.position,
      });
    }
  }

  return {
    playerOut,
    playerIn,
    oldLineup: currentLineup,
    newLineup,
    changes,
    oldScore,
    newScore,
    scoreDelta: newScore - oldScore,
  };
}

/**
 * Validates that a lineup has no duplicate positions
 */
export function validateLineup(lineup: PlayerAssignment[]): boolean {
  const positions = new Set<string>();
  for (const assignment of lineup) {
    if (positions.has(assignment.position)) {
      return false; // Duplicate position
    }
    positions.add(assignment.position);
  }
  return true;
}
