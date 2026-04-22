# API Documentation

**Base URL:** `http://localhost:3000`

---

## Authentication

Protected routes require a Bearer token:
```
Authorization: Bearer <token>
```

---

## Auth Routes

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**Errors:** `400` - Missing fields | `409` - Username/email taken

---

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**Errors:** `400` - Missing fields | `401` - Invalid credentials

---

## Code Runner Routes (Protected)

### POST /execute
Execute Python code.

**Request Body:**
```json
{
  "code": "string (required)",
  "stdin": "string (optional)",
  "timeLimit": "number (optional, seconds, default: 2)",
  "memoryLimit": "number (optional, MB, default: 128)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "OK | TLE | MLE | RE | ERR",
  "stdout": "string",
  "stderr": "string",
  "execTime": "number (ms)"
}
```

**Status Codes:**
- `OK` - Success
- `TLE` - Time Limit Exceeded
- `MLE` - Memory Limit Exceeded
- `RE` - Runtime Error
- `ERR` - Internal Error

---

### POST /batch
Execute multiple code submissions.

**Request Body:**
```json
{
  "submissions": [
    {
      "code": "string",
      "stdin": "string (optional)",
      "timeLimit": "number (optional)",
      "memoryLimit": "number (optional)"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "status": "OK | TLE | MLE | RE | ERR",
      "stdout": "string",
      "stderr": "string",
      "execTime": "number"
    }
  ]
}
```

---

### GET /logs
Get execution logs.

**Query Params:** `limit` (optional, default: 100, max: 500)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "code": "string",
      "stdin": "string",
      "status": "string",
      "stdout": "string",
      "stderr": "string",
      "exec_time": "number"
    }
  ]
}
```

---

## AI Routes

### POST /ai/review
Get AI code review.

**Request Body:**
```json
{
  "code": "string",
  "language": "string"
}
```

**Response (200):**
```json
{
  "text": "string"
}
```

**Errors:** `400` - Code required | `500` - AI failed

---

### POST /ai/chat
Chat with AI assistant.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user | model",
      "parts": [{ "text": "string" }]
    }
  ]
}
```

**Response (200):**
```json
{
  "text": "string"
}
```

**Errors:** `400` - Messages required | `500` - AI failed

---

## Battle Routes

### POST /api/battles/create
Create a new battle room. Player 1 creates and waits for Player 2 to join.

**Response (201):**
```json
{
  "battleId": "uuid",
  "roomCode": "ABC123"
}
```

**Errors:** `401` - Unauthorized | `500` - Failed to create battle

**Notes:** A 5-minute cancel timer starts. If no one joins within 5 minutes, the battle is auto-cancelled.

---

### POST /api/battles/join
Join an existing battle room as Player 2.

**Request Body:**
```json
{
  "roomCode": "string (required)"
}
```

**Response (200):**
```json
{
  "battleId": "uuid"
}
```

**Errors:** `400` - Battle not in PENDING status / Cannot join your own battle | `401` - Unauthorized | `404` - Battle not found | `409` - Battle already has a second player

**Notes:** A 2-minute cancel timer starts. If Player 1 doesn't connect via WebSocket within 2 minutes, the battle is auto-cancelled.

---

### POST /api/battles/:battleId/questions/:questionId/run
Run code against sample test cases (no scoring, no persistence).

**Request Body:**
```json
{
  "code": "string (required)",
  "language": "string (required)"
}
```

**Response (200):**
```json
{
  "results": [
    {
      "passed": true,
      "input": "string",
      "expectedOutput": "string",
      "actualOutput": "string",
      "executionTimeMs": 12,
      "memoryUsedMb": 8
    }
  ]
}
```

**Errors:** `400` - Invalid question ID | `401` - Unauthorized | `403` - Not a player in this battle | `404` - Battle not found | `410` - Battle not ongoing

---

### POST /api/battles/:battleId/questions/:questionId/submit
Submit code against hidden test cases (scored, persisted).

**Request Body:**
```json
{
  "code": "string (required)",
  "language": "string (required)"
}
```

**Response (200):**
```json
{
  "passed": 7,
  "total": 10,
  "points": 140,
  "multiplier": 2
}
```

**Scoring:**
| Difficulty | Multiplier | Points per case | Max (10 cases) |
|------------|------------|-----------------|----------------|
| EASY       | 1x         | 10 pts          | 100 pts        |
| MEDIUM     | 2x         | 20 pts          | 200 pts        |
| HARD       | 3x         | 30 pts          | 300 pts        |

**Errors:** `400` - Invalid question ID | `401` - Unauthorized | `403` - Not a player in this battle | `404` - Battle not found | `410` - Battle not ongoing / Battle time expired

---

