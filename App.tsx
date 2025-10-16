import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { PencilIcon } from './components/Icons';

const App: React.FC = () => {
  const [pixels, setPixels] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [isViewMode, setIsViewMode] = useState(false);
  const lastUpdatedRef = useRef<number>(0); // To track server-side updates

  // Fetch initial canvas state and set up polling
  useEffect(() => {
    const fetchCanvasState = async () => {
      try {
        const response = await fetch('/api/canvas');
        const data = await response.json();
        if (data.pixels && Array.isArray(data.pixels)) {
          setPixels(data.pixels);
          lastUpdatedRef.current = data.lastUpdated;
        }
      } catch (error) {
        console.error('Failed to fetch canvas state:', error);
        // Initialize with empty canvas if fetch fails
        setPixels(Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill('#FFFFFF'));
      }
    };

    fetchCanvasState(); // Initial fetch

    const pollingInterval = setInterval(fetchCanvasState, 3000); // Poll every 3 seconds
    return () => clearInterval(pollingInterval);
  }, []);

  const placePixel = useCallback(async (x: number, y: number) => {
    try {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, color: selectedColor }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place pixel');
      }

      // Optimistically update UI, server will confirm via polling
      setPixels(prevPixels => {
        const newPixels = [...prevPixels];
        const index = y * CANVAS_WIDTH + x;
        newPixels[index] = selectedColor;
        return newPixels;
      });

    } catch (error) {
      console.error('Error placing pixel:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedColor]);

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
          onToggleViewMode={() => setIsViewMode(true)}
        />
      )}
    </div>
  );
};

export default App;