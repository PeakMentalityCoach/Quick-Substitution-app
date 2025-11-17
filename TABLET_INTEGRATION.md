# Tablet Coach Match Mode - Integration Guide

This guide explains how to integrate the new tablet-optimized Coach Match Mode into your existing Football Optimizer application.

## Quick Start

### 1. Dependencies Already Installed
The required `@dnd-kit` packages have been installed. Verify with:

```bash
npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

If needed, reinstall:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. File Structure

All tablet-specific files are located in `/src/tablet/`:

```
src/tablet/
├── TabletMatchView.tsx          # Main component (entry point)
├── TabletLineupView.tsx          # Lineup management with drag-and-drop
├── TabletBenchView.tsx           # Bench player selection
├── TabletSetPieceView.tsx        # Set piece visualization
├── TabletNotesDrawer.tsx         # Notes and metadata drawer
├── TabletSubstitutionFlow.tsx    # Multi-step substitution workflow
├── TabletNavigation.tsx          # Three-tab navigation
├── hooks/
│   └── useMatchMode.ts           # Match state management hook
├── styles/
│   └── tablet.css                # Complete tablet styling
└── animations/
    └── tablet.ts                 # Animation utilities
```

## Integration Methods

### Method 1: Add as a New Route (Recommended)

Add a new route to your app for tablet mode:

#### Step 1: Update App.tsx or your routing file

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TabletMatchView from './tablet/TabletMatchView';
// ... other imports

function App() {
  // Load squad and game state from localStorage or state management
  const squad = JSON.parse(localStorage.getItem('squad') || '[]');
  const gameState = JSON.parse(localStorage.getItem('gameState') || 'null');

  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<SquadManager />} />
        <Route path="/lineup" element={<LineupBuilder />} />
        <Route path="/in-game" element={<InGame />} />
        <Route path="/set-pieces" element={<SetPieces />} />

        {/* New tablet route */}
        <Route
          path="/tablet-match"
          element={
            <TabletMatchView
              gameState={gameState}
              allPlayers={squad}
            />
          }
        />
      </Routes>
    </Router>
  );
}
```

#### Step 2: Add a "Launch Tablet Mode" button

In your `InGame.tsx` or navigation:

```tsx
import { useNavigate } from 'react-router-dom';
import { Tablet } from 'lucide-react';

function InGame() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ... existing in-game UI */}

      <button
        onClick={() => navigate('/tablet-match')}
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
      >
        <Tablet size={24} />
        Launch Tablet Mode
      </button>
    </div>
  );
}
```

### Method 2: Conditional Rendering Based on Screen Size

Automatically show tablet UI on tablet devices:

```tsx
import { useState, useEffect } from 'react';
import TabletMatchView from './tablet/TabletMatchView';
import InGame from './pages/InGame';

function AdaptiveInGame({ gameState, allPlayers }) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscapeTablet = width >= 768 && width <= 1366 && width > height;
      setIsTablet(isLandscapeTablet);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isTablet) {
    return <TabletMatchView gameState={gameState} allPlayers={allPlayers} />;
  }

  return <InGame />;
}
```

### Method 3: Toggle Button

Add a toggle for users to switch between desktop and tablet modes:

