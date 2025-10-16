import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const CANVAS_FILE = path.resolve(process.cwd(), 'canvas.json');

interface PixelData {
    x: number;
    y: number;
    color: string;
}

interface CanvasState {
    pixels: string[];
    lastUpdated: number;
}

// Initialize canvas state if file doesn't exist
const initializeCanvas = (): CanvasState => {
    const initialPixels = Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill('#FFFFFF');
    const initialState: CanvasState = {
        pixels: initialPixels,
        lastUpdated: Date.now(),
    };
    fs.writeFileSync(CANVAS_FILE, JSON.stringify(initialState, null, 2));
    return initialState;
};

const getCanvasState = (): CanvasState => {
    if (!fs.existsSync(CANVAS_FILE)) {
        return initializeCanvas();
    }
    const data = fs.readFileSync(CANVAS_FILE, 'utf-8');
    return JSON.parse(data);
};

const saveCanvasState = (state: CanvasState) => {
    fs.writeFileSync(CANVAS_FILE, JSON.stringify(state, null, 2));
};

export default async function (request: VercelRequest, response: VercelResponse) {
    if (request.method === 'GET') {
        const state = getCanvasState();
        response.status(200).json(state);
    } else if (request.method === 'POST') {
        const { x, y, color } = request.body as PixelData;

        if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
            return response.status(400).json({ message: 'Invalid pixel data' });
        }

        if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
            return response.status(400).json({ message: 'Pixel coordinates out of bounds' });
        }

        const state = getCanvasState();
        const index = y * CANVAS_WIDTH + x;
        state.pixels[index] = color;
        state.lastUpdated = Date.now();
        saveCanvasState(state);

        response.status(200).json({ message: 'Pixel updated successfully', state });
    } else {
        response.status(405).json({ message: 'Method Not Allowed' });
    }
}