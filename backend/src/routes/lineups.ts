import { FastifyInstance } from 'fastify';
import { PlayerAssignment, GameState, STANDARD_POSITIONS } from '../types/index.js';
import * as db from '../db/storage.js';
import { optimizeLineup, optimizeSubstitution, calculateLineupScore } from '../utils/optimizer.js';

/**
 * Validates and auto-corrects positions in a lineup
 * Returns corrected lineup if changes were made, or null if lineup is valid
 */
function validateAndCorrectLineup(
  lineup: PlayerAssignment[],
  allPlayers: any[]
): { lineup: PlayerAssignment[]; corrected: boolean; issues: string[] } {
  const issues: string[] = [];
  let needsCorrection = false;

  // Check for invalid positions
  const invalidPositions = lineup.filter(
    (a) => !STANDARD_POSITIONS.includes(a.position)
  );

  if (invalidPositions.length > 0) {
    needsCorrection = true;
    issues.push(
      `Found ${invalidPositions.length} invalid positions: ${invalidPositions
        .map((a) => a.position)
        .join(', ')}`
    );
  }

  // Check for incomplete lineup
  if (lineup.length < 11 || lineup.length > 12) {
    needsCorrection = true;
    issues.push(`Lineup has ${lineup.length} positions (expected 11-12)`);
  }

  // If correction needed, re-optimize
  if (needsCorrection) {
    const playerIds = lineup.map((a) => a.playerId);
    const players = allPlayers.filter((p) => playerIds.includes(p.id));
    const positions = STANDARD_POSITIONS.slice(0, lineup.length || 11);

    const correctedLineup = optimizeLineup(players, positions);

    console.log('🔧 Auto-corrected lineup:', {
      originalLength: lineup.length,
      correctedLength: correctedLineup.length,
      issues,
    });

    return { lineup: correctedLineup, corrected: true, issues };
  }

  return { lineup, corrected: false, issues: [] };
}

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
    let lineup = await db.getCurrentLineup();

    // Auto-heal invalid lineups
    if (lineup && lineup.length > 0) {
      const allPlayers = await db.getPlayers();
      const validation = validateAndCorrectLineup(lineup, allPlayers);

      if (validation.corrected) {
        console.log('⚕️ Auto-healing current lineup on GET');
        lineup = validation.lineup;
        await db.saveCurrentLineup(lineup);
      }
    }

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
            success: { type: 'boolean' },
            corrected: { type: 'boolean' },
            issues: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }, async (request, reply) => {
    let lineup = request.body as PlayerAssignment[];

    // Validate and auto-correct if needed
    if (lineup && lineup.length > 0) {
      const allPlayers = await db.getPlayers();
      const validation = validateAndCorrectLineup(lineup, allPlayers);

      if (validation.corrected) {
        console.log('⚠️ Invalid positions detected on save, auto-correcting');
        lineup = validation.lineup;
      }

      await db.saveCurrentLineup(lineup);
      return {
        success: true,
        corrected: validation.corrected,
        issues: validation.issues,
      };
    }

    await db.saveCurrentLineup(lineup);
    return { success: true, corrected: false, issues: [] };
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

    console.log('🎯 Optimizer running:', {
      numPlayers: players.length,
      numPositions: positions.length,
      positions: positions,
    });

    // Validate positions - replace any invalid ones
    const validPositions = positions.map((pos) => {
      if (!STANDARD_POSITIONS.includes(pos)) {
        console.log(`⚠️ Replacing invalid position '${pos}' with standard position`);
        const index = positions.indexOf(pos);
        return STANDARD_POSITIONS[index] || STANDARD_POSITIONS[0];
      }
      return pos;
    });

    // Ensure we have the right number of positions
    const numPositions = Math.max(11, Math.min(12, players.length));
    const finalPositions = validPositions.slice(0, numPositions);

    // Fill missing positions if needed
    if (finalPositions.length < numPositions) {
      for (let i = finalPositions.length; i < numPositions; i++) {
        if (!finalPositions.includes(STANDARD_POSITIONS[i])) {
          finalPositions.push(STANDARD_POSITIONS[i]);
        }
      }
    }

    // Optimize
    const lineup = optimizeLineup(players, finalPositions);
    const score = calculateLineupScore(lineup, allPlayers);

    console.log('✅ Optimizer completed:', {
      outputSize: lineup.length,
      missingPositions: finalPositions.length - lineup.length,
      score,
    });

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
    let gameState = await db.getGameState();

    // Auto-heal game state if it has invalid positions
    if (gameState && gameState.lineup && gameState.lineup.length > 0) {
      const allPlayers = await db.getPlayers();
      const validation = validateAndCorrectLineup(gameState.lineup, allPlayers);

      if (validation.corrected) {
        console.log('⚕️ Auto-healing game state on GET');
        gameState.lineup = validation.lineup;
        await db.saveGameState(gameState);
      }
    }

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
            success: { type: 'boolean' },
            corrected: { type: 'boolean' },
            issues: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }, async (request, reply) => {
    let gameState = request.body as GameState | null;

    // Validate and auto-correct if needed
    if (gameState && gameState.lineup && gameState.lineup.length > 0) {
      const allPlayers = await db.getPlayers();
      const validation = validateAndCorrectLineup(gameState.lineup, allPlayers);

      if (validation.corrected) {
        console.log('⚠️ Invalid game state detected on save, auto-correcting');
        gameState.lineup = validation.lineup;
      }

      await db.saveGameState(gameState);
      return {
        success: true,
        corrected: validation.corrected,
        issues: validation.issues,
      };
    }

    await db.saveGameState(gameState);
    return { success: true, corrected: false, issues: [] };
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
