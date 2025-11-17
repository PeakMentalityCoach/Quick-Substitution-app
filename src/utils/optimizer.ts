import { Player, Position, SubstitutionSuggestion, LineupPlayer } from '../types';

/**
 * Calculate position compatibility score
 */
export function getPositionScore(player: Player, position: Position): number {
  if (player.notes?.isInjured) return 0;
  
  // Check if player is excluded from optimizer
  if (player.notes?.excludeFromOptimizer) return 0;
  
  // Check if position is in safe positions (if specified)
  if (player.notes?.safePositions && player.notes.safePositions.length > 0) {
    if (!player.notes.safePositions.includes(position)) return 0;
  }
  
  // Preferred position gets full skill score
  if (player.preferredPosition === position) {
    return player.skillLevel;
  }
  
  // Alternative positions get 80% of skill score
  if (player.alternativePositions.includes(position)) {
    return player.skillLevel * 0.8;
  }
  
  // Position groups for partial compatibility
  const positionGroups = {
    defenders: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
    midfielders: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
    wingers: ['LW', 'RW', 'LM', 'RM'],
    forwards: ['ST', 'CF', 'LW', 'RW'],
  };
  
  for (const group of Object.values(positionGroups)) {
    if (
      group.includes(player.preferredPosition) && 
      group.includes(position)
    ) {
      return player.skillLevel * 0.5;
    }
  }
  
  // No compatibility
  return player.skillLevel * 0.2;
}

/**
 * Calculate fatigue factor based on minutes played
 */
export function getFatigueFactor(player: Player): number {
  // Check minutes limit from notes
  if (player.notes?.minutesLimit) {
    if (player.minutesPlayed >= player.notes.minutesLimit) {
      return 0; // Player has reached their limit
    }
    
    const percentagePlayed = player.minutesPlayed / player.notes.minutesLimit;
    if (percentagePlayed > 0.8) {
      return 0.5; // High fatigue warning
    }
  }
  
  // Standard fatigue calculation
  if (player.minutesPlayed > 75) return 0.6;
  if (player.minutesPlayed > 60) return 0.8;
  if (player.minutesPlayed > 45) return 0.9;
  return 1.0;
}

/**
 * Generate substitution suggestions based on current lineup
 */
export function generateSubstitutionSuggestions(
  currentLineup: LineupPlayer[],
  allPlayers: Player[],
  currentMinute: number
): SubstitutionSuggestion[] {
  const suggestions: SubstitutionSuggestion[] = [];
  
  // Get players currently on the field
  const playersOnField = currentLineup
    .map(lp => allPlayers.find(p => p.id === lp.playerId))
    .filter((p): p is Player => p !== undefined);
  
  // Get available substitutes (not injured, not on field)
  const availableSubstitutes = allPlayers.filter(
    p => 
      p.status === 'available' && 
      !p.notes?.isInjured &&
      !playersOnField.some(pf => pf.id === p.id)
  );
  
  // Evaluate each position
  for (const lineupPlayer of currentLineup) {
    const currentPlayer = allPlayers.find(p => p.id === lineupPlayer.playerId);
    if (!currentPlayer) continue;
    
    const position = lineupPlayer.position;
    let shouldSubstitute = false;
    let reasons: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'low';
    
    // Check if player is injured
    if (currentPlayer.notes?.isInjured) {
      shouldSubstitute = true;
      reasons.push('Player is injured');
      priority = 'high';
    }
    
    // Check minutes limit
    if (currentPlayer.notes?.minutesLimit && currentPlayer.minutesPlayed >= currentPlayer.notes.minutesLimit) {
      shouldSubstitute = true;
      reasons.push(`Reached minutes limit (${currentPlayer.notes.minutesLimit})`);
      priority = priority === 'high' ? 'high' : 'medium';
    }
    
    // Check fatigue
    const fatigue = getFatigueFactor(currentPlayer);
    if (fatigue <= 0.6 && currentMinute > 60) {
      shouldSubstitute = true;
      reasons.push('High fatigue level');
      priority = priority === 'high' ? 'high' : 'medium';
    }
    
    // Check if player is not in safe position
    if (currentPlayer.notes?.safePositions && currentPlayer.notes.safePositions.length > 0) {
      if (!currentPlayer.notes.safePositions.includes(position)) {
        shouldSubstitute = true;
        reasons.push('Player not in safe position');
        priority = priority === 'high' ? 'high' : 'medium';
      }
    }
    
    if (shouldSubstitute) {
      // Find best replacement
      const candidates = availableSubstitutes
        .filter(p => !p.notes?.excludeFromOptimizer)
        .map(sub => ({
          player: sub,
          score: getPositionScore(sub, position) * getFatigueFactor(sub)
        }))
        .sort((a, b) => b.score - a.score);
      
      if (candidates.length > 0 && candidates[0].score > 0) {
        suggestions.push({
          playerOut: currentPlayer,
          playerIn: candidates[0].player,
          position,
          reason: reasons.join(', '),
          priority,
          score: candidates[0].score
        });
      }
    }
  }
  
  // Sort by priority and score
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return suggestions.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.score - a.score;
  });
}

/**
 * Optimize lineup for given formation
 */
export function optimizeLineup(
  players: Player[],
  formationPositions: { position: Position; x: number; y: number }[]
): LineupPlayer[] {
  const availablePlayers = players.filter(
    p => p.status === 'available' && !p.notes?.isInjured && !p.notes?.excludeFromOptimizer
  );
  
  const lineup: LineupPlayer[] = [];
  const usedPlayerIds = new Set<string>();
  
  // First pass: assign players to their preferred positions
  for (const formPos of formationPositions) {
    const candidates = availablePlayers
      .filter(p => !usedPlayerIds.has(p.id))
      .filter(p => {
        // Check safe positions constraint
        if (p.notes?.safePositions && p.notes.safePositions.length > 0) {
          return p.notes.safePositions.includes(formPos.position);
        }
        return true;
      })
      .map(p => ({
        player: p,
        score: getPositionScore(p, formPos.position)
      }))
      .sort((a, b) => b.score - a.score);
    
    if (candidates.length > 0 && candidates[0].score > 0) {
      lineup.push({
        playerId: candidates[0].player.id,
        position: formPos.position,
        x: formPos.x,
        y: formPos.y
      });
      usedPlayerIds.add(candidates[0].player.id);
    }
  }
  
  // Second pass: fill remaining positions with best available
  for (const formPos of formationPositions) {
    if (lineup.some(lp => lp.position === formPos.position && lp.x === formPos.x && lp.y === formPos.y)) {
      continue;
    }
    
    const candidates = availablePlayers
      .filter(p => !usedPlayerIds.has(p.id))
      .map(p => ({
        player: p,
        score: getPositionScore(p, formPos.position)
      }))
      .sort((a, b) => b.score - a.score);
    
    if (candidates.length > 0) {
      lineup.push({
        playerId: candidates[0].player.id,
        position: formPos.position,
        x: formPos.x,
        y: formPos.y
      });
      usedPlayerIds.add(candidates[0].player.id);
    }
  }
  
  return lineup;
}
