import { prisma } from './prisma';
import { EventLogEntry } from '../types';

export const logEvent = async (
  userId: string,
  entry: EventLogEntry,
  matchId?: string
): Promise<void> => {
  try {
    await prisma.eventLog.create({
      data: {
        userId,
        matchId,
        eventType: entry.eventType,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
        deviceId: entry.deviceId,
      },
    });
  } catch (error) {
    console.error('Error logging event:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

export const getEventLogs = async (
  userId: string,
  filters?: {
    matchId?: string;
    eventType?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }
) => {
  const where: any = { userId };

  if (filters?.matchId) where.matchId = filters.matchId;
  if (filters?.eventType) where.eventType = filters.eventType;
  if (filters?.entityType) where.entityType = filters.entityType;
  if (filters?.startDate || filters?.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  return await prisma.eventLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 100, // Limit to last 100 events
  });
};
