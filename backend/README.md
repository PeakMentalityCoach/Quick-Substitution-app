# Quick Substitution Backend

Backend API for the Football Optimizer Quick Substitution App.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── middleware/     # Custom middleware
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint TypeScript files
- `npm test` - Run tests

## API Endpoints

- `GET /api/health` - Health check endpoint

TODO: Add more endpoints as they are implemented
