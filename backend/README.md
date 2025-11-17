# Football Lineup Optimizer - Backend API

Backend API for managing football lineups with auto-optimization and substitution handling.

## Features

- **Lineup Management**: Save and retrieve lineups with bench players
- **Auto-Optimization**: Automatically optimize player positions using Hungarian Algorithm
- **Smart Substitutions**: Handle substitutions with automatic re-optimization
- **Validation**: Comprehensive validation for lineups and bench
- **Player Notes**: Support for player restrictions (injuries, minute limits, etc.)

## Installation

```bash
cd backend
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Get Saved Lineup
```
GET /api/lineups
```
Returns the currently saved lineup with bench and timestamp.

**Response:**
```json
{
  "lineup": [
    { "playerId": "p1", "position": "GK" },
    { "playerId": "p2", "position": "CB1" }
  ],
  "bench": ["p12", "p13"],
  "updatedAt": "2025-11-17T10:00:00.000Z"
}
```

### Save Lineup
```
POST /api/lineups
```

**Request Body:**
```json
{
  "lineup": [
    { "playerId": "p1", "position": "GK" },
    { "playerId": "p2", "position": "CB1" }
  ],
  "bench": ["p12", "p13"],
  "squad": [
    {
      "id": "p1",
      "name": "John Doe",
      "jerseyNumber": 1,
      "positions": ["GK"],
      "ratings": [{ "position": "GK", "rating": 9 }]
    }
  ]
}
```

**Response:**
```json
{
  "message": "Lineup saved successfully",
  "data": {
    "lineup": [...],
    "bench": [...],
    "updatedAt": "2025-11-17T10:00:00.000Z"
  }
}
```

### Auto-Optimize Lineup
```
POST /api/lineups/auto-optimize
```

Automatically optimizes player assignments to positions using the Hungarian Algorithm.

**Request Body:**
```json
{
  "squad": [
    {
      "id": "p1",
      "name": "Player One",
      "jerseyNumber": 1,
      "positions": ["GK", "CB1"],
      "ratings": [
        { "position": "GK", "rating": 9 },
        { "position": "CB1", "rating": 7 }
      ]
    }
  ],
  "positions": ["GK", "CB1", "CB2", "LB", "RB", "CDM", "CM", "LM", "RM", "CAM", "ST"]
}
```

**Response:**
```json
{
  "optimizedLineup": [
    { "playerId": "p1", "position": "GK" }
  ],
  "optimizedBench": ["p12", "p13"],
  "score": 95
}
```

### Process Substitution
```
POST /api/lineups/substitute
```

Handles a substitution by removing one player, adding another, and re-optimizing the lineup.

**Request Body:**
```json
{
  "out": "p5",
  "in": "p12",
  "currentLineup": [
    { "playerId": "p1", "position": "GK" },
    { "playerId": "p5", "position": "ST" }
  ],
  "squad": [...]
}
```

**Response:**
```json
{
  "lineup": [
    { "playerId": "p1", "position": "GK" },
    { "playerId": "p12", "position": "ST" }
  ],
  "bench": ["p5", "p13"],
  "playerOut": {
    "id": "p5",
    "name": "Player Five",
    "jerseyNumber": 9
  },
  "playerIn": {
    "id": "p12",
    "name": "Player Twelve",
    "jerseyNumber": 17
  }
}
```

## Data Storage

Lineup data is stored in `data/lineups.json` in the project root.

## Algorithm

The backend uses the **Hungarian Algorithm** (Munkres Algorithm) for optimal player-to-position assignment:
- Maximizes total team rating
- Ensures each position is filled by the best available player
- O(n³) time complexity
- Falls back to greedy algorithm if Hungarian fails

## Validation Rules

- Maximum 11 positions in a lineup
- No duplicate positions
- No duplicate players in lineup
- All players must exist in squad
- Bench players cannot be in lineup
- No duplicate players on bench

## Player Notes

The API supports player notes for restrictions:
- `injury` - Player has injury limitations
- `restriction` - Playing time or tactical restrictions
- `general` - General notes

Notes are considered during substitutions (future enhancement for position filtering).

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (validation errors)
- `404` - Resource not found
- `500` - Server error

Error responses include an `error` field with description:
```json
{
  "error": "Lineup cannot have more than 11 positions"
}
```
