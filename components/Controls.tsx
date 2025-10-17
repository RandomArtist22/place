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
    <div className="flex flex-col items-center gap-4">
      <button 
        onClick={onToggleViewMode} 
        className="p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
        aria-label="Enter view mode"
      >
        <EyeIcon className="w-6 h-6 text-gray-300" />
      </button>
      <ColorPalette selectedColor={selectedColor} onColorSelect={onColorSelect} />
    </div>
  );
};

export default Controls;
