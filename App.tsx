import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COOLDOWN_SECONDS } from './constants';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { PencilIcon } from './components/Icons';

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL; // WebSocket server URL

const App: React.FC = () => {
  const [pixels, setPixels] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [cooldownEndTime, setCooldownEndTime] = useState<number>(0);
  const [isViewMode, setIsViewMode] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type === 'initial_pixels') {
        setPixels(data.pixels);
      } else if (data.type === 'pixel_update') {
        setPixels(prevPixels => {
          const newPixels = [...prevPixels];
          const index = data.y * CANVAS_WIDTH + data.x;
          newPixels[index] = data.color;
          return newPixels;
        });
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = error => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const placePixel = useCallback((x: number, y: number) => {
    if (Date.now() < cooldownEndTime) {
      const timerElement = document.getElementById('cooldown-timer');
      if (timerElement) {
        timerElement.classList.add('animate-shake');
        setTimeout(() => timerElement.classList.remove('animate-shake'), 500);
      }
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'place_pixel', x, y, color: selectedColor }));
      setCooldownEndTime(Date.now() + COOLDOWN_SECONDS * 1000);
    }
  }, [cooldownEndTime, selectedColor]);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col font-sans overflow-hidden relative">
      <div className="flex-1 overflow-hidden">
        <Canvas 
          pixels={pixels} 
          onPlacePixel={placePixel} 
          isViewMode={isViewMode} 
        />
      </div>

      {isViewMode ? (
        <button
          onClick={() => setIsViewMode(false)}
          className="absolute bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
          aria-label="Enter edit mode"
        >
          <PencilIcon className="w-6 h-6" />
        </button>
      ) : (
        <Controls
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          cooldownEndTime={cooldownEndTime}
          onToggleViewMode={() => setIsViewMode(true)}
        />
      )}
    </div>
  );
};

export default App;
