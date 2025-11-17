import type {
  Player,
  Position,
  LineupPosition,
  OptimizationConfig,
  OptimizationResult,
  PositionScore,
  FormationWeights
} from '../types';
import { calculatePlayerScore } from './scoring';
import { interpretPlayerNotes, applyNoteModifiers } from './interpretNotes';

// Hungarian Algorithm implementation
function hungarianAlgorithm(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const m = costMatrix[0]?.length || 0;

  if (n === 0 || m === 0) return [];

  // Create a copy of the cost matrix
  const matrix = costMatrix.map(row => [...row]);

  // Step 1: Subtract row minimums
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < m; j++) {
      matrix[i][j] -= rowMin;
    }
  }

  // Step 2: Subtract column minimums
  for (let j = 0; j < m; j++) {
    let colMin = Infinity;
    for (let i = 0; i < n; i++) {
      colMin = Math.min(colMin, matrix[i][j]);
    }
    for (let i = 0; i < n; i++) {
      matrix[i][j] -= colMin;
    }
  }

  // Step 3: Find optimal assignment using greedy approach for simplicity
  // (Full Hungarian algorithm is complex; this is a simplified version)
  const assignment: number[] = new Array(n).fill(-1);
  const used = new Set<number>();

  // Greedy assignment: assign zeros first
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (matrix[i][j] === 0 && !used.has(j)) {
        assignment[i] = j;
        used.add(j);
        break;
      }
    }
  }

  // Fill remaining with best available
  for (let i = 0; i < n; i++) {
    if (assignment[i] === -1) {
      let bestJ = -1;
      let bestCost = Infinity;
      for (let j = 0; j < m; j++) {
        if (!used.has(j) && matrix[i][j] < bestCost) {
          bestCost = matrix[i][j];
          bestJ = j;
        }
      }
      if (bestJ !== -1) {
        assignment[i] = bestJ;
        used.add(bestJ);
      }
    }
  }

  return assignment;
}

export function optimizeLineup(
  players: Player[],
  positions: LineupPosition[],
  config: OptimizationConfig
): OptimizationResult {
  const reasoning: string[] = [];
  const warnings: string[] = [];

  if (players.length === 0) {
    return {
      lineup: positions,
      score: 0,
      reasoning: ['No players available'],
      warnings: ['Cannot optimize without players']
    };
  }

  if (positions.length === 0) {
    return {
      lineup: [],
      score: 0,
      reasoning: ['No positions to fill'],
      warnings: []
    };
  }

  reasoning.push(`Optimizing ${positions.length} positions with ${players.length} players`);

  // Interpret notes for all players if enabled
  const notesInterpretations = config.useNotes
    ? players.map(p => interpretPlayerNotes(p.id, p.notes))
    : [];

  if (config.useNotes) {
    const playersWithNotes = notesInterpretations.filter(ni => ni.modifiers.length > 0).length;
    reasoning.push(`Using notes interpretation for ${playersWithNotes} players`);

    notesInterpretations.forEach(ni => {
      warnings.push(...ni.warnings);
    });
  }

  // Build cost matrix for Hungarian algorithm
  const costMatrix: number[][] = [];
  const positionScores: PositionScore[][] = [];

  for (const player of players) {
    const row: number[] = [];
    const scoreRow: PositionScore[] = [];

    const playerNotes = notesInterpretations.find(ni => ni.playerId === player.id);

    for (const pos of positions) {
      // Calculate base score
      const breakdown = calculatePlayerScore(
        player,
        pos.position,
        config.formationWeights,
        [], // TODO: Add adjacent positions calculation
        0
      );

      // Apply notes modifiers if enabled
      let finalScore = breakdown.total;
      if (config.useNotes && playerNotes) {
        finalScore = applyNoteModifiers(finalScore, playerNotes.modifiers, pos.position);
        breakdown.notesModifier = finalScore - breakdown.total;
        breakdown.total = finalScore;
      }

      // Apply fatigue consideration
      if (config.considerFatigue) {
        const fatiguePenalty = player.fatigueLevel * -0.5;
        finalScore += fatiguePenalty;
        breakdown.fatiguePenalty += fatiguePenalty;
        breakdown.total = finalScore;
      }

      // Check availability
      if (!player.isAvailable) {
        finalScore = -1000; // Heavy penalty for unavailable players
        warnings.push(`Player ${player.name} is not available`);
      }

      scoreRow.push({
        player,
        position: pos.position,
        score: finalScore,
        breakdown
      });

      // Cost is negative score (Hungarian minimizes)
      row.push(-finalScore);
    }

    costMatrix.push(row);
    positionScores.push(scoreRow);
  }

  // Run Hungarian algorithm
  const assignment = hungarianAlgorithm(costMatrix);

  // Build optimized lineup
  const optimizedLineup: LineupPosition[] = [];
  let totalScore = 0;

  for (let i = 0; i < assignment.length; i++) {
    const posIndex = assignment[i];
    if (posIndex !== -1 && posIndex < positions.length) {
      const player = players[i];
      const position = positions[posIndex];
      const posScore = positionScores[i][posIndex];

      optimizedLineup.push({
        ...position,
        player
      });

      totalScore += posScore.score;

      reasoning.push(
        `${player.name} → ${position.position} (score: ${posScore.score.toFixed(1)})`
      );
    }
  }

  // Fill any unassigned positions with null
  for (const pos of positions) {
    if (!optimizedLineup.find(lp => lp.position === pos.position)) {
      optimizedLineup.push({
        ...pos,
        player: null
      });
      warnings.push(`No player assigned to ${pos.position}`);
    }
  }

  reasoning.push(`Total lineup score: ${totalScore.toFixed(1)}`);

  return {
    lineup: optimizedLineup,
    score: totalScore,
    reasoning,
    warnings
  };
}

export function getDefaultFormationWeights(): FormationWeights {
  return {
    positionMatch: 0.35,
    attributeMatch: 0.30,
    chemistry: 0.15,
    fatigue: 0.10,
    notes: 0.10
  };
}

export function calculateSubstitutionImpact(
  currentLineup: LineupPosition[],
  playerOut: Player,
  playerIn: Player,
  config: OptimizationConfig
): { scoreDelta: number; newLineup: LineupPosition[] } {
  // Find player out position
  const outPosition = currentLineup.find(lp => lp.player?.id === playerOut.id);
  if (!outPosition) {
    return { scoreDelta: 0, newLineup: currentLineup };
  }

  // Create new lineup with substitution
  const newLineup = currentLineup.map(lp => {
    if (lp.player?.id === playerOut.id) {
      return { ...lp, player: playerIn };
    }
    return lp;
  });

  // Calculate scores
  const oldScore = currentLineup
    .filter(lp => lp.player !== null)
    .reduce((sum, lp) => {
      const breakdown = calculatePlayerScore(
        lp.player!,
        lp.position,
        config.formationWeights
      );
      return sum + breakdown.total;
    }, 0);

  const newScore = newLineup
    .filter(lp => lp.player !== null)
    .reduce((sum, lp) => {
      const breakdown = calculatePlayerScore(
        lp.player!,
        lp.position,
        config.formationWeights
      );
      return sum + breakdown.total;
    }, 0);

  return {
    scoreDelta: newScore - oldScore,
    newLineup
  };
}
