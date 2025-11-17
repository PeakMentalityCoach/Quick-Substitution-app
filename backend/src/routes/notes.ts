import { FastifyInstance } from 'fastify';
import * as db from '../db/storage.js';

export default async function notesRoutes(fastify: FastifyInstance) {
  // Get player notes
  fastify.get('/player/:playerId', {
    schema: {
      description: 'Get notes for a specific player',
      tags: ['notes'],
      params: {
        type: 'object',
        properties: {
          playerId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            notes: { type: 'string', nullable: true }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { playerId } = request.params as { playerId: string };
    const notes = await db.getPlayerNotes(playerId);

    if (notes === null) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    return { notes };
  });

  // Update player notes
  fastify.put('/player/:playerId', {
    schema: {
      description: 'Update notes for a specific player',
      tags: ['notes'],
      params: {
        type: 'object',
        properties: {
          playerId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['notes'],
        properties: {
          notes: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            notes: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { playerId } = request.params as { playerId: string };
    const { notes } = request.body as { notes: string };

    const updated = await db.updatePlayerNotes(playerId, notes);

    if (!updated) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    return { success: true, notes };
  });
}
