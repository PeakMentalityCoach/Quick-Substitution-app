# Football Optimizer - Set-Piece & Substitution Manager

A professional web application built with React, TypeScript, and Tailwind CSS for football coaches to manage team lineups, optimize player positions, and handle in-game substitutions intelligently.

## Features

### 1. Squad Manager
- Add, edit, and delete players from your roster
- Define multiple positions each player can play
- Rate each player's ability (1-10) for each position
- Import/Export squad data as JSON
- Visual player cards with ratings and position information

### 2. Lineup Builder
- Select 11 players for your starting lineup
- **Auto-Optimize** feature uses Hungarian Algorithm to assign players to positions based on their ratings
- Visual pitch display showing player positions
- Real-time lineup score calculation
- Save lineup to localStorage

### 3. In-Game Management
- Live substitution engine with intelligent position reshuffling
- Preview substitutions before confirming
- See which players will move positions when a substitution is made
- Score delta calculation (shows if substitution improves or decreases team rating)
- Substitution history tracking
- Visual bench management

### 4. Set Pieces
- Pre-configured tactical layouts for:
  - Offensive Corners (Left & Right)
  - Defensive Corners
  - Free Kicks (Central & Wide)
  - Throw-Ins (Attacking & Defending)
- Visual pitch representations with player assignments
- Position-specific role assignments

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type safety
- **JSON File Storage** - Simple file-based database
- **Swagger/OpenAPI** - API documentation
- **CORS** - Cross-origin resource sharing

### Data Persistence
- **API Backend** - Primary data storage (default)
- **localStorage** - Fallback and offline mode

## Algorithms

### Hungarian Algorithm
The app uses the Hungarian (Munkres) algorithm for optimal player-to-position assignment. This ensures that:
- Players are assigned to positions where they have the highest ratings
- Total team rating is maximized
- No position conflicts occur

### Greedy Fallback
If the Hungarian algorithm encounters issues, a greedy assignment algorithm provides a reliable fallback.

### Substitution Optimization
When making a substitution, the app:
1. Removes the player going out
2. Adds the player coming in
3. Re-optimizes all 11 positions
4. Calculates position changes for all affected players
5. Shows preview with score delta

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd Quick-Substitution-app
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**

Frontend (.env):
```bash
cp .env.example .env
# Edit .env if needed - defaults are fine for local development
```

Backend (backend/.env):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed - defaults are fine for local development
```

5. **Run the application**

**Option 1: Run both frontend and backend (recommended)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Option 2: Run frontend only (offline mode)**
```bash
# Set VITE_USE_API=false in .env to use localStorage
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/docs

