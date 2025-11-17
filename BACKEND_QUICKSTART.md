# Backend API Quick Start Guide

This guide will help you get the Substitution Optimizer backend API up and running quickly.

## Quick Setup (5 minutes)

### 1. Navigate to server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**For Supabase:**
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Settings > Database
4. Paste it into `.env`

### 4. Set up database

```bash
npm run prisma:push
npm run prisma:generate
```

### 5. Start the server

```bash
npm run dev
```

Server will be running at `http://localhost:3001`

## Test the API

### Login with admin code (no email setup needed)

```bash
curl -X POST http://localhost:3001/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@example.com","adminCode":"coach123"}'
```

This returns a JWT token. Copy it and use it in subsequent requests:

```bash
export TOKEN="your-jwt-token-here"

# Get your user info
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Create a player
curl -X POST http://localhost:3001/api/players \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cristiano Ronaldo","number":7,"position":"FWD","skillLevel":5,"stamina":5}'
```

## Frontend Integration

The backend is designed to work with the React frontend. Update your frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Use the API client wrapper at `src/utils/api.ts`:

```typescript
import { authApi, playersApi } from './utils/api';

// Login
const { token, user } = await authApi.loginWithAdminCode('coach@example.com', 'coach123');

// Get players
const players = await playersApi.getAll();

// Create player
const newPlayer = await playersApi.create({
  name: 'Lionel Messi',
  number: 10,
  position: 'FWD',
  skillLevel: 5,
  stamina: 5
});
```

## Key Features

### Authentication
- **Magic Link**: Email-based passwordless login
- **Admin Code**: Quick login without email (development/demo)

### CRUD APIs
- Players
- Matches
- Lineups & Bench
- Substitutions
- Notes
- Set Pieces

### Offline Sync
- Queue actions when offline
- Automatic sync when back online
- Conflict resolution (server-wins for data, client-wins for notes)

### Event Logging
- Tracks all changes
- Useful for audit trails and analytics

## API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login-admin` | POST | Login with admin code |
| `/api/auth/request-magic-link` | POST | Request magic link email |
| `/api/auth/me` | GET | Get current user |
| `/api/players` | GET/POST | List/create players |
| `/api/players/:id` | GET/PATCH/DELETE | Get/update/delete player |
| `/api/matches` | GET/POST | List/create matches |
| `/api/matches/:id` | GET/PATCH/DELETE | Get/update/delete match |
| `/api/lineups` | POST | Create lineup |
| `/api/lineups/match/:matchId` | GET | Get lineups for match |
| `/api/lineups/substitutions` | POST | Create substitution |
| `/api/notes` | POST | Create note |
| `/api/notes/match/:matchId` | GET | Get notes for match |
| `/api/setpieces` | GET/POST | List/create set pieces |
| `/api/sync` | POST | Sync data |

## Next Steps

1. **View Database**: Run `npm run prisma:studio` to open Prisma Studio at http://localhost:5555
2. **Read Full Docs**: See `server/README.md` for complete documentation
3. **Set up Email**: Configure SMTP in `.env` for magic link authentication
4. **Deploy**: Follow deployment guides in README for Railway, Heroku, or Vercel

## Troubleshooting

**Database connection error?**
- Verify your DATABASE_URL in `.env`
- Make sure your database is running
- Check firewall/security settings

**Port 3001 already in use?**
- Change PORT in `.env` to another port (e.g., 3002)

**Prisma client issues?**
- Run `npm run prisma:generate` to regenerate the client

## File Structure

```
server/
├── controllers/      # Business logic
├── routes/          # API endpoints
├── middleware/      # Auth and other middleware
├── utils/          # Helper functions
├── types/          # TypeScript types
├── prisma/         # Database schema
└── server.ts       # Main entry point
```

## Support

- Full documentation: `server/README.md`
- API client: `src/utils/api.ts`
- Database schema: `server/prisma/schema.prisma`

Happy coding! ⚽
