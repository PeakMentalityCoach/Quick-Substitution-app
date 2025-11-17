import { Router, Request, Response } from 'express';
import { CreatePlayerDto, UpdatePlayerDto, Position } from '../types';
import {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../db/storage';

const router = Router();

/**
 * Validation helpers
 */

const VALID_POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'ATT'];

function validatePosition(position: any): position is Position {
  return VALID_POSITIONS.includes(position);
}

function validatePositions(positions: any): positions is Position[] {
  return (
    Array.isArray(positions) &&
    positions.length > 0 &&
    positions.every(validatePosition)
  );
}

function validateRating(rating: any): rating is number {
  return (
    typeof rating === 'number' &&
    !isNaN(rating) &&
    rating >= 0 &&
    rating <= 100
  );
}

function validateCreatePlayerDto(body: any): { valid: boolean; error?: string } {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required and must be a non-empty string' };
  }

  if (!validatePositions(body.positions)) {
    return {
      valid: false,
      error: `Positions must be a non-empty array of valid positions: ${VALID_POSITIONS.join(', ')}`,
    };
  }

  if (!validateRating(body.rating)) {
    return { valid: false, error: 'Rating must be a number between 0 and 100' };
  }

  if (body.notes !== undefined && typeof body.notes !== 'string') {
    return { valid: false, error: 'Notes must be a string if provided' };
  }

  return { valid: true };
}

function validateUpdatePlayerDto(body: any): { valid: boolean; error?: string } {
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return { valid: false, error: 'Name must be a non-empty string if provided' };
    }
  }

  if (body.positions !== undefined) {
    if (!validatePositions(body.positions)) {
      return {
        valid: false,
        error: `Positions must be a non-empty array of valid positions: ${VALID_POSITIONS.join(', ')}`,
      };
    }
  }

  if (body.rating !== undefined) {
    if (!validateRating(body.rating)) {
      return { valid: false, error: 'Rating must be a number between 0 and 100' };
    }
  }

  if (body.notes !== undefined && typeof body.notes !== 'string') {
    return { valid: false, error: 'Notes must be a string if provided' };
  }

  // Ensure at least one field is being updated
  if (!body.name && !body.positions && body.rating === undefined && body.notes === undefined) {
    return { valid: false, error: 'At least one field must be provided for update' };
  }

  return { valid: true };
}

/**
 * GET /players
 * Returns full player list
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch players',
      statusCode: 500,
    });
  }
});

/**
 * GET /players/:id
 * Return one player
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Player ID is required',
        statusCode: 400,
      });
    }

    const player = await getPlayerById(id);

    if (!player) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Player with ID ${id} not found`,
        statusCode: 404,
      });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch player',
      statusCode: 500,
    });
  }
});

/**
 * POST /players
 * Create new player
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = validateCreatePlayerDto(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
        statusCode: 400,
      });
    }

    const playerDto: CreatePlayerDto = {
      name: req.body.name.trim(),
      positions: req.body.positions,
      rating: req.body.rating,
      notes: req.body.notes?.trim(),
    };

    const newPlayer = await createPlayer(playerDto);

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create player',
      statusCode: 500,
    });
  }
});

/**
 * PUT /players/:id
 * Update player (including notes, ratings, positions)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Player ID is required',
        statusCode: 400,
      });
    }

    const validation = validateUpdatePlayerDto(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
        statusCode: 400,
      });
    }

    const updates: UpdatePlayerDto = {};

    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
    }
    if (req.body.positions !== undefined) {
      updates.positions = req.body.positions;
    }
    if (req.body.rating !== undefined) {
      updates.rating = req.body.rating;
    }
    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes.trim();
    }

    const updatedPlayer = await updatePlayer(id, updates);

    if (!updatedPlayer) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Player with ID ${id} not found`,
        statusCode: 404,
      });
    }

    res.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update player',
      statusCode: 500,
    });
  }
});

/**
 * DELETE /players/:id
 * Delete player
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Player ID is required',
        statusCode: 400,
      });
    }

    const deleted = await deletePlayer(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Player with ID ${id} not found`,
        statusCode: 404,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete player',
      statusCode: 500,
    });
  }
});

export default router;
