# Gomoku with Learning AI - Backend

This repository contains the backend API and real-time server code for a Gomoku game featuring a **genetic algorithm-based self-learning AI**.

The backend handles:

- real-time multiplayer (Socket.io)
- AI processing (easy / medium / genetic)
- game room lifecycle
- AI learning, fitness, evolution
- dashboard data aggregation
- bug report storage

Originally a personal portfolio project, it was later expanded and used as a submission for a university Artificial Intelligence course.

## Tech Stack

Node.js + Express  
MongoDB + Mongoose  
Socket.io  
Genetic Algorithm AI  
Modular controllers and event handlers

## API Endpoints

### AI Progress

    GET /api/ai/progress

Returns all saved generations for the dashboard.

### Bug Reports

    POST /api/bugreport/create
    GET /api/bugreport/get
    DELETE /api/bugreport/delete/:id

## Socket.io Event System

### Receivers (on) - Client → Server

| Event                  | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **Matchmaking**        |                                                            |
| _search-game_          | Player starts PvP matchmaking.                             |
| _cancel-search_        | Player cancels matchmaking.                                |
| _create-ai-game_       | Player starts a PvAI game with the selected configuration. |
| **In-game actions**    |                                                            |
| _square-btn-click_     | Player clicks a tile → sends a move to the server.         |
| _request-ai-move_      | Requests the AI to calculate its next move.                |
| **Game end**           |
| _game-end_             | Client informs server that the match ended (winner/draw).  |
| _leave-game-human_     | Player permanently leaves a PvP game.                      |
| _leave-game-ai_        | Player permanently leaves a PvAI game.                     |
| **Leaving midgame**    |
| _midgame-left-human_   | Player leaves a PvP match midgame.                         |
| _midgame-left-ai_      | Player leaves a PvAI match midgame.                        |
| **Reconnect / Reload** |
| _reconnect-room-human_ | Attempt to rejoin a PvP match.                             |
| _reconnect-room-ai_    | Attempt to rejoin a PvAI match.                            |
| _reload-human_         | Client refresh detected (PvP) → restore state.             |
| _reload-ai_            | Client refresh detected (PvAI) → restore state.            |

### Senders (emit) - Server → Client

| Event                             | Description                                  |
| --------------------------------- | -------------------------------------------- |
| **Matchmaking**                   |
| _searching_                       | Server confirms matchmaking started.         |
| _search-error_                    | Error occurred during PvP matchmaking.       |
| _search-canceled_                 | Matchmaking was canceled.                    |
| _game-found_                      | Opponent found → PvP match begins.           |
| _ai-game-created_                 | AI game successfully created.                |
| _ai-game-failed_                  | AI game could not be created.                |
| **In-game actions**               |
| _square-btn-click-${data.roomId}_ | Opponent made a move (PvP).                  |
| _ai-move_                         | AI calculated and returned its move (PvAI).  |
| **Game end**                      |
| _game-ended_                      | Match ended with winner/draw.                |
| _left-game-perma_                 | Match ended permanently (no reconnect).      |
| **Leaving midgame**               |
| _you-left_                        | Informs the player that _they_ left midgame. |
| _opponent-left_                   | Opponent left the game (PvP).                |
| _match-expired_                   | Reconnect timer expired → match closed.      |
| **Reconnect / Reload**            |
| _reconnect-success_\*             | Player successfully rejoined the match.      |
| _reconnect-failed_                | Reconnect attempt failed.                    |
| _opponent-reconnected_            | Opponent successfully rejoined the game.     |

### Broadcasters

| Event        | Description                                                |
| ------------ | ---------------------------------------------------------- |
| _user-count_ | Notifies clients about the current number of online users. |

## AI Architecture

### Difficulty Modes

| Difficulty | Algorithm            |
| ---------- | -------------------- |
| _Easy_     | Random moves         |
| _Medium_   | Heuristic evaluation |
| _Hard_     | Genetic Algorithm    |

### GA Components

- Strategy (weights + fitness)
- Initial population generation
- Fitness update (win/loss/draw)
- Selection (top 50%)
- Crossover (random uniform)
- Mutation (clamped noise)
- New generation creation
- Database persistence

### Models

| Name            | Description         |
| --------------- | ------------------- |
| _Boards_        | game boards         |
| _AI_Strategy_   | strategy snapshots  |
| _AI_Population_ | evolved generations |
| _BugReport_     | user reports        |

## Database Structure

### MongoDB stores

- game boards (for reconnects + AI analysis)
- strategy populations
- fitness history
- bug reports

The backend periodically evolves the AI and pushes updates to all connected dashboards.

## AI Lifecycle

1. Load latest population from DB
2. Pick random strategy
3. AI makes move
4. At game end: update fitness
5. Every N games → evolve population
6. Save + broadcast updates

## Repositories

Backend Repo
(link)

Frontend Repo
(link)
