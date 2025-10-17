import React, { useState, useEffect } from 'react';
import ColorPalette from './ColorPalette';
import { COOLDOWN_SECONDS } from '../constants';
import { EyeIcon } from './Icons';

interface ControlsProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  cooldownEndTime: number;
  onToggleViewMode: () => void;
}

const Controls: React.FC<ControlsProps> = (props) => {
  const {
    selectedColor, onColorSelect, cooldownEndTime, onToggleViewMode
  } = props;

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((cooldownEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex items-start justify-center gap-2 sm:gap-4">
        <ColorPalette selectedColor={selectedColor} onColorSelect={onColorSelect} />
        <div id="cooldown-timer" className="relative w-20 sm:w-24 text-center flex-shrink-0 mt-2">
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
        <button 
          onClick={onToggleViewMode} 
          className="p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0 mt-2"
          aria-label="Enter view mode"
        >
          <EyeIcon className="w-6 h-6 text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default Controls;
