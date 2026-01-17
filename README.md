# Pixel Space AML 🎨

A real-time, collaborative pixel art canvas where users can place pixels on a shared grid. Built with performance and interactivity in mind.

## ✨ Features

- **Real-time Collaboration**: Watch the canvas evolve live as users place pixels.
- **WebSocket Powered**: Instant updates across all connected clients.
- **Persistent State**: Canvas state is saved to a Turso (LibSQL) database.
- **Cooldown System**: Prevents spamming and encourages strategic placement.
- **Responsive Design**: Works on desktop and mobile.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, `ws` (WebSocket)
- **Database**: Turso (LibSQL)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd place
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    
    Fill in your Turso credentials and WebSocket URL:
    ```env
    TURSO_DATABASE_URL=libsql://...
    TURSO_AUTH_TOKEN=...
    VITE_WS_URL=ws://localhost:8080 # or your deployed WS URL
    ```

4.  **Run the Backend**
    ```bash
    npx ts-node server.ts
    ```

5.  **Run the Frontend**
    In a separate terminal:
    ```bash
    npm run dev
    ```

## 🎮 How to Play

1.  Select a color from the palette.
2.  Click on a pixel on the grid to paint it.
3.  Wait for the cooldown to reset before painting again.
4.  Switch to "View Mode" to inspect the artwork without accidental clicks.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