### GET /api/battles/:battleId/results
Get battle results (only available after battle ends).

**Response (200):**
```json
{
  "battleId": "uuid",
  "status": "COMPLETED",
  "startedAt": "ISO date string",
  "endedAt": "ISO date string",
  "aiReview": "string",
  "winner": {
    "id": "uuid",
    "username": "string"
  },
  "players": {
    "player1": {
      "id": "uuid",
      "username": "string",
      "baseScore": 340,
      "aiBonus": 25,
      "total": 365
    },
    "player2": {
      "id": "uuid",
      "username": "string",
      "baseScore": 200,
      "aiBonus": 40,
      "total": 240
    }
  },
  "questions": {
    "easy": { "id": "uuid", "title": "Two Sum", ... },
    "medium": { "id": "uuid", "title": "Longest Substring", ... },
    "hard": { "id": "uuid", "title": "Median of Two Sorted Arrays", ... }
  },
  "submissions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "questionId": "uuid",
      "question": { "id": "uuid", "title": "string", "difficulty": "EASY" },
      "code": "string",
      "language": "python",
      "testCasesPassed": 8,
      "pointsEarned": 80,
      "multiplierApplied": 1,
      "executionTimeMs": 45,
      "memoryUsedMb": 12,
      "submittedAt": "ISO date string"
    }
  ]
}
```

**Errors:** `400` - Battle not completed yet | `401` - Unauthorized | `404` - Battle not found

---

## Battle Status Flow

```
PENDING → READY       (Player 2 joins)
READY   → ONGOING     (Both players connect via WebSocket)
ONGOING → COMPLETED   (45-minute timer fires)
PENDING → CANCELLED   (5-min P1 no-show timer fires)
READY   → CANCELLED   (2-min P2 no-WS timer fires)
```

---

## WebSocket Events

**Connection:** Requires `token` in `auth` object or query param
```javascript
io("http://localhost:3000", {
  auth: { token: "jwt_token" }
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `waiting_room_join` | `{ roomCode: string }` | Join waiting room |
| `player_ready` | `{ roomCode: string, isReady: boolean }` | Toggle ready status |
| `join_room` | `{ roomCode: string }` | Join battle room |
| `score_update` | `{ roomCode: string, score: number }` | Update player score |
| `battle:join` | `{ battleId: string }` | Connect to a battle (both players must emit this) |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `opponent_joined` | `{ player: { userId, username, isReady, score } }` | Opponent joined |
| `opponent_ready` | `{ userId: string, isReady: boolean }` | Opponent ready |
| `sync_opponent_score` | `{ score: number }` | Sync opponent score |
| `opponent_score` | `{ userId: string, score: number }` | Opponent score update |
| `opponent_disconnected` | `{ userId: string }` | Opponent left |
| `error` | `{ code: number, message: string }` | Error (4001=bad token, 4003=not ready, 4004=not found) |

### Battle Events

| Event | Payload | Description |
|-------|---------|-------------|
| `battle:ready` | `{}` | Both players registered, waiting for others |
| `battle:start` | `{ endsAt: string, questions: { easy, medium, hard } }` | Battle started |
| `score:update` | `{ player1Score: number, player2Score: number }` | Score changed |
| `battle:player_disconnected` | `{ player: "player1" \| "player2" }` | Player disconnected |
| `battle:end` | `{ cancelled: boolean }` | Battle ended (normal or cancelled) |

---

## Question Payload (in `battle:start`)

```json
{
  "id": "uuid",
  "title": "Two Sum",
  "description": "string",
  "difficulty": "EASY | MEDIUM | HARD",
  "inputFormat": "string",
  "outputFormat": "string",
  "constraints": "string",
  "tags": ["array", "hash-table"],
  "sampleCases": [
    {
      "input": "2 7 11 15\n9",
      "expectedOutput": "0 1",
      "testCaseNumber": 1
    }
  ]
}
```

---

## Error Responses

| Status | Response |
|--------|----------|
| `400` | `{ "error": "message" }` |
| `401` | `{ "error": "No token provided" }` or `{ "error": "Invalid or expired token" }` |
| `403` | `{ "error": "You are not part of this battle" }` |
| `404` | `{ "error": "Battle not found" }` |
| `409` | `{ "error": "Battle already has a second player" }` |
| `410` | `{ "error": "Battle is not ongoing" }` or `{ "error": "Battle time has expired" }` |
| `500` | `{ "error": "message" }` |

---

## Error Responses

| Status | Response |
|--------|----------|
| `400` | `{ "error": "message" }` |
| `401` | `{ "error": "No token provided" }` or `{ "error": "Invalid or expired token" }` |
| `409` | `{ "error": "Username or email already taken" }` |
| `500` | `{ "error": "message" }` |
