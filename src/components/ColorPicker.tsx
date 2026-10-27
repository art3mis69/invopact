import React, { useState, useRef, useEffect } from 'react';
import { ACCENT_COLORS } from '../utils/formatters';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentColor =
    ACCENT_COLORS.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase()) || {
      name: 'Custom',
      hex: selectedColor,
    };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Accent Color: ${currentColor.name}`}
        className="flex items-center gap-1.5 p-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer text-xs"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-inner ring-1 ring-black/10 shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
          {currentColor.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5">
          {ACCENT_COLORS.map((color) => {
            const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => {
                  onChange(color.hex);
                  setIsOpen(false);
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-sm'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Select ${color.name} accent`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
