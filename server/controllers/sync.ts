import { Response } from 'express';
import { AuthRequest, SyncRequest, SyncResponse, ConflictItem } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Main sync endpoint
export const sync = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { deviceId, lastSync, data }: SyncRequest = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const serverTimestamp = new Date();
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    // Update or create sync state
    await prisma.syncState.upsert({
      where: { deviceId },
      update: {
        lastSyncAt: serverTimestamp,
        syncVersion: { increment: 1 },
      },
      create: {
        deviceId,
        userId,
        lastSyncAt: serverTimestamp,
      },
    });

    // Initialize response
    const response: SyncResponse = {
      updates: {},
      serverTimestamp: serverTimestamp.toISOString(),
      conflicts: [],
    };

    // Process incoming data from client
    if (data) {
      // Process players (server-wins for structural data)
      if (data.players && Array.isArray(data.players)) {
        for (const player of data.players) {
          try {
            await syncPlayer(userId, player, deviceId, lastSyncDate, response.conflicts);
          } catch (error) {
            console.error('Error syncing player:', error);
          }
        }
      }

      // Process matches
      if (data.matches && Array.isArray(data.matches)) {
        for (const match of data.matches) {
          try {
            await syncMatch(userId, match, deviceId, lastSyncDate, response.conflicts);
          } catch (error) {
            console.error('Error syncing match:', error);
          }
        }
      }

      // Process lineups
      if (data.lineups && Array.isArray(data.lineups)) {
        for (const lineup of data.lineups) {
          try {
            await syncLineup(userId, lineup, deviceId, lastSyncDate, response.conflicts);
          } catch (error) {
            console.error('Error syncing lineup:', error);
          }
        }
      }

      // Process substitutions
      if (data.substitutions && Array.isArray(data.substitutions)) {
        for (const sub of data.substitutions) {
          try {
            await syncSubstitution(userId, sub, deviceId, lastSyncDate, response.conflicts);
          } catch (error) {
            console.error('Error syncing substitution:', error);
          }
        }
      }

      // Process notes (client-wins for coach priority)
      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          try {
            await syncNote(userId, note, deviceId, lastSyncDate, response.conflicts, true);
          } catch (error) {
            console.error('Error syncing note:', error);
          }
        }
      }

      // Process set pieces
      if (data.setPieces && Array.isArray(data.setPieces)) {
        for (const setPiece of data.setPieces) {
          try {
            await syncSetPiece(userId, setPiece, deviceId, lastSyncDate, response.conflicts);
          } catch (error) {
            console.error('Error syncing set piece:', error);
          }
        }
      }
    }

    // Fetch updates from server (changes since lastSync)
    response.updates.players = await prisma.player.findMany({
      where: {
        userId,
        lastSyncedAt: { gt: lastSyncDate },
      },
    });

    response.updates.matches = await prisma.match.findMany({
      where: {
        userId,
        lastSyncedAt: { gt: lastSyncDate },
      },
    });

    response.updates.lineups = await prisma.lineup.findMany({
      where: {
        match: { userId },
        lastSyncedAt: { gt: lastSyncDate },
      },
      include: {
        players: {
          include: { player: true },
        },
        bench: {
          include: {
            players: {
              include: { player: true },
            },
          },
        },
      },
    });

    response.updates.substitutions = await prisma.substitution.findMany({
      where: {
        match: { userId },
        lastSyncedAt: { gt: lastSyncDate },
      },
    });

    response.updates.notes = await prisma.matchNote.findMany({
      where: {
        match: { userId },
        lastSyncedAt: { gt: lastSyncDate },
      },
    });

    response.updates.setPieces = await prisma.setPiece.findMany({
      where: {
        lastSyncedAt: { gt: lastSyncDate },
        OR: [
          { matchId: null },
          { match: { userId } },
        ],
      },
      include: {
        roles: {
          include: { player: true },
        },
      },
    });

    res.json(response);
  } catch (error) {
    console.error('Error syncing:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
};

// Helper functions for syncing different entity types

async function syncPlayer(
  userId: string,
  clientPlayer: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[]
) {
  const existing = await prisma.player.findUnique({
    where: { id: clientPlayer.id },
  });

  if (!existing) {
    // Create new player
    await prisma.player.create({
      data: {
        id: clientPlayer.id,
        userId,
        name: clientPlayer.name,
        number: clientPlayer.number,
        position: clientPlayer.position,
        preferredFoot: clientPlayer.preferredFoot,
        skillLevel: clientPlayer.skillLevel,
        stamina: clientPlayer.stamina,
        isActive: clientPlayer.isActive,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    // Check for conflicts
    const clientUpdatedAt = new Date(clientPlayer.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      // Conflict detected - server wins for structural data
      conflicts.push({
        entityType: 'player',
        entityId: clientPlayer.id,
        clientVersion: clientPlayer,
        serverVersion: existing,
        resolution: 'server-wins',
      });
    } else {
      // Update player
      await prisma.player.update({
        where: { id: clientPlayer.id },
        data: {
          name: clientPlayer.name,
          number: clientPlayer.number,
          position: clientPlayer.position,
          preferredFoot: clientPlayer.preferredFoot,
          skillLevel: clientPlayer.skillLevel,
          stamina: clientPlayer.stamina,
          isActive: clientPlayer.isActive,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'playerUpdated',
        entityType: 'player',
        entityId: clientPlayer.id,
        oldValue: existing,
        newValue: clientPlayer,
        deviceId,
      });
    }
  }
}

async function syncMatch(
  userId: string,
  clientMatch: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[]
) {
  const existing = await prisma.match.findUnique({
    where: { id: clientMatch.id },
  });

  if (!existing) {
    await prisma.match.create({
      data: {
        id: clientMatch.id,
        userId,
        opponent: clientMatch.opponent,
        date: new Date(clientMatch.date),
        location: clientMatch.location,
        competition: clientMatch.competition,
        status: clientMatch.status,
        score: clientMatch.score,
        notes: clientMatch.notes,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const clientUpdatedAt = new Date(clientMatch.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      conflicts.push({
        entityType: 'match',
        entityId: clientMatch.id,
        clientVersion: clientMatch,
        serverVersion: existing,
        resolution: 'server-wins',
      });
    } else {
      await prisma.match.update({
        where: { id: clientMatch.id },
        data: {
          opponent: clientMatch.opponent,
          date: new Date(clientMatch.date),
          location: clientMatch.location,
          competition: clientMatch.competition,
          status: clientMatch.status,
          score: clientMatch.score,
          notes: clientMatch.notes,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'matchUpdated',
        entityType: 'match',
        entityId: clientMatch.id,
        oldValue: existing,
        newValue: clientMatch,
        deviceId,
      }, clientMatch.id);
    }
  }
}

async function syncLineup(
  userId: string,
  clientLineup: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[]
) {
  const existing = await prisma.lineup.findUnique({
    where: { id: clientLineup.id },
  });

  if (!existing) {
    await prisma.lineup.create({
      data: {
        id: clientLineup.id,
        matchId: clientLineup.matchId,
        formation: clientLineup.formation,
        isActive: clientLineup.isActive,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const clientUpdatedAt = new Date(clientLineup.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      conflicts.push({
        entityType: 'lineup',
        entityId: clientLineup.id,
        clientVersion: clientLineup,
        serverVersion: existing,
        resolution: 'server-wins',
      });
    } else {
      await prisma.lineup.update({
        where: { id: clientLineup.id },
        data: {
          formation: clientLineup.formation,
          isActive: clientLineup.isActive,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'lineupUpdated',
        entityType: 'lineup',
        entityId: clientLineup.id,
        oldValue: existing,
        newValue: clientLineup,
        deviceId,
      }, clientLineup.matchId);
    }
  }
}

async function syncSubstitution(
  userId: string,
  clientSub: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[]
) {
  const existing = await prisma.substitution.findUnique({
    where: { id: clientSub.id },
  });

  if (!existing) {
    await prisma.substitution.create({
      data: {
        id: clientSub.id,
        matchId: clientSub.matchId,
        playerInId: clientSub.playerInId,
        playerOutId: clientSub.playerOutId,
        minute: clientSub.minute,
        reason: clientSub.reason,
        notes: clientSub.notes,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const clientUpdatedAt = new Date(clientSub.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      conflicts.push({
        entityType: 'substitution',
        entityId: clientSub.id,
        clientVersion: clientSub,
        serverVersion: existing,
        resolution: 'server-wins',
      });
    } else {
      await prisma.substitution.update({
        where: { id: clientSub.id },
        data: {
          playerInId: clientSub.playerInId,
          playerOutId: clientSub.playerOutId,
          minute: clientSub.minute,
          reason: clientSub.reason,
          notes: clientSub.notes,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'substitutionUpdated',
        entityType: 'substitution',
        entityId: clientSub.id,
        oldValue: existing,
        newValue: clientSub,
        deviceId,
      }, clientSub.matchId);
    }
  }
}

async function syncNote(
  userId: string,
  clientNote: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[],
  clientWins: boolean = false
) {
  const existing = await prisma.matchNote.findUnique({
    where: { id: clientNote.id },
  });

  if (!existing) {
    await prisma.matchNote.create({
      data: {
        id: clientNote.id,
        matchId: clientNote.matchId,
        content: clientNote.content,
        type: clientNote.type,
        timestamp: new Date(clientNote.timestamp),
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const clientUpdatedAt = new Date(clientNote.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      // Conflict detected - client wins for notes (coach priority)
      conflicts.push({
        entityType: 'note',
        entityId: clientNote.id,
        clientVersion: clientNote,
        serverVersion: existing,
        resolution: clientWins ? 'client-wins' : 'server-wins',
      });

      if (clientWins) {
        await prisma.matchNote.update({
          where: { id: clientNote.id },
          data: {
            content: clientNote.content,
            type: clientNote.type,
            lastSyncedAt: new Date(),
          },
        });
      }
    } else {
      await prisma.matchNote.update({
        where: { id: clientNote.id },
        data: {
          content: clientNote.content,
          type: clientNote.type,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'noteUpdated',
        entityType: 'note',
        entityId: clientNote.id,
        oldValue: existing,
        newValue: clientNote,
        deviceId,
      }, clientNote.matchId);
    }
  }
}

async function syncSetPiece(
  userId: string,
  clientSetPiece: any,
  deviceId: string,
  lastSyncDate: Date,
  conflicts: ConflictItem[]
) {
  const existing = await prisma.setPiece.findUnique({
    where: { id: clientSetPiece.id },
  });

  if (!existing) {
    await prisma.setPiece.create({
      data: {
        id: clientSetPiece.id,
        matchId: clientSetPiece.matchId,
        name: clientSetPiece.name,
        type: clientSetPiece.type,
        description: clientSetPiece.description,
        diagram: clientSetPiece.diagram,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const clientUpdatedAt = new Date(clientSetPiece.updatedAt);
    if (existing.lastSyncedAt > lastSyncDate && clientUpdatedAt > lastSyncDate) {
      conflicts.push({
        entityType: 'setPiece',
        entityId: clientSetPiece.id,
        clientVersion: clientSetPiece,
        serverVersion: existing,
        resolution: 'server-wins',
      });
    } else {
      await prisma.setPiece.update({
        where: { id: clientSetPiece.id },
        data: {
          name: clientSetPiece.name,
          type: clientSetPiece.type,
          description: clientSetPiece.description,
          diagram: clientSetPiece.diagram,
          lastSyncedAt: new Date(),
        },
      });

      await logEvent(userId, {
        eventType: 'setPieceUpdated',
        entityType: 'setPiece',
        entityId: clientSetPiece.id,
        oldValue: existing,
        newValue: clientSetPiece,
        deviceId,
      }, clientSetPiece.matchId);
    }
  }
}
