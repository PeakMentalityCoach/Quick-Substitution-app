import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import lineupsRouter from './routes/lineups';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/lineups', lineupsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Football Lineup Optimizer - Backend     ║
║   Server running on port ${PORT}            ║
╚════════════════════════════════════════════╝

Available endpoints:
  GET    /health                    - Health check
  GET    /api/lineups               - Fetch saved lineup
  POST   /api/lineups               - Save lineup
  POST   /api/lineups/auto-optimize - Auto-optimize lineup
  POST   /api/lineups/substitute    - Process substitution
  `);
});

export default app;