```tsx
import { useState } from 'react';
import { Monitor, Tablet } from 'lucide-react';
import TabletMatchView from './tablet/TabletMatchView';
import InGame from './pages/InGame';

function FlexibleInGame({ gameState, allPlayers }) {
  const [mode, setMode] = useState<'desktop' | 'tablet'>('desktop');

  return (
    <div>
      {/* Mode selector */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setMode('desktop')}
          className={`px-4 py-2 rounded-lg ${
            mode === 'desktop' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          <Monitor size={20} />
        </button>
        <button
          onClick={() => setMode('tablet')}
          className={`px-4 py-2 rounded-lg ${
            mode === 'tablet' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          <Tablet size={20} />
        </button>
      </div>

      {/* Render appropriate view */}
      {mode === 'tablet' ? (
        <TabletMatchView gameState={gameState} allPlayers={allPlayers} />
      ) : (
        <InGame />
      )}
    </div>
  );
}
```

## Required Props

The `TabletMatchView` component requires two props:

### `gameState: GameState`

The current game state from your app. Structure:

```typescript
interface GameState {
  lineup: PlayerAssignment[];  // 11 players with positions
  bench: string[];             // Player IDs on the bench
  substitutions: {
    out: string;
    in: string;
    timestamp: number;
  }[];
}
```

**How to get it:**
- From localStorage: `JSON.parse(localStorage.getItem('gameState') || 'null')`
- From your state management (Redux, Context, etc.)
- From your existing InGame component

### `allPlayers: Player[]`

All players in the squad. Structure:

```typescript
interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  positions: string[];  // e.g., ['ST', 'CF', 'CAM']
  ratings: PositionRating[];
}
```

**How to get it:**
- From localStorage: `JSON.parse(localStorage.getItem('squad') || '[]')`
- From your state management
- From your SquadManager component

## Data Persistence

The tablet mode manages its own state during the match, but you may want to sync changes back to your main app:

### Option 1: Event Callbacks

Extend the component to accept callbacks:

```tsx
// In TabletMatchView.tsx (modify)
interface TabletMatchViewProps {
  gameState: GameState;
  allPlayers: Player[];
  onSubstitution?: (sub: { out: string; in: string }) => void;
  onLineupChange?: (lineup: PlayerAssignment[]) => void;
  onTimerUpdate?: (minutes: number) => void;
}
```

### Option 2: Save to localStorage

Add a save function in the component:

```tsx
// Inside TabletMatchView component
useEffect(() => {
  // Save to localStorage whenever match state changes
  localStorage.setItem('gameState', JSON.stringify({
    lineup: matchState.lineup,
    bench: matchState.bench,
    substitutions: gameState.substitutions, // preserve original + new ones
  }));
}, [matchState.lineup, matchState.bench]);
```

## Styling Integration

### CSS Import

The `TabletMatchView` component automatically imports `./styles/tablet.css`. This file:
- Uses a scoped `.tablet-mode` class to avoid conflicts
- Imports Montserrat font from Google Fonts
- Includes all necessary tablet-specific styles

### Tailwind CSS

The tablet components use Tailwind classes alongside custom CSS. Ensure your `tailwind.config.js` includes the tablet directory:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/tablet/**/*.{js,jsx,ts,tsx}",  // Add this line
  ],
  // ... rest of config
}
```

## Testing

### Test on Different Devices

1. **iPad (1024×768)**
   - Open Chrome DevTools
   - Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
   - Select "iPad" preset
   - Rotate to landscape

2. **iPad Pro (1366×1024)**
   - Use "iPad Pro" preset
   - Test both orientations

3. **Real Device Testing**
   - Build and serve: `npm run build && npm run preview`
   - Access from tablet on same network

### Test Substitution Flow

1. Start the match timer
2. Click a player in the lineup (should switch to bench tab)
3. Click a compatible bench player
4. Review preview modal
5. Confirm substitution
6. Verify lineup updates

### Test Notes Drawer

1. Click "Notes" button in header
2. Select a player from the list
3. Add notes and bookings
4. Save and close
5. Reopen to verify persistence

## Troubleshooting

### Issue: Styles not loading

**Solution:** Ensure the CSS import is present at the top of TabletMatchView.tsx:
```tsx
import './styles/tablet.css';
```

### Issue: Drag-and-drop not working

**Solution:** Verify @dnd-kit packages are installed:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Issue: TypeScript errors

**Solution:** Make sure all imports use relative paths correctly. From any tablet component:
```tsx
import { Player } from '../types';  // Up one level to src/types
import { optimizeLineup } from '../utils/optimizer';  // Up one level to src/utils
```

### Issue: Game state is null

**Solution:** Ensure you have a valid game state. If starting fresh:
```tsx
const defaultGameState: GameState = {
  lineup: [], // Build this from your lineup builder
  bench: [],  // Remaining players
  substitutions: [],
};
```

## Advanced Customization

### Change Timer Speed

In `useMatchMode.ts`, modify the timer interval:

```tsx
// Line ~50
const interval = setInterval(() => {
  // ...
}, 1000); // Change from 60000 (1 real minute) to 1000 (1 second) for demo
```

### Customize Fatigue Calculation

In `useMatchMode.ts`, adjust fatigue increment:

```tsx
// Line ~58
fatigueLevel: Math.min(100, meta.fatigueLevel + 0.5), // Change 0.5 to your value
```

### Add Custom Metadata Fields

Extend the `PlayerMetadata` interface in `useMatchMode.ts`:

```tsx
export interface PlayerMetadata {
  playerId: string;
  minutesPlayed: number;
  bookings: ('yellow' | 'red')[];
  notes: string;
  fatigueLevel: number;
  // Add your custom fields:
  distance?: number;
  touches?: number;
  passAccuracy?: number;
}
```

## Support

For issues or questions:
1. Check this integration guide
2. Review the README.md "Tablet UX" section
3. Examine component source code (heavily commented)
4. Check browser console for errors

## Next Steps

After integration:
1. Test thoroughly on actual tablet devices
2. Gather coach feedback on UX
3. Consider adding data export features
4. Integrate with match video or statistics systems
5. Add real-time sync for multi-device setups

---

**Happy Coaching! ⚽**
