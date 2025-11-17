import { FastifyInstance } from 'fastify';
import { PlayerAssignment, GameState } from '../types/index.js';
import * as db from '../db/storage.js';
import { optimizeLineup, optimizeSubstitution, calculateLineupScore } from '../utils/optimizer.js';

export default async function lineupsRoutes(fastify: FastifyInstance) {
  // Get current lineup
  fastify.get('/current', {
    schema: {
      description: 'Get the current lineup',
      tags: ['lineups'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              playerId: { type: 'string' },
              position: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const lineup = await db.getCurrentLineup();
    return lineup;
  });

  // Save current lineup
  fastify.post('/current', {
    schema: {
      description: 'Save the current lineup',
      tags: ['lineups'],
      body: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            playerId: { type: 'string' },
            position: { type: 'string' }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const lineup = request.body as PlayerAssignment[];
    await db.saveCurrentLineup(lineup);
    return { success: true };
  });

  // Optimize lineup
  fastify.post('/optimize', {
    schema: {
      description: 'Optimize lineup for given positions using available players',
      tags: ['lineups'],
      body: {
        type: 'object',
        required: ['playerIds', 'positions'],
        properties: {
          playerIds: { type: 'array', items: { type: 'string' } },
          positions: { type: 'array', items: { type: 'string' } }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            lineup: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  playerId: { type: 'string' },
                  position: { type: 'string' }
                }
              }
            },
            score: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { playerIds, positions } = request.body as { playerIds: string[]; positions: string[] };

    // Get players
    const allPlayers = await db.getPlayers();
    const players = allPlayers.filter(p => playerIds.includes(p.id));

    // Optimize
    const lineup = optimizeLineup(players, positions);
    const score = calculateLineupScore(lineup, allPlayers);

    return { lineup, score };
  });

  // Get game state
  fastify.get('/game-state', {
    schema: {
      description: 'Get the current game state',
      tags: ['lineups'],
      response: {
        200: {
          type: 'object',
          nullable: true,
          properties: {
            lineup: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  playerId: { type: 'string' },
                  position: { type: 'string' }
                }
              }
            },
            bench: { type: 'array', items: { type: 'string' } },
            substitutions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  out: { type: 'string' },
                  in: { type: 'string' },
                  timestamp: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const gameState = await db.getGameState();
    return gameState;
  });

  // Save game state
  fastify.post('/game-state', {
    schema: {
      description: 'Save the game state',
      tags: ['lineups'],
      body: {
        type: 'object',
        nullable: true,
        properties: {
          lineup: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                playerId: { type: 'string' },
                position: { type: 'string' }
              }
            }
          },
          bench: { type: 'array', items: { type: 'string' } },
          substitutions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                out: { type: 'string' },
                in: { type: 'string' },
                timestamp: { type: 'number' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const gameState = request.body as GameState | null;
    await db.saveGameState(gameState);
    return { success: true };
  });

  // Preview substitution
  fastify.post('/substitution-preview', {
    schema: {
      description: 'Preview the effect of a substitution',
      tags: ['lineups'],
      body: {
        type: 'object',
        required: ['currentLineup', 'playerOutId', 'playerInId'],
        properties: {
          currentLineup: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                playerId: { type: 'string' },
                position: { type: 'string' }
              }
            }
          },
          playerOutId: { type: 'string' },
          playerInId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            playerOut: { type: 'object' },
            playerIn: { type: 'object' },
            oldLineup: { type: 'array' },
            newLineup: { type: 'array' },
            changes: { type: 'array' },
            oldScore: { type: 'number' },
            newScore: { type: 'number' },
            scoreDelta: { type: 'number' }
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
    const { currentLineup, playerOutId, playerInId } = request.body as {
      currentLineup: PlayerAssignment[];
      playerOutId: string;
      playerInId: string;
    };

    // Get players
    const allPlayers = await db.getPlayers();
    const playerOut = allPlayers.find(p => p.id === playerOutId);
    const playerIn = allPlayers.find(p => p.id === playerInId);

    if (!playerOut || !playerIn) {
      reply.code(404);
      return { error: 'Player not found' };
    }

    // Get substitution preview
    const preview = optimizeSubstitution(currentLineup, playerOut, playerIn, allPlayers);

    return preview;
  });
}
