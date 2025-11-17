import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Get all players
export const getPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const players = await prisma.player.findMany({
      where: { userId, isActive: true },
      orderBy: { number: 'asc' },
    });

    res.json(players);
  } catch (error) {
    console.error('Error getting players:', error);
    res.status(500).json({ error: 'Failed to get players' });
  }
};

// Get player by ID
export const getPlayerById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const player = await prisma.player.findFirst({
      where: { id, userId },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error getting player:', error);
    res.status(500).json({ error: 'Failed to get player' });
  }
};

// Create player
export const createPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, number, position, preferredFoot, skillLevel, stamina } = req.body;

    if (!name || !number || !position) {
      return res.status(400).json({ error: 'Name, number, and position are required' });
    }

    // Check if player number already exists
    const existing = await prisma.player.findFirst({
      where: { userId, number, isActive: true },
    });

    if (existing) {
      return res.status(400).json({ error: 'Player with this number already exists' });
    }

    const player = await prisma.player.create({
      data: {
        userId,
        name,
        number,
        position,
        preferredFoot,
        skillLevel: skillLevel || 3,
        stamina: stamina || 3,
      },
    });

    // Log event
    await logEvent(userId, {
      eventType: 'playerAdded',
      entityType: 'player',
      entityId: player.id,
      newValue: player,
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
};

// Update player
export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get old player data
    const oldPlayer = await prisma.player.findFirst({
      where: { id, userId },
    });

    if (!oldPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { name, number, position, preferredFoot, skillLevel, stamina, isActive } = req.body;

    // If updating number, check for conflicts
    if (number && number !== oldPlayer.number) {
      const existing = await prisma.player.findFirst({
        where: { userId, number, isActive: true, id: { not: id } },
      });

      if (existing) {
        return res.status(400).json({ error: 'Player with this number already exists' });
      }
    }

    const player = await prisma.player.update({
      where: { id },
      data: {
        name: name || undefined,
        number: number || undefined,
        position: position || undefined,
        preferredFoot: preferredFoot || undefined,
        skillLevel: skillLevel || undefined,
        stamina: stamina || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        lastSyncedAt: new Date(),
      },
    });

    // Log event
    await logEvent(userId, {
      eventType: 'playerUpdated',
      entityType: 'player',
      entityId: player.id,
      oldValue: oldPlayer,
      newValue: player,
    });

    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
};

// Delete player (soft delete)
export const deletePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const player = await prisma.player.findFirst({
      where: { id, userId },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Soft delete
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { isActive: false, lastSyncedAt: new Date() },
    });

    // Log event
    await logEvent(userId, {
      eventType: 'playerDeleted',
      entityType: 'player',
      entityId: id,
      oldValue: player,
    });

    res.json({ message: 'Player deleted successfully', player: updatedPlayer });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
};
