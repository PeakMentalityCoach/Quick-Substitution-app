import { FastifyInstance } from 'fastify';
import { Player } from '../types/index.js';
import * as db from '../db/storage.js';

export default async function playersRoutes(fastify: FastifyInstance) {
  // Get all players
  fastify.get('/', {
    schema: {
      description: 'Get all players in the squad',
      tags: ['players'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              jerseyNumber: { type: 'number' },
              positions: { type: 'array', items: { type: 'string' } },
              ratings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    position: { type: 'string' },
                    rating: { type: 'number' }
                  }
                }
              },
              notes: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const players = await db.getPlayers();
    return players;
  });

  // Get single player
  fastify.get('/:id', {
    schema: {
      description: 'Get a single player by ID',
      tags: ['players'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            jerseyNumber: { type: 'number' },
            positions: { type: 'array', items: { type: 'string' } },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'string' },
                  rating: { type: 'number' }
                }
              }
            },
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
    const { id } = request.params as { id: string };
    const player = await db.getPlayer(id);

    if (!player) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    return player;
  });

  // Create new player
  fastify.post('/', {
    schema: {
      description: 'Create a new player',
      tags: ['players'],
      body: {
        type: 'object',
        required: ['id', 'name', 'jerseyNumber', 'positions', 'ratings'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          jerseyNumber: { type: 'number' },
          positions: { type: 'array', items: { type: 'string' } },
          ratings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                position: { type: 'string' },
                rating: { type: 'number' }
              }
            }
          },
          notes: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            jerseyNumber: { type: 'number' },
            positions: { type: 'array', items: { type: 'string' } },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'string' },
                  rating: { type: 'number' }
                }
              }
            },
            notes: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const player = request.body as Player;
    const created = await db.createPlayer(player);
    reply.code(201);
    return created;
  });

  // Update player
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing player',
      tags: ['players'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          jerseyNumber: { type: 'number' },
          positions: { type: 'array', items: { type: 'string' } },
          ratings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                position: { type: 'string' },
                rating: { type: 'number' }
              }
            }
          },
          notes: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            jerseyNumber: { type: 'number' },
            positions: { type: 'array', items: { type: 'string' } },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'string' },
                  rating: { type: 'number' }
                }
              }
            },
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
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<Player>;
    const updated = await db.updatePlayer(id, updates);

    if (!updated) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    return updated;
  });

  // Delete player
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a player',
      tags: ['players'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        204: {
          type: 'null',
          description: 'Player deleted successfully'
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
    const { id } = request.params as { id: string };
    const deleted = await db.deletePlayer(id);

    if (!deleted) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    reply.code(204);
    return;
  });
}
