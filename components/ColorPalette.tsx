import React from 'react';
import { COLORS } from '../constants';

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap gap-3 items-center justify-center py-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 flex-shrink-0 ${
              selectedColor === color ? 'border-cyan-400 scale-110' : 'border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;