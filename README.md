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

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
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

### Project Structure
```
src/
├── components/          # React components
│   ├── Layout.tsx
│   ├── PitchView.tsx
│   ├── PlayerCard.tsx
│   ├── AddPlayerModal.tsx
│   ├── SubstitutionPreviewModal.tsx
│   └── SetPieceView.tsx
├── pages/              # Main page components
│   ├── SquadManager.tsx
│   ├── LineupBuilder.tsx
│   ├── InGame.tsx
│   └── SetPieces.tsx
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Utility functions
│   ├── hungarian.ts    # Hungarian algorithm
│   ├── optimizer.ts    # Lineup optimization
│   ├── storage.ts      # localStorage helpers
│   └── setPieces.ts    # Set piece layouts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Tablet UX - Coach Match Mode

A complete tablet-optimized interface designed specifically for iPad and other tablets in landscape orientation. Perfect for real-time match management from the sidelines.

### Features

#### Real-Time Match Management
- **Live Timer**: Track match time with start/pause/reset controls
- **Auto-Update Metadata**: Minutes played and fatigue levels update automatically
- **Substitutions Tracking**: Monitor remaining substitutions (typically 5 per match)
- **Live Score Calculation**: Real-time team rating based on current lineup

#### Touch-Optimized Interface
- **48px Minimum Touch Targets**: All buttons and interactive elements meet accessibility standards
- **Drag-and-Drop**: Rearrange players on the pitch with intuitive touch gestures
- **Large, Clear Typography**: Montserrat font family for professional readability
- **Responsive Scaling**: Adapts to different tablet sizes (iPad, iPad Pro, etc.)
- **Portrait Mode Fallback**: Automatically stacks UI for portrait orientation

#### Quick-Swap Substitution Workflow
1. **Tap OUT**: Select a player from the lineup to substitute
2. **Highlight**: System automatically switches to bench view and highlights compatible players
3. **Tap IN**: Select replacement from the bench
4. **Preview**: Review position changes, score impact, and affected players
5. **Confirm**: Execute the substitution with one tap

#### Player Metadata & Notes
- **Minutes Played**: Auto-tracked for each player
- **Fatigue Tracking**: Visual fatigue bars (0-100%) with color coding
- **Bookings**: Track yellow and red cards with one tap
- **Notes Drawer**: Slide-over drawer for detailed player notes and tactical instructions
- **Search & Filter**: Quickly find players by name or number

#### Coach Override Mode
- **Auto-Optimize** (Default): Uses Hungarian algorithm to find optimal positions
- **Coach Override**: Direct 1-for-1 substitutions maintaining original positions
- **Visual Indicator**: Clear yellow highlight when override mode is active

#### Three-Tab Navigation
1. **Lineup Tab**
   - Pitch view with draggable player positions
   - List view with detailed player cards
   - Live metadata displays
   - Visual formation representation

2. **Bench Tab**
   - All available substitutes
   - Compatibility indicators during substitution flow
   - Sort by name, number, rating, or freshness
   - Search functionality

3. **Set Pieces Tab**
   - Pre-configured tactical layouts
   - Swipe navigation between set pieces
   - Auto-assignment based on current lineup
   - Visual position markers

### Technical Implementation

#### Components
- `TabletMatchView.tsx` - Main container and state orchestrator
- `TabletLineupView.tsx` - Lineup management with drag-and-drop
- `TabletBenchView.tsx` - Bench player selection
- `TabletSetPieceView.tsx` - Set piece visualization
- `TabletNotesDrawer.tsx` - Slide-over notes panel
- `TabletSubstitutionFlow.tsx` - Multi-step substitution wizard
- `TabletNavigation.tsx` - Three-tab navigation component

#### Hooks
- `useMatchMode.ts` - Complete match state management
  - Timer control
  - Player metadata tracking
  - Substitution flow state
  - Fatigue calculations
  - Booking management

#### Styling
- `tablet.css` - Comprehensive tablet-specific styles
  - PMC brand colors and Montserrat font
  - Touch-friendly components
  - Responsive breakpoints
  - Accessibility features (high contrast, reduced motion)

#### Animations
- `tablet.ts` - Animation utilities and configurations
  - Smooth transitions
  - Touch feedback
  - Drag-and-drop effects
  - Stagger animations

#### Dependencies
- `@dnd-kit/core` - Drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - DnD utilities

### Usage

```tsx
import TabletMatchView from './tablet/TabletMatchView';

// In your app
<TabletMatchView
  gameState={currentGameState}
  allPlayers={squadPlayers}
/>
```

### Integration with Existing App

The tablet UX is a standalone module that can be integrated into the existing app:

1. **Import the component** in your routing or main app file
2. **Pass game state** from your existing squad/lineup management
3. **Style loading** - The component automatically imports `tablet.css`
4. **No conflicts** - Uses separate namespace and doesn't interfere with desktop views

### Responsive Design

**Landscape (Primary)**
- iPad: 1024×768 and up
- iPad Pro: 1366×1024
- Optimized spacing and font sizes for each breakpoint

**Portrait (Fallback)**
- Stacked layout with scrolling
- Pitch area gets 60% of vertical space
- Side panels stack below

### Accessibility

- ✅ WCAG 2.1 Level AA compliant touch targets
- ✅ High contrast mode support
- ✅ Reduced motion for vestibular disorders
- ✅ Keyboard navigation support
- ✅ ARIA labels and roles
- ✅ Focus indicators

### Browser Support

- ✅ Safari (iOS 14+)
- ✅ Chrome (Android tablets)
- ✅ Edge (Windows tablets)
- ✅ Firefox (tablet mode)

## Future Enhancements

Potential features for future versions:
- Formation templates (4-3-3, 4-4-2, etc.)
- Match statistics tracking and historical data
- Injury status tracking with return dates
- Custom set piece designer with save functionality
- Multi-team management and switching
- Export lineups and reports as images/PDFs
- Integration with team management systems
- Video analysis integration
- Weather and pitch condition tracking
- Opposition analysis and scouting reports

## License

This project is provided as-is for coaching and educational purposes.

## Credits

Built with modern web technologies and algorithmic optimization for professional football coaching.
