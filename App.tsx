import React, { useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COOLDOWN_SECONDS } from './constants';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { PencilIcon } from './components/Icons';

const App: React.FC = () => {
  const [pixels, setPixels] = useState<string[]>(() =>
    Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill('#FFFFFF')
  );
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [cooldownEndTime, setCooldownEndTime] = useState<number>(0);
  const [isViewMode, setIsViewMode] = useState(false);

  const updatePixel = useCallback((x: number, y: number, color: string) => {
    setPixels(prevPixels => {
        const newPixels = [...prevPixels];
        const index = y * CANVAS_WIDTH + x;
        newPixels[index] = color;
        return newPixels;
    });
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

    updatePixel(x, y, selectedColor);
    setCooldownEndTime(Date.now() + COOLDOWN_SECONDS * 1000);
  }, [cooldownEndTime, selectedColor, updatePixel]);

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