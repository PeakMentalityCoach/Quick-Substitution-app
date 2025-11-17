import { Router, Request, Response } from 'express';
import { loadLineups, saveLineups } from '../db/storage';
import { optimizeLineup, calculateLineupScore } from '../utils/optimizer';
import { validateLineupData, validateBench } from '../utils/validation';
import { Player, PlayerAssignment, LineupData } from '../types';

const router = Router();

/**
 * GET /lineups
 * Returns the saved lineup + bench + timestamp
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const lineupData = loadLineups();

    if (!lineupData) {
      return res.status(404).json({ error: 'No lineup data found' });
    }

    res.json(lineupData);
  } catch (error) {
    console.error('Error fetching lineup:', error);
    res.status(500).json({ error: 'Failed to fetch lineup data' });
  }
});

/**
 * POST /lineups
 * Saves a complete lineup object
 * Body: { lineup: PlayerAssignment[], bench: string[], squad: Player[] }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { lineup, bench, squad } = req.body;

    // Validate input
    if (!lineup || !Array.isArray(lineup)) {
      return res.status(400).json({ error: 'Invalid lineup data' });
    }

    if (!bench || !Array.isArray(bench)) {
      return res.status(400).json({ error: 'Invalid bench data' });
    }

    if (!squad || !Array.isArray(squad)) {
      return res.status(400).json({ error: 'Squad data required for validation' });
    }

    // Validate lineup
    const lineupValidation = validateLineupData(lineup, squad);
    if (!lineupValidation.valid) {
      return res.status(400).json({ error: lineupValidation.error });
    }

    // Validate bench
    const benchValidation = validateBench(bench, squad, lineup);
    if (!benchValidation.valid) {
      return res.status(400).json({ error: benchValidation.error });
    }

    // Save lineup data
    const lineupData: LineupData = {
      lineup,
      bench,
      updatedAt: new Date().toISOString(),
    };

    saveLineups(lineupData);

    res.json({
      message: 'Lineup saved successfully',
      data: lineupData,
    });
  } catch (error) {
    console.error('Error saving lineup:', error);
    res.status(500).json({ error: 'Failed to save lineup data' });
  }
});

/**
 * POST /lineups/auto-optimize
 * Accepts list of players (full squad) and returns optimized lineup
 * Body: { squad: Player[], positions: string[] }
 */
router.post('/auto-optimize', (req: Request, res: Response) => {
  try {
    const { squad, positions } = req.body;

    // Validate input
    if (!squad || !Array.isArray(squad)) {
      return res.status(400).json({ error: 'Invalid squad data' });
    }

    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({ error: 'Invalid positions data' });
    }

    if (positions.length > 11) {
      return res.status(400).json({ error: 'Cannot have more than 11 positions' });
    }

    // Optimize the lineup
    const optimizedLineup = optimizeLineup(squad, positions);

    // Calculate score
    const score = calculateLineupScore(optimizedLineup, squad);

    // Determine bench (players not in lineup)
    const lineupPlayerIds = new Set(optimizedLineup.map(a => a.playerId));
    const optimizedBench = squad
      .filter(p => !lineupPlayerIds.has(p.id))
      .map(p => p.id);

    res.json({
      optimizedLineup,
      optimizedBench,
      score,
    });
  } catch (error) {
    console.error('Error optimizing lineup:', error);
    res.status(500).json({ error: 'Failed to optimize lineup' });
  }
});

/**
 * POST /lineups/substitute
 * Handles a single substitution
 * Body: { out: string, in: string, currentLineup: PlayerAssignment[], squad: Player[] }
 */
router.post('/substitute', (req: Request, res: Response) => {
  try {
    const { out, in: inPlayerId, currentLineup, squad } = req.body;

    // Validate input
    if (!out || typeof out !== 'string') {
      return res.status(400).json({ error: 'Invalid "out" player ID' });
    }

    if (!inPlayerId || typeof inPlayerId !== 'string') {
      return res.status(400).json({ error: 'Invalid "in" player ID' });
    }

    if (!currentLineup || !Array.isArray(currentLineup)) {
      return res.status(400).json({ error: 'Invalid current lineup data' });
    }

    if (!squad || !Array.isArray(squad)) {
      return res.status(400).json({ error: 'Squad data required' });
    }

    // Find players
    const playerOut = squad.find(p => p.id === out);
    const playerIn = squad.find(p => p.id === inPlayerId);

    if (!playerOut) {
      return res.status(404).json({ error: `Player not found: ${out}` });
    }

    if (!playerIn) {
      return res.status(404).json({ error: `Player not found: ${inPlayerId}` });
    }

    // Check that playerOut is in current lineup
    const isPlayerInLineup = currentLineup.some(a => a.playerId === out);
    if (!isPlayerInLineup) {
      return res.status(400).json({ error: 'Player to substitute out is not in current lineup' });
    }

    // Check that playerIn is not already in lineup
    const isPlayerInAlreadyInLineup = currentLineup.some(a => a.playerId === inPlayerId);
    if (isPlayerInAlreadyInLineup) {
      return res.status(400).json({ error: 'Player to substitute in is already in lineup' });
    }

    // Get positions from current lineup
    const positions = currentLineup.map(a => a.position);

    // Create new player pool: remove playerOut, add playerIn
    const currentPlayerIds = currentLineup.map(a => a.playerId);
    const newPlayerIds = currentPlayerIds.filter(id => id !== out);
    newPlayerIds.push(inPlayerId);

    const playersForOptimization = squad.filter(p => newPlayerIds.includes(p.id));

    // Check for player notes and apply restrictions if needed
    // For now, we'll use the standard optimizer
    // TODO: In future, add support for player-specific restrictions based on notes
    const hasRestrictions = playerIn.notes && playerIn.notes.length > 0;
    if (hasRestrictions) {
      console.log(`Player ${playerIn.name} has notes/restrictions:`, playerIn.notes);
      // Future enhancement: filter positions or adjust ratings based on notes
    }

    // Re-optimize lineup with new player set
    const newLineup = optimizeLineup(playersForOptimization, positions);

    // Calculate new bench
    const newLineupPlayerIds = new Set(newLineup.map(a => a.playerId));
    const newBench = squad
      .filter(p => !newLineupPlayerIds.has(p.id))
      .map(p => p.id);

    res.json({
      lineup: newLineup,
      bench: newBench,
      playerOut: {
        id: playerOut.id,
        name: playerOut.name,
        jerseyNumber: playerOut.jerseyNumber,
      },
      playerIn: {
        id: playerIn.id,
        name: playerIn.name,
        jerseyNumber: playerIn.jerseyNumber,
      },
    });
  } catch (error) {
    console.error('Error processing substitution:', error);
    res.status(500).json({ error: 'Failed to process substitution' });
  }
});

export default router;
