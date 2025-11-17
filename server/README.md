# Substitution Optimizer - Backend API

A comprehensive backend API for the Football Substitution Optimizer application. Built with Node.js, Express, TypeScript, Prisma ORM, and Supabase PostgreSQL.

## Features

- **JWT Authentication**: Magic link email authentication and admin code login
- **CRUD APIs**: Complete REST APIs for players, matches, lineups, substitutions, notes, and set pieces
- **Offline Sync**: Robust sync endpoint with conflict resolution
- **Event Logging**: Automatic tracking of all changes
- **Conflict Resolution**:
  - Server-wins for structural data (players, matches, lineups, set pieces)
  - Client-wins for notes (coach priority)
- **TypeScript**: Full type safety
- **Database**: PostgreSQL via Supabase with Prisma ORM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + nodemailer
- **Validation**: Zod

## Project Structure

```
server/
├── controllers/         # Request handlers
│   ├── auth.ts
│   ├── players.ts
│   ├── matches.ts
│   ├── lineups.ts
│   ├── notes.ts
│   ├── setpieces.ts
│   └── sync.ts
├── routes/             # API route definitions
│   ├── auth.ts
│   ├── players.ts
│   ├── matches.ts
│   ├── lineups.ts
│   ├── notes.ts
│   ├── setpieces.ts
│   └── sync.ts
├── middleware/         # Express middleware
│   └── auth.ts
├── utils/             # Utility functions
│   ├── prisma.ts
│   ├── jwt.ts
│   ├── email.ts
│   └── eventLogger.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── prisma/            # Database schema and migrations
│   └── schema.prisma
├── server.ts          # Main application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- SMTP email service (Gmail, SendGrid, etc.)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email Configuration (for magic link authentication)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@substitution-optimizer.com"

# Admin Code (for quick admin access without email)
ADMIN_CODE="coach123"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

#### Setting up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings > Database
3. Copy the "Connection String" (URI format)
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Use this as your `DATABASE_URL` in `.env`

#### Setting up Gmail SMTP

1. Enable 2-factor authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this password as `SMTP_PASSWORD` in `.env`

### 3. Set up Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Push the schema to your database:

```bash
npm run prisma:push
```

Or create migrations (recommended for production):

```bash
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Verify Setup

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

- `POST /api/auth/request-magic-link` - Request magic link email
  ```json
  { "email": "coach@example.com" }
  ```

- `POST /api/auth/verify-magic-link` - Verify magic link token
  ```json
  { "token": "magic-link-token" }
  ```

- `POST /api/auth/login-admin` - Login with admin code
  ```json
  { "email": "coach@example.com", "adminCode": "coach123" }
  ```

- `GET /api/auth/me` - Get current user (requires auth)
- `PATCH /api/auth/profile` - Update user profile (requires auth)

#### Players

- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create player
- `PATCH /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player (soft delete)

#### Matches

- `GET /api/matches` - Get all matches (optional `?status=upcoming`)
- `GET /api/matches/:id` - Get match by ID (includes lineups, subs, notes)
- `POST /api/matches` - Create match
- `PATCH /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

#### Lineups

- `GET /api/lineups/match/:matchId` - Get lineups for match
- `POST /api/lineups` - Create lineup
- `PATCH /api/lineups/:id` - Update lineup

#### Substitutions

- `GET /api/lineups/substitutions/match/:matchId` - Get substitutions for match
- `POST /api/lineups/substitutions` - Create substitution
- `DELETE /api/lineups/substitutions/:id` - Delete substitution

#### Notes

- `GET /api/notes/match/:matchId` - Get notes for match (optional `?type=tactical`)
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Set Pieces

- `GET /api/setpieces` - Get all set pieces (optional `?matchId=...&type=corner`)
- `GET /api/setpieces/:id` - Get set piece by ID
- `POST /api/setpieces` - Create set piece
- `PATCH /api/setpieces/:id` - Update set piece
- `DELETE /api/setpieces/:id` - Delete set piece

#### Sync

- `POST /api/sync` - Sync data between client and server
  ```json
  {
    "deviceId": "device-uuid",
    "lastSync": "2024-01-15T10:00:00.000Z",
    "data": {
      "players": [...],
      "matches": [...],
      "lineups": [...],
      "substitutions": [...],
      "notes": [...],
      "setPieces": [...]
    }
  }
  ```

## Database Management

### Prisma Studio

View and edit your database with Prisma Studio:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### Migrations

Create a new migration:

```bash
npm run prisma:migrate
```

### Reset Database

⚠️ Warning: This will delete all data!

```bash
npx prisma migrate reset
```

## Building for Production

### 1. Build TypeScript

```bash
npm run build
```

This creates a `dist/` directory with compiled JavaScript.

### 2. Start Production Server

```bash
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/server.js --name "sub-optimizer-api"
```

## Deployment

### Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   railway init
   ```

3. Add PostgreSQL:
   ```bash
   railway add --database postgresql
   ```

4. Set environment variables:
   ```bash
   railway variables set JWT_SECRET="your-secret"
   railway variables set ADMIN_CODE="your-code"
   # Set other variables...
   ```

5. Deploy:
   ```bash
   railway up
   ```

### Deploy to Heroku

1. Install Heroku CLI and login:
   ```bash
   heroku login
   ```

2. Create Heroku app:
   ```bash
   heroku create sub-optimizer-api
   ```

3. Add PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set ADMIN_CODE="your-code"
   # Set other variables...
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

6. Run migrations:
   ```bash
   heroku run npm run prisma:push
   ```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server/server.ts"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard

## Testing

### Manual Testing with curl

Test authentication:

```bash
# Request magic link
curl -X POST http://localhost:3001/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@example.com","adminCode":"coach123"}'

# Use the returned token
export TOKEN="your-jwt-token"

# Get current user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Create a player
curl -X POST http://localhost:3001/api/players \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","number":10,"position":"MID","skillLevel":4,"stamina":5}'

# Get all players
curl http://localhost:3001/api/players \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if database server is running
- Ensure IP is whitelisted (for cloud databases)

### Email Not Sending

- Verify SMTP credentials
- Check if less secure apps is enabled (Gmail)
- Try using app-specific password

### Port Already in Use

Change the PORT in `.env` or kill the process:

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Prisma Client Issues

Regenerate Prisma client:

```bash
npm run prisma:generate
```

## Security Best Practices

1. **Never commit `.env` file** - Keep secrets secure
2. **Use strong JWT_SECRET** - Generate random 64+ character string
3. **Enable HTTPS in production** - Use SSL/TLS certificates
4. **Implement rate limiting** - Prevent abuse
5. **Validate all inputs** - Use Zod or similar
6. **Keep dependencies updated** - Run `npm audit` regularly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Email: support@substitution-optimizer.com

---

Built with ⚽ for coaches who care about optimal substitutions
