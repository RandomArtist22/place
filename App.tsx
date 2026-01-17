import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COOLDOWN_SECONDS } from './constants';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { PencilIcon } from './components/Icons';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

const App: React.FC = () => {
  const [pixels, setPixels] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [cooldownEndTime, setCooldownEndTime] = useState<number>(0);
  const [isViewMode, setIsViewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // New state for timer
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((cooldownEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime]); // Depend on cooldownEndTime

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

      <div className="absolute top-4 left-4 text-white text-2xl font-bold pixelated-font">
        Pixel Space <br /> AML
      </div>

      {isViewMode ? (
        <button
          onClick={() => setIsViewMode(false)}
          className="absolute top-4 right-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
          aria-label="Enter edit mode"
        >
          <PencilIcon className="w-6 h-6" />
        </button>
      ) : (
        <Controls
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          onToggleViewMode={() => setIsViewMode(true)}
        />
      )}
      <div id="cooldown-timer" className="absolute top-4 right-28 w-20 sm:w-24 text-center flex-shrink-0">
        <div className="bg-gray-700 h-10 rounded-md flex items-center justify-center">
          {timeLeft > 0 ? (
            <span className="text-lg sm:text-xl font-mono text-orange-400">{timeLeft}s</span>
          ) : (
            <span className="text-lg sm:text-xl font-mono text-green-400">Ready</span>
          )}
        </div>
        {timeLeft > 0 &&
            <div 
                className="absolute top-0 left-0 h-full bg-cyan-500 bg-opacity-50 rounded-md"
                style={{ width: `${(1 - (timeLeft / COOLDOWN_SECONDS)) * 100}%` }}
            />
        }
      </div>
    </div>
  );
};

export default App;
