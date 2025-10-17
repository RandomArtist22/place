import { createClient } from '@libsql/client';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('Turso database URL or auth token not provided in .env file.');
  process.exit(1);
}

const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

const CANVAS_WIDTH = 50; // From constants.ts
const CANVAS_HEIGHT = 50; // From constants.ts

interface Pixel {
  x: number;
  y: number;
  color: string;
}

async function initializeDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pixels (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color TEXT NOT NULL,
        PRIMARY KEY (x, y)
      );
    `);
    console.log('Pixels table ensured to exist.');

    // Initialize with white pixels if table is empty
    const { rows } = await db.execute('SELECT COUNT(*) as count FROM pixels;');
    const count = (rows[0] as any).count;

    if (count === 0) {
      console.log('Initializing canvas with white pixels...');
      const initialPixels: string[] = Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill('#FFFFFF');
      const insertPromises = [];
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
          const index = y * CANVAS_WIDTH + x;
          insertPromises.push(
            db.execute({
              sql: 'INSERT INTO pixels (x, y, color) VALUES (?, ?, ?)',
              args: [x, y, initialPixels[index]],
            })
          );
        }
      }
      await Promise.all(insertPromises);
      console.log('Canvas initialized with white pixels.');
    }
  } catch (e) {
    console.error('Error initializing database:', e);
    process.exit(1);
  }
}

async function getInitialPixels(): Promise<string[]> {
  const pixelsArray: string[] = Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill('#FFFFFF');
  try {
    const { rows } = await db.execute('SELECT x, y, color FROM pixels;');
    for (const row of rows) {
      const pixel = row as unknown as Pixel;
      const index = pixel.y * CANVAS_WIDTH + pixel.x;
      if (index >= 0 && index < pixelsArray.length) {
        pixelsArray[index] = pixel.color;
      }
    }
  } catch (e) {
    console.error('Error fetching initial pixels:', e);
  }
  return pixelsArray;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async ws => {
  console.log('Client connected');

  // Send initial canvas state to the new client
  const initialPixels = await getInitialPixels();
  ws.send(JSON.stringify({ type: 'initial_pixels', pixels: initialPixels }));

  ws.on('message', async message => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'place_pixel') {
        const { x, y, color } = data;
        if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT && typeof color === 'string') {
          // Update Turso database
          await db.execute({
            sql: 'INSERT INTO pixels (x, y, color) VALUES (?, ?, ?) ON CONFLICT(x, y) DO UPDATE SET color = EXCLUDED.color;',
            args: [x, y, color],
          });

          // Broadcast update to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({ type: 'pixel_update', x, y, color }));
            }
          });
        }
      }
    } catch (e) {
      console.error('Error processing websocket message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

wss.on('listening', () => {
  console.log('WebSocket server started on port 8080');
});

initializeDatabase().then(() => {
  console.log('Server ready.');
});
