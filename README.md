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

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Lucide React** - Icons
- **localStorage** - Data persistence

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

## Project Organization

This project is organized into separate frontend and backend directories:

```
Quick-Substitution-app/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Node.js + Express backend API
└── README.md          # This file
```

## Installation

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Data Persistence

All data is stored in browser localStorage:
- Squad roster
- Current lineup
- Game state
- Substitution history
- Set piece configurations

Data persists across sessions but is browser-specific.

## Development

### Frontend Structure
```
frontend/
├── src/
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
│   │   ├── storage.ts      # localStorage helpers
│   │   └── setPieces.ts    # Set piece layouts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Backend Structure
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
├── tsconfig.json
└── .env.example        # Environment variables template
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
