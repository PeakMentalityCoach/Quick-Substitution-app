import { PlayerAssignment, Player } from '../types';

/**
 * Validates that a lineup meets all requirements
 */
export function validateLineupData(
  lineup: PlayerAssignment[],
  allPlayers: Player[]
): { valid: boolean; error?: string } {
  // Check max 11 positions
  if (lineup.length > 11) {
    return { valid: false, error: 'Lineup cannot have more than 11 positions' };
  }

  // Check for duplicate positions
  const positions = new Set<string>();
  for (const assignment of lineup) {
    if (positions.has(assignment.position)) {
      return { valid: false, error: `Duplicate position: ${assignment.position}` };
    }
    positions.add(assignment.position);
  }

  // Check that all players exist
  const playerIds = new Set(allPlayers.map(p => p.id));
  for (const assignment of lineup) {
    if (!playerIds.has(assignment.playerId)) {
      return { valid: false, error: `Player not found: ${assignment.playerId}` };
    }
  }

  // Check for duplicate players
  const assignedPlayerIds = new Set<string>();
  for (const assignment of lineup) {
    if (assignedPlayerIds.has(assignment.playerId)) {
      return { valid: false, error: `Player assigned multiple times: ${assignment.playerId}` };
    }
    assignedPlayerIds.add(assignment.playerId);
  }

  return { valid: true };
}

/**
 * Validates bench data
 */
export function validateBench(
  bench: string[],
  allPlayers: Player[],
  lineup: PlayerAssignment[]
): { valid: boolean; error?: string } {
  const playerIds = new Set(allPlayers.map(p => p.id));
  const lineupPlayerIds = new Set(lineup.map(a => a.playerId));

  for (const playerId of bench) {
    // Check player exists
    if (!playerIds.has(playerId)) {
      return { valid: false, error: `Bench player not found: ${playerId}` };
    }

    // Check player is not in lineup
    if (lineupPlayerIds.has(playerId)) {
      return { valid: false, error: `Player cannot be in both lineup and bench: ${playerId}` };
    }
  }

  // Check for duplicates in bench
  const benchSet = new Set<string>();
  for (const playerId of bench) {
    if (benchSet.has(playerId)) {
      return { valid: false, error: `Player appears multiple times on bench: ${playerId}` };
    }
    benchSet.add(playerId);
  }

  return { valid: true };
}
