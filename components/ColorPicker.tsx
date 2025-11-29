import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  position: { x: number; y: number };
  targetProperty: 'background' | 'stroke' | 'text';
  onClose: () => void;
  isPostIt?: boolean;
}

// Preset color palette (16 colors in 4x4 grid)
const PRESET_COLORS = [
  '#FF3333', '#FF7A33', '#FFB833', '#FFF033',
  '#B8FF33', '#33FF57', '#33FFB8', '#33F0FF',
  '#3399FF', '#5733FF', '#B833FF', '#FF33F0',
  '#FF3399', '#FFFFFF', '#999999', '#333333',
];

// Post-it color palette (5 colors)
const POSTIT_COLORS = [
  { name: 'yellow', color: '#FFEB3B', label: 'Yellow' },
  { name: 'pink', color: '#F06292', label: 'Pink' },
  { name: 'blue', color: '#64B5F6', label: 'Blue' },
  { name: 'green', color: '#81C784', label: 'Green' },
  { name: 'orange', color: '#FFB74D', label: 'Orange' },
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onColorChange,
  position,
  targetProperty,
  onClose,
  isPostIt = false,
}) => {
  const [color, setColor] = useState(currentColor);
  const [opacity, setOpacity] = useState(100);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cavemind_recent_colors');
    if (stored) {
      try {
        setRecentColors(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load recent colors', e);
      }
    }
  }, []);

  // Extract opacity from color if it has alpha channel
  useEffect(() => {
    if (currentColor.startsWith('rgba')) {
      const match = currentColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        const alpha = parseFloat(match[4]);
        setOpacity(Math.round(alpha * 100));
        // Convert to hex for the picker
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        setColor(`#${r}${g}${b}`);
      }
    } else if (currentColor.startsWith('#')) {
      setColor(currentColor);
      setOpacity(100);
    }
  }, [currentColor]);

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    applyColor(selectedColor, opacity);
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    applyColor(color, newOpacity);
  };

  const applyColor = (hexColor: string, alpha: number) => {
    let finalColor = hexColor;
    
    // For background property, apply opacity
    if (targetProperty === 'background' && alpha < 100) {
      // Convert hex to rgba
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      finalColor = `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    }
    
    onColorChange(finalColor);
    
    // Add to recent colors (max 8)
    setRecentColors((prev) => {
      const updated = [hexColor, ...prev.filter((c) => c !== hexColor)].slice(0, 8);
      localStorage.setItem('cavemind_recent_colors', JSON.stringify(updated));
      return updated;
    });
  };

  // Position the picker near the toolbar
  const pickerStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
  };

  return (
    <>
      {/* Backdrop to close on click outside */}
      <div
        className="fixed inset-0 z-[999]"
        onClick={onClose}
      />
      
      {/* Color Picker Panel */}
      <div
        style={pickerStyle}
        className="bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl p-4 z-[1000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#E5E5E5] uppercase tracking-wider">
            {targetProperty === 'background' ? 'Background' : targetProperty === 'stroke' ? 'Stroke' : 'Text'} Color
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Post-it Colors (only for post-it notes) */}
        {isPostIt && (
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Post-it Colors</label>
            <div className="flex gap-2">
              {POSTIT_COLORS.map((postItColor) => (
                <button
                  key={postItColor.name}
                  onClick={() => handleColorSelect(postItColor.color)}
                  className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 shadow-md ${
                    color.toLowerCase() === postItColor.color.toLowerCase()
                      ? 'border-[#FF3333]'
                      : 'border-[#333]'
                  }`}
                  style={{ backgroundColor: postItColor.color }}
                  title={postItColor.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Color Picker (hide for post-its to keep it simple) */}
        {!isPostIt && (
          <div className="mb-4">
            <HexColorPicker color={color} onChange={handleColorSelect} />
          </div>
        )}

        {/* Opacity Slider (only for background and not for post-its) */}
        {targetProperty === 'background' && !isPostIt && (
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">
              Opacity: {opacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF3333]"
            />
          </div>
        )}

        {/* Preset Colors (hide for post-its) */}
        {!isPostIt && (
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Preset Colors</label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorSelect(presetColor)}
                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                    color.toLowerCase() === presetColor.toLowerCase()
                      ? 'border-[#FF3333]'
                      : 'border-[#333]'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Recent Colors</label>
            <div className="flex gap-2">
              {recentColors.map((recentColor, index) => (
                <button
                  key={`${recentColor}-${index}`}
                  onClick={() => handleColorSelect(recentColor)}
                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                    color.toLowerCase() === recentColor.toLowerCase()
                      ? 'border-[#FF3333]'
                      : 'border-[#333]'
                  }`}
                  style={{ backgroundColor: recentColor }}
                  title={recentColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ColorPicker;
