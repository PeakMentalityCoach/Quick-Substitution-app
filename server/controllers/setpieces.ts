import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Get all set pieces (optionally filtered by match)
export const getSetPieces = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, type } = req.query;

    // Build where clause
    const where: any = {};

    if (matchId) {
      where.matchId = matchId as string;
      where.match = { userId };
    }

    if (type) {
      where.type = type as string;
    }

    const setPieces = await prisma.setPiece.findMany({
      where,
      include: {
        roles: {
          include: { player: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(setPieces);
  } catch (error) {
    console.error('Error getting set pieces:', error);
    res.status(500).json({ error: 'Failed to get set pieces' });
  }
};

// Get set piece by ID
export const getSetPieceById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const setPiece = await prisma.setPiece.findFirst({
      where: {
        id,
        OR: [
          { matchId: null }, // Global set pieces
          { match: { userId } }, // User's match set pieces
        ],
      },
      include: {
        roles: {
          include: { player: true },
        },
      },
    });

    if (!setPiece) {
      return res.status(404).json({ error: 'Set piece not found' });
    }

    res.json(setPiece);
  } catch (error) {
    console.error('Error getting set piece:', error);
    res.status(500).json({ error: 'Failed to get set piece' });
  }
};

// Create set piece
export const createSetPiece = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, name, type, description, diagram, roles } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Verify match belongs to user if matchId is provided
    if (matchId) {
      const match = await prisma.match.findFirst({
        where: { id: matchId, userId },
      });

      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
    }

    const setPiece = await prisma.setPiece.create({
      data: {
        matchId: matchId || null,
        name,
        type,
        description,
        diagram,
      },
    });

    // Add roles if provided
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        await prisma.setPieceRole.create({
          data: {
            setPieceId: setPiece.id,
            playerId: role.playerId,
            role: role.role,
            position: role.position,
          },
        });
      }
    }

    // Fetch complete set piece
    const completeSetPiece = await prisma.setPiece.findUnique({
      where: { id: setPiece.id },
      include: {
        roles: {
          include: { player: true },
        },
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'setPieceCreated',
        entityType: 'setPiece',
        entityId: setPiece.id,
        newValue: completeSetPiece,
      },
      matchId
    );

    res.status(201).json(completeSetPiece);
  } catch (error) {
    console.error('Error creating set piece:', error);
    res.status(500).json({ error: 'Failed to create set piece' });
  }
};

// Update set piece
export const updateSetPiece = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oldSetPiece = await prisma.setPiece.findFirst({
      where: {
        id,
        OR: [
          { matchId: null },
          { match: { userId } },
        ],
      },
      include: {
        roles: true,
      },
    });

    if (!oldSetPiece) {
      return res.status(404).json({ error: 'Set piece not found' });
    }

    const { name, type, description, diagram, roles } = req.body;

    const setPiece = await prisma.setPiece.update({
      where: { id },
      data: {
        name: name || undefined,
        type: type || undefined,
        description: description !== undefined ? description : undefined,
        diagram: diagram !== undefined ? diagram : undefined,
        lastSyncedAt: new Date(),
      },
    });

    // Update roles if provided
    if (roles && Array.isArray(roles)) {
      // Delete existing roles
      await prisma.setPieceRole.deleteMany({
        where: { setPieceId: id },
      });

      // Add new roles
      for (const role of roles) {
        await prisma.setPieceRole.create({
          data: {
            setPieceId: id,
            playerId: role.playerId,
            role: role.role,
            position: role.position,
          },
        });
      }
    }

    // Fetch complete set piece
    const completeSetPiece = await prisma.setPiece.findUnique({
      where: { id },
      include: {
        roles: {
          include: { player: true },
        },
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'setPieceUpdated',
        entityType: 'setPiece',
        entityId: id,
        oldValue: oldSetPiece,
        newValue: completeSetPiece,
      },
      setPiece.matchId || undefined
    );

    res.json(completeSetPiece);
  } catch (error) {
    console.error('Error updating set piece:', error);
    res.status(500).json({ error: 'Failed to update set piece' });
  }
};

// Delete set piece
export const deleteSetPiece = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const setPiece = await prisma.setPiece.findFirst({
      where: {
        id,
        OR: [
          { matchId: null },
          { match: { userId } },
        ],
      },
    });

    if (!setPiece) {
      return res.status(404).json({ error: 'Set piece not found' });
    }

    await prisma.setPiece.delete({
      where: { id },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'setPieceDeleted',
        entityType: 'setPiece',
        entityId: id,
        oldValue: setPiece,
      },
      setPiece.matchId || undefined
    );

    res.json({ message: 'Set piece deleted successfully' });
  } catch (error) {
    console.error('Error deleting set piece:', error);
    res.status(500).json({ error: 'Failed to delete set piece' });
  }
};
