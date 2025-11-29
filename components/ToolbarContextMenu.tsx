import React, { useEffect, useRef } from 'react';
import { ToolbarPosition } from '../stores/toolbarStore';

interface ToolbarContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentPosition: ToolbarPosition;
  onSelectPosition: (pos: ToolbarPosition) => void;
  onClose: () => void;
  isLocked: boolean;
}

const ToolbarContextMenu: React.FC<ToolbarContextMenuProps> = ({
  isOpen,
  position,
  currentPosition,
  onSelectPosition,
  onClose,
  isLocked,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positions: { value: ToolbarPosition; label: string }[] = [
    { value: 'top', label: 'Dock to Top' },
    { value: 'bottom', label: 'Dock to Bottom' },
    { value: 'left', label: 'Dock to Left' },
    { value: 'right', label: 'Dock to Right' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.y,
        left: position.x,
      }}
      role="menu"
      aria-label="Toolbar position menu"
    >
      {positions.map((pos, index) => (
        <button
          key={pos.value}
          onClick={() => {
            if (!isLocked) {
              onSelectPosition(pos.value);
              onClose();
            }
          }}
          disabled={isLocked}
          className={`
            w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-4
            ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#333] cursor-pointer focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-inset focus:ring-[#FF3333]'}
            ${currentPosition === pos.value ? 'text-[#FF3333]' : 'text-[#E5E5E5]'}
            transition-colors
          `}
          role="menuitemradio"
          aria-checked={currentPosition === pos.value}
          aria-label={`${pos.label}${currentPosition === pos.value ? ' (current position)' : ''}`}
          autoFocus={index === 0}
        >
          <span>{pos.label}</span>
          {currentPosition === pos.value && <span aria-hidden="true">✓</span>}
        </button>
      ))}
      {isLocked && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-[#333]" role="note">
          Upgrade to Pro to customize
        </div>
      )}
    </div>
  );
};

export default ToolbarContextMenu;
