import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Get all matches
export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { status } = req.query;

    const matches = await prisma.match.findMany({
      where: {
        userId,
        ...(status && { status: status as string }),
      },
      orderBy: { date: 'desc' },
      include: {
        lineups: {
          include: {
            players: {
              include: { player: true },
            },
          },
        },
        substitutions: {
          include: {
            playerIn: true,
          },
        },
      },
    });

    res.json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Get match by ID
export const getMatchById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const match = await prisma.match.findFirst({
      where: { id, userId },
      include: {
        lineups: {
          include: {
            players: {
              include: { player: true },
              orderBy: { order: 'asc' },
            },
            bench: {
              include: {
                players: {
                  include: { player: true },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        substitutions: {
          include: {
            playerIn: true,
          },
          orderBy: { minute: 'asc' },
        },
        matchNotes: {
          orderBy: { timestamp: 'desc' },
        },
        setPieces: {
          include: {
            roles: {
              include: { player: true },
            },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error getting match:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
};

// Create match
export const createMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { opponent, date, location, competition } = req.body;

    if (!opponent || !date) {
      return res.status(400).json({ error: 'Opponent and date are required' });
    }

    const match = await prisma.match.create({
      data: {
        userId,
        opponent,
        date: new Date(date),
        location,
        competition,
        status: 'upcoming',
      },
    });

    // Log event
    await logEvent(userId, {
      eventType: 'matchCreated',
      entityType: 'match',
      entityId: match.id,
      newValue: match,
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
};

// Update match
export const updateMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oldMatch = await prisma.match.findFirst({
      where: { id, userId },
    });

    if (!oldMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { opponent, date, location, competition, status, score, notes } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: {
        opponent: opponent || undefined,
        date: date ? new Date(date) : undefined,
        location: location !== undefined ? location : undefined,
        competition: competition || undefined,
        status: status || undefined,
        score: score !== undefined ? score : undefined,
        notes: notes !== undefined ? notes : undefined,
        lastSyncedAt: new Date(),
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'matchUpdated',
        entityType: 'match',
        entityId: match.id,
        oldValue: oldMatch,
        newValue: match,
      },
      match.id
    );

    res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
};

// Delete match
export const deleteMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const match = await prisma.match.findFirst({
      where: { id, userId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await prisma.match.delete({
      where: { id },
    });

    // Log event
    await logEvent(userId, {
      eventType: 'matchDeleted',
      entityType: 'match',
      entityId: id,
      oldValue: match,
    });

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
};
