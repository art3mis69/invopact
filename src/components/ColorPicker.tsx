import React from 'react';
import { ACCENT_COLORS } from '../utils/formatters';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Accent:</span>
      <div className="flex items-center gap-1.5">
        {ACCENT_COLORS.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onChange(color.hex)}
              className={`w-6 h-6 rounded-full transition-all duration-150 relative cursor-pointer ${
                isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm' : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select ${color.name} accent`}
            />
          );
        })}
      </div>
    </div>
  );
};
