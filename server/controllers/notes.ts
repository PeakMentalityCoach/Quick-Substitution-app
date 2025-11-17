import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { logEvent } from '../utils/eventLogger';

// Get notes for a match
export const getNotesByMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { type } = req.query;

    const notes = await prisma.matchNote.findMany({
      where: {
        matchId,
        match: { userId },
        ...(type && { type: type as string }),
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};

// Get note by ID
export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const note = await prisma.matchNote.findFirst({
      where: {
        id,
        match: { userId },
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
};

// Create note
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, content, type } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({ error: 'Match ID and content are required' });
    }

    // Verify match belongs to user
    const match = await prisma.match.findFirst({
      where: { id: matchId, userId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const note = await prisma.matchNote.create({
      data: {
        matchId,
        content,
        type: type || 'general',
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'noteAdded',
        entityType: 'note',
        entityId: note.id,
        newValue: note,
      },
      matchId
    );

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

// Update note
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oldNote = await prisma.matchNote.findFirst({
      where: {
        id,
        match: { userId },
      },
    });

    if (!oldNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { content, type } = req.body;

    const note = await prisma.matchNote.update({
      where: { id },
      data: {
        content: content || undefined,
        type: type || undefined,
        lastSyncedAt: new Date(),
      },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'noteUpdated',
        entityType: 'note',
        entityId: id,
        oldValue: oldNote,
        newValue: note,
      },
      note.matchId
    );

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// Delete note
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const note = await prisma.matchNote.findFirst({
      where: {
        id,
        match: { userId },
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.matchNote.delete({
      where: { id },
    });

    // Log event
    await logEvent(
      userId,
      {
        eventType: 'noteDeleted',
        entityType: 'note',
        entityId: id,
        oldValue: note,
      },
      note.matchId
    );

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
