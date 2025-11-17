# Football Optimizer Backend API

Backend REST API for the Football Optimizer application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the server is running

### Players API

All player endpoints are prefixed with `/api/players`

#### Get All Players
- **GET** `/api/players`
- Returns an array of all players
- Response: `200 OK`

```json
[
  {
    "id": "player_1234567890_abc123xyz",
    "name": "John Doe",
    "positions": ["MID", "ATT"],
    "rating": 85,
    "notes": "Great passing ability",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Player
- **GET** `/api/players/:id`
- Returns a single player by ID
- Response: `200 OK` or `404 Not Found`

#### Create Player
- **POST** `/api/players`
- Creates a new player
- Request body:

```json
{
  "name": "John Doe",
  "positions": ["MID", "ATT"],
  "rating": 85,
  "notes": "Great passing ability"
}
```

- Validation:
  - `name`: Required, non-empty string
  - `positions`: Required, non-empty array of valid positions (`GK`, `DEF`, `MID`, `ATT`)
  - `rating`: Required, number between 0 and 100
  - `notes`: Optional string

- Response: `201 Created` or `400 Bad Request`

#### Update Player
- **PUT** `/api/players/:id`
- Updates an existing player
- Request body (all fields optional, but at least one required):

```json
{
  "name": "John Doe Updated",
  "positions": ["MID"],
  "rating": 90,
  "notes": "Improved performance"
}
```

- Response: `200 OK`, `400 Bad Request`, or `404 Not Found`

#### Delete Player
- **DELETE** `/api/players/:id`
- Deletes a player by ID
- Response: `204 No Content` or `404 Not Found`

## Data Storage

Player data is stored in JSON format at `backend/data/players.json`. The file is automatically created on first run.

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types without building
