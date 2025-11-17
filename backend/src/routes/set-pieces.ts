import { FastifyInstance } from 'fastify';
import { SetPieceLayout } from '../types/index.js';
import * as db from '../db/storage.js';
import { getDefaultSetPieceLayouts } from '../utils/setPieces.js';

export default async function setPiecesRoutes(fastify: FastifyInstance) {
  // Get all set piece layouts
  fastify.get('/', {
    schema: {
      description: 'Get all set piece layouts',
      tags: ['set-pieces'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              positions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    x: { type: 'number' },
                    y: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const layouts = await db.getSetPieceLayouts();
    return layouts;
  });

  // Get default set piece layouts
  fastify.get('/defaults', {
    schema: {
      description: 'Get default set piece layouts',
      tags: ['set-pieces'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              positions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    x: { type: 'number' },
                    y: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return getDefaultSetPieceLayouts();
  });

  // Get single set piece layout
  fastify.get('/:id', {
    schema: {
      description: 'Get a single set piece layout by ID',
      tags: ['set-pieces'],
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
            type: { type: 'string' },
            positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              }
            }
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
    const layout = await db.getSetPieceLayout(id);

    if (!layout) {
      reply.code(404);
      return { error: 'Set piece layout not found' };
    }

    return layout;
  });

  // Create new set piece layout
  fastify.post('/', {
    schema: {
      description: 'Create a new set piece layout',
      tags: ['set-pieces'],
      body: {
        type: 'object',
        required: ['id', 'name', 'type', 'positions'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          positions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' }
              }
            }
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const layout = request.body as SetPieceLayout;
    const created = await db.createSetPieceLayout(layout);
    reply.code(201);
    return created;
  });

  // Update set piece layout
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing set piece layout',
      tags: ['set-pieces'],
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
          type: { type: 'string' },
          positions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              }
            }
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
    const updates = request.body as Partial<SetPieceLayout>;
    const updated = await db.updateSetPieceLayout(id, updates);

    if (!updated) {
      reply.code(404);
      return { error: 'Set piece layout not found' };
    }

    return updated;
  });

  // Delete set piece layout
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a set piece layout',
      tags: ['set-pieces'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        204: {
          type: 'null',
          description: 'Set piece layout deleted successfully'
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
    const deleted = await db.deleteSetPieceLayout(id);

    if (!deleted) {
      reply.code(404);
      return { error: 'Set piece layout not found' };
    }

    reply.code(204);
    return;
  });
}
