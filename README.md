# Pixel Space AML

A real-time collaborative pixel art canvas built with React, TypeScript, and WebSockets.

## Features

- **Real-time Collaboration** — Live updates across all connected clients via WebSocket
- **Persistent Storage** — Canvas state persisted in Turso (LibSQL)
- **Cooldown System** — Rate limiting to encourage strategic pixel placement
- **Cross-platform** — Responsive design for desktop and mobile

## Tech Stack

| Layer    | Technology                   |
|----------|------------------------------|
| Frontend | React, Vite, TailwindCSS     |
| Backend  | Node.js, ws                  |
| Database | Turso (LibSQL)               |
| Language | TypeScript                   |

## Quick Start

### Prerequisites

- Node.js v16+
- npm or yarn

### Setup

```bash
# Clone and install
git clone <repository-url>
cd place
npm install

# Configure environment
cp .env.example .env
```

Update `.env` with your credentials:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
VITE_WS_URL=ws://localhost:8080
```

### Run

```bash
# Terminal 1: Backend
npx ts-node server.ts

# Terminal 2: Frontend
npm run dev
```

## Usage

1. Select a color from the palette
2. Click any pixel on the grid to paint
3. Wait for cooldown before placing another pixel
4. Toggle View Mode to navigate without accidental edits

## Contributing

Contributions welcome. Submit a pull request or open an issue.

## License

[MIT License](LICENSE)
