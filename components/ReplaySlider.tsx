import React from 'react';

interface ReplaySliderProps {
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const ReplaySlider: React.FC<ReplaySliderProps> = ({ max, value, onChange }) => {
  const progress = max > 0 ? (value / max) * 100 : 0;
  return (
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${progress}%, #374151 ${progress}%, #374151 100%)`
      }}
    />
  );
};

export default ReplaySlider;
