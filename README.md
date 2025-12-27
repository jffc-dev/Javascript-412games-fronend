# Stop! (Tutti Frutti) - Frontend

A real-time multiplayer word game built with Next.js and Socket.IO.

## Features

- 🎮 Real-time multiplayer gameplay
- 🏠 Room creation and joining with unique codes
- 💬 In-game chat
- 📊 Live scoreboard
- 🎯 Customizable categories and rounds
- 🌙 Dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Backend server running (see backend README)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update NEXT_PUBLIC_SOCKET_URL if needed
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main game page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── game/              # Game-specific components
│   │   ├── PlayerList.tsx
│   │   ├── ChatBox.tsx
│   │   ├── GameSettings.tsx
│   │   └── StopGameBoard.tsx
│   └── views/             # Page views
│       ├── HomeView.tsx
│       ├── LobbyView.tsx
│       └── GameView.tsx
├── lib/
│   ├── socket/            # Socket.IO configuration
│   │   ├── socket.ts      # Socket singleton
│   │   ├── useSocket.ts   # Socket hook
│   │   └── constants.ts   # Event names
│   ├── store/             # Zustand store
│   │   └── game.store.ts
│   └── types/             # TypeScript types
│       └── game.types.ts
└── .env.local             # Environment variables
```

## Game Flow

1. **Home Screen**: Create or join a room
2. **Lobby**: Wait for players, configure game settings
3. **Game**: Answer categories with the given letter
4. **Stop**: Press STOP when done, submit answers
5. **Results**: See scores and continue to next round

## Socket Events

### Client → Server
- `createRoom` - Create a new game room
- `joinRoom` - Join existing room
- `leaveRoom` - Leave current room
- `playerReady` - Toggle ready status
- `startGame` - Start the game (host only)
- `gameAction` - Send game actions
- `chatMessage` - Send chat message

### Server → Client
- `connected` - Connection established
- `playerJoined` - Player joined room
- `playerLeft` - Player left room
- `gameStarted` - Game has started
- `gameActionReceived` - Game action from another player
- `chatMessageReceived` - Chat message received

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Backend WebSocket URL | `http://localhost:3001` |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
