# Postman Testing Guide

## Setup

1. Open Postman
2. Create a new Collection called `LiveCodeArena`
3. Add environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (leave empty, will be set after login)
   - `roomCode`: (will be set after creating battle)
   - `battleId`: (will be set after creating/joining battle)

---

## Step 1: Authentication

### 1.1 Register User 1

**POST** `{{baseUrl}}/auth/register`

```json
{
  "username": "player1",
  "email": "player1@test.com",
  "password": "password123"
}
```

Save `token` from response as `token` environment variable.

### 1.2 Register User 2

**POST** `{{baseUrl}}/auth/register`

```json
{
  "username": "player2",
  "email": "player2@test.com",
  "password": "password123"
}
```

Save `token` from response as `token2` environment variable.

### 1.3 Login (Optional)

**POST** `{{baseUrl}}/auth/login`

```json
{
  "username": "player1",
  "password": "password123"
}
```

---

## Step 2: Create & Join Battle

### 2.1 Player 1: Create Battle

**POST** `{{baseUrl}}/create`
**Headers**: `Authorization: Bearer {{token}}`

Response:
```json
{
  "battleId": "abc123",
  "roomCode": "XYZABC"
}
```

Save `roomCode` and `battleId` in environment.

### 2.2 Player 2: Join Battle

Switch to Player 2 auth or use a second Postman window.

**POST** `{{baseUrl}}/join`
**Headers**: `Authorization: Bearer {{token2}}`

```json
{
  "roomCode": "XYZABC"
}
```

---

## Step 3: WebSocket Connection

Use Postman's Socket.IO client or a tool like [Postman WebSocket](https://www.postman.com/features/web-socket-support/).

### 3.1 Connect

**URL**: `http://localhost:3000`
**Query Param**: `token={{token}}`

### 3.2 Player 1: Join Waiting Room

**Event**: `waiting_room_join`
```json
{
  "roomCode": "{{roomCode}}"
}
```

### 3.3 Player 2: Join Waiting Room

**Event**: `waiting_room_join`
```json
{
  "roomCode": "{{roomCode}}"
}
```

### 3.4 Player 1: Set Ready

**Event**: `player_ready`
```json
{
  "roomCode": "{{roomCode}}",
  "isReady": true
}
```

### 3.5 Player 2: Set Ready

**Event**: `player_ready`
```json
{
  "roomCode": "{{roomCode}}",
  "isReady": true
}
```

---

## Step 4: Start Battle via WebSocket

### 4.1 Player 1: Join Battle Room

**Event**: `join_room`
```json
{
  "roomCode": "{{roomCode}}"
}
```

### 4.2 Player 2: Join Battle Room

**Event**: `join_room`
```json
{
  "roomCode": "{{roomCode}}"
}
```

### 4.3 Player 1: Join Battle (Backend)

**Event**: `battle:join`
```json
{
  "battleId": "{{battleId}}"
}
```

### 4.4 Player 2: Join Battle (Backend)

**Event**: `battle:join`
```json
{
  "battleId": "{{battleId}}"
}
```

Expected response events:
- `battle:ready` - Both players connected
- `battle:start` - Battle started with questions

---

## Step 5: Code Execution

### 5.1 Run Code (Sample Tests Only)

**POST** `{{baseUrl}}/execute`
**Headers**: `Authorization: Bearer {{token}}`

```json
{
  "code": "def solution(x):\n    return x * 2",
  "language": "python",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "10",
      "timeLimitMs": 2000,
      "memoryLimitMb": 128
    }
  ]
}
```

### 5.2 Batch Execute (Multiple Test Cases)

**POST** `{{baseUrl}}/batch`
**Headers**: `Authorization: Bearer {{token}}`

```json
{
  "code": "def solution(x):\n    return x * 2",
  "language": "python",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "10",
      "timeLimitMs": 2000,
      "memoryLimitMb": 128
    },
    {
      "input": "10",
      "expectedOutput": "20",
      "timeLimitMs": 2000,
      "memoryLimitMb": 128
    }
  ]
}
```

---

## Step 6: Battle Submission

**POST** `{{baseUrl}}/{{battleId}}/questions/{{questionId}}/submit`
**Headers**: `Authorization: Bearer {{token}}`

```json
{
  "code": "def solution(x):\n    return x * 2",
  "language": "python"
}
```

---

## Step 7: View Results

**GET** `{{baseUrl}}/{{battleId}}/results`
**Headers**: `Authorization: Bearer {{token}}`

---

## Step 8: AI Features

### 8.1 Review Code

**POST** `{{baseUrl}}/ai/review`

```json
{
  "code": "def solution(x):\n    return x * 2",
  "language": "python"
}
```

### 8.2 Chat with AI

**POST** `{{baseUrl}}/ai/chat`

```json
{
  "message": "How do I optimize this code?",
  "code": "def solution(x):\n    return x * 2",
  "language": "python"
}
```

---

## Quick Test Sequence

1. Register 2 users
2. Player 1 creates battle → save roomCode
3. Player 2 joins battle with roomCode
4. Both connect WebSocket, join waiting room
5. Both set ready
6. Both join battle room and send `battle:join`
7. Receive `battle:start` with questions
8. Submit code via REST
9. View results after battle ends
