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


  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex items-start justify-center gap-2 sm:gap-4">
        <ColorPalette selectedColor={selectedColor} onColorSelect={onColorSelect} />
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