### Build for Production

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Preview production frontend
npm run preview
```

## Usage Guide

### Getting Started

1. **Add Your Squad**
   - Navigate to "Squad Manager"
   - Click "Add Player"
   - Enter player details, select positions they can play, and rate them
   - Repeat for all players

2. **Build Your Lineup**
   - Go to "Build Lineup"
   - Select 11 players from available squad
   - Click "Auto-Optimize" to let the algorithm assign optimal positions
   - Review the lineup and total score
   - Click "Start Game" to begin

3. **Make Substitutions**
   - In "In-Game" view, select a player to take out
   - Select a player to bring in
   - Click "Preview Substitution"
   - Review the position changes and score impact
   - Confirm or cancel the substitution

4. **View Set Pieces**
   - Navigate to "Set Pieces"
   - Select from various tactical situations
   - See how your current lineup maps to each set piece

## Key Concepts

### Multi-Player Reshuffling
Unlike simple 1-for-1 substitutions, this app understands that bringing in a new player might require multiple position changes:

**Example:**
- Player OUT: Eddie (currently playing ST)
- Player IN: Alta (can play CAM, not ST)
- Result: Alta moves to CAM, KA shifts to ST, another midfielder adjusts

The system automatically calculates the best configuration for all 11 players.

### Rating-Based Optimization
Every assignment considers:
- Can the player actually play this position? (must be in their positions list)
- What is their rating for this position? (1-10 scale)
- What combination maximizes total team score?

## Data Structure

### Player
```typescript
{
  id: string;
  name: string;
  jerseyNumber: number;
  positions: string[];  // e.g., ['ST', 'CF', 'CAM']
  ratings: [
    { position: 'ST', rating: 9 },
    { position: 'CF', rating: 8 },
    { position: 'CAM', rating: 7 }
  ]
}
```

### Game State
```typescript
{
  lineup: [
    { playerId: 'player-123', position: 'GK' },
    // ... 10 more
  ],
  bench: ['player-456', 'player-789', ...],
  substitutions: [
    { out: 'player-123', in: 'player-456', timestamp: 1234567890 }
  ]
}
```

## API Endpoints

The backend provides a RESTful API with the following endpoints:

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Lineups
- `GET /api/lineups/current` - Get current lineup
- `POST /api/lineups/current` - Save current lineup
- `POST /api/lineups/optimize` - Optimize lineup for given positions
- `GET /api/lineups/game-state` - Get game state
- `POST /api/lineups/game-state` - Save game state
- `POST /api/lineups/substitution-preview` - Preview substitution effect

### Set Pieces
- `GET /api/set-pieces` - Get all set piece layouts
- `GET /api/set-pieces/defaults` - Get default layouts
- `GET /api/set-pieces/:id` - Get single layout
- `POST /api/set-pieces` - Create layout
- `PUT /api/set-pieces/:id` - Update layout
- `DELETE /api/set-pieces/:id` - Delete layout

### Notes
- `GET /api/notes/player/:playerId` - Get player notes
- `PUT /api/notes/player/:playerId` - Update player notes

Full API documentation available at http://localhost:3001/docs when running the backend.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Data Persistence

The application supports two modes of data persistence:

### API Mode (Default)
- Data stored in JSON files on the backend server
- Located in `backend/data/db.json`
- Shared across all browser sessions
- Automatic fallback to localStorage if API unavailable

### Offline Mode
- Set `VITE_USE_API=false` in frontend `.env`
- All data stored in browser localStorage
- Browser-specific, not shared across devices
- No backend required

## Development

### Project Structure
```
Quick-Substitution-app/
├── backend/                  # Backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── players.ts
│   │   │   ├── lineups.ts
│   │   │   ├── set-pieces.ts
│   │   │   └── notes.ts
│   │   ├── db/              # Database layer
│   │   │   └── storage.ts   # JSON file storage
│   │   ├── utils/           # Shared utilities
│   │   │   ├── optimizer.ts # Lineup optimization
│   │   │   ├── hungarian.ts # Hungarian algorithm
│   │   │   └── setPieces.ts # Default layouts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   └── server.ts        # Main server file
│   ├── data/                # JSON database files
│   ├── package.json
│   └── tsconfig.json
├── src/                     # Frontend React app
│   ├── api/                 # API client
│   │   └── client.ts        # Backend API calls
│   ├── components/          # React components
│   │   ├── Layout.tsx
│   │   ├── PitchView.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── AddPlayerModal.tsx
│   │   ├── SubstitutionPreviewModal.tsx
│   │   └── SetPieceView.tsx
│   ├── pages/              # Main page components
│   │   ├── SquadManager.tsx
│   │   ├── LineupBuilder.tsx
│   │   ├── InGame.tsx
│   │   └── SetPieces.tsx
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── hungarian.ts    # Hungarian algorithm
│   │   ├── optimizer.ts    # Lineup optimization
│   │   ├── storage.ts      # Storage abstraction
│   │   └── setPieces.ts    # Set piece layouts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
└── README.md
```

## Future Enhancements

Potential features for future versions:
- Formation templates (4-3-3, 4-4-2, etc.)
- Match statistics tracking
- Player fatigue/stamina management
- Injury status tracking
- Custom set piece designer
- Multi-team management
- Export lineups as images
- Integration with team management systems

## License

This project is provided as-is for coaching and educational purposes.

## Credits

Built with modern web technologies and algorithmic optimization for professional football coaching.
