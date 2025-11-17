import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Get lineups for a match
export const getLineupsByMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const lineups = await prisma.lineup.findMany({
      where: {
        matchId,
        match: { userId },
      },
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
    });

    res.json(lineups);
  } catch (error) {
    console.error('Error getting lineups:', error);
    res.status(500).json({ error: 'Failed to get lineups' });
  }
};

// Create lineup
export const createLineup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, formation, players, benchPlayers } = req.body;

    if (!matchId || !formation) {
      return res.status(400).json({ error: 'Match ID and formation are required' });
    }

    // Verify match belongs to user
    const match = await prisma.match.findFirst({
      where: { id: matchId, userId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Create lineup with players
    const lineup = await prisma.lineup.create({
      data: {
        matchId,
        formation,
        isActive: true,
      },
    });

    // Add players to lineup
    if (players && Array.isArray(players)) {
      for (const p of players) {
        await prisma.lineupPlayer.create({
          data: {
            lineupId: lineup.id,
            playerId: p.playerId,
            position: p.position,
            positionX: p.positionX,
            positionY: p.positionY,
            order: p.order,
          },
        });
      }
    }

    // Create bench
    const bench = await prisma.bench.create({
      data: {
        lineupId: lineup.id,
      },
    });

    // Add players to bench
    if (benchPlayers && Array.isArray(benchPlayers)) {
      for (const p of benchPlayers) {
        await prisma.benchPlayer.create({
          data: {
            benchId: bench.id,
            playerId: p.playerId,
            order: p.order,
          },
        });
      }
    }

    // Fetch complete lineup
    const completeLineup = await prisma.lineup.findUnique({
      where: { id: lineup.id },
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
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'lineupCreated',
        entityType: 'lineup',
        entityId: lineup.id,
        newValue: completeLineup,
      },
      matchId
    );

    res.status(201).json(completeLineup);
  } catch (error) {
    console.error('Error creating lineup:', error);
    res.status(500).json({ error: 'Failed to create lineup' });
  }
};

// Update lineup
export const updateLineup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oldLineup = await prisma.lineup.findFirst({
      where: {
        id,
        match: { userId },
      },
      include: {
        players: true,
        bench: { include: { players: true } },
      },
    });

    if (!oldLineup) {
      return res.status(404).json({ error: 'Lineup not found' });
    }

    const { formation, players, benchPlayers } = req.body;

    // Update formation
    const lineup = await prisma.lineup.update({
      where: { id },
      data: {
        formation: formation || undefined,
        lastSyncedAt: new Date(),
      },
    });

    // Update players if provided
    if (players && Array.isArray(players)) {
      // Delete existing lineup players
      await prisma.lineupPlayer.deleteMany({
        where: { lineupId: id },
      });

      // Add new players
      for (const p of players) {
        await prisma.lineupPlayer.create({
          data: {
            lineupId: id,
            playerId: p.playerId,
            position: p.position,
            positionX: p.positionX,
            positionY: p.positionY,
            order: p.order,
          },
        });
      }
    }

    // Update bench players if provided
    if (benchPlayers && Array.isArray(benchPlayers)) {
      const bench = await prisma.bench.findFirst({
        where: { lineupId: id },
      });

      if (bench) {
        // Delete existing bench players
        await prisma.benchPlayer.deleteMany({
          where: { benchId: bench.id },
        });

        // Add new bench players
        for (const p of benchPlayers) {
          await prisma.benchPlayer.create({
            data: {
              benchId: bench.id,
              playerId: p.playerId,
              order: p.order,
            },
          });
        }
      }
    }

    // Fetch complete lineup
    const completeLineup = await prisma.lineup.findUnique({
      where: { id },
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
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'lineupUpdated',
        entityType: 'lineup',
        entityId: id,
        oldValue: oldLineup,
        newValue: completeLineup,
      },
      lineup.matchId
    );

    res.json(completeLineup);
  } catch (error) {
    console.error('Error updating lineup:', error);
    res.status(500).json({ error: 'Failed to update lineup' });
  }
};

// Create substitution
export const createSubstitution = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, playerInId, playerOutId, minute, reason, notes } = req.body;

    if (!matchId || !playerInId || !minute) {
      return res.status(400).json({ error: 'Match ID, player in, and minute are required' });
    }

    // Verify match belongs to user
    const match = await prisma.match.findFirst({
      where: { id: matchId, userId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const substitution = await prisma.substitution.create({
      data: {
        matchId,
        playerInId,
        playerOutId,
        minute,
        reason,
        notes,
      },
      include: {
        playerIn: true,
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'substitutionMade',
        entityType: 'substitution',
        entityId: substitution.id,
        newValue: substitution,
      },
      matchId
    );

    res.status(201).json(substitution);
  } catch (error) {
    console.error('Error creating substitution:', error);
    res.status(500).json({ error: 'Failed to create substitution' });
  }
};

// Get substitutions for a match
export const getSubstitutionsByMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const substitutions = await prisma.substitution.findMany({
      where: {
        matchId,
        match: { userId },
      },
      include: {
        playerIn: true,
      },
      orderBy: { minute: 'asc' },
    });

    res.json(substitutions);
  } catch (error) {
    console.error('Error getting substitutions:', error);
    res.status(500).json({ error: 'Failed to get substitutions' });
  }
};

// Delete substitution
export const deleteSubstitution = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const substitution = await prisma.substitution.findFirst({
      where: {
        id,
        match: { userId },
      },
    });

    if (!substitution) {
      return res.status(404).json({ error: 'Substitution not found' });
    }

    await prisma.substitution.delete({
      where: { id },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'substitutionDeleted',
        entityType: 'substitution',
        entityId: id,
        oldValue: substitution,
      },
      substitution.matchId
    );

    res.json({ message: 'Substitution deleted successfully' });
  } catch (error) {
    console.error('Error deleting substitution:', error);
    res.status(500).json({ error: 'Failed to delete substitution' });
  }
};
