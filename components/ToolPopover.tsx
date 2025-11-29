import React, { useEffect, useRef, useState } from 'react';
import { ToolbarPosition } from '../stores/toolbarStore';

interface ToolPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  toolbarPosition: ToolbarPosition;
  anchorElement: HTMLElement | null;
  children: React.ReactNode;
}

interface PopoverPosition {
  top: number;
  left: number;
}

/**
 * Calculate popover position based on toolbar position and anchor element
 * Ensures popover opens away from screen edges and stays within viewport bounds
 */
export const getPopoverPosition = (
  toolbarPosition: ToolbarPosition,
  buttonRect: DOMRect,
  popoverSize: { width: number; height: number }
): PopoverPosition => {
  const offset = 12; // gap between button and popover
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = 0;
  let left = 0;
  
  // Calculate initial position based on toolbar position
  switch (toolbarPosition) {
    case 'top':
      top = buttonRect.bottom + offset;
      left = buttonRect.left;
      break;
    case 'bottom':
      top = buttonRect.top - popoverSize.height - offset;
      left = buttonRect.left;
      break;
    case 'left':
      top = buttonRect.top;
      left = buttonRect.right + offset;
      break;
    case 'right':
      top = buttonRect.top;
      left = buttonRect.left - popoverSize.width - offset;
      break;
  }
  
  // Adjust for viewport boundaries
  // Ensure popover doesn't overflow right edge
  if (left + popoverSize.width > viewportWidth) {
    left = viewportWidth - popoverSize.width - 8; // 8px padding from edge
  }
  
  // Ensure popover doesn't overflow left edge
  if (left < 8) {
    left = 8;
  }
  
  // Ensure popover doesn't overflow bottom edge
  if (top + popoverSize.height > viewportHeight) {
    top = viewportHeight - popoverSize.height - 8;
  }
  
  // Ensure popover doesn't overflow top edge
  if (top < 8) {
    top = 8;
  }
  
  return { top, left };
};

const ToolPopover: React.FC<ToolPopoverProps> = ({
  isOpen,
  onClose,
  toolbarPosition,
  anchorElement,
  children,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  
  useEffect(() => {
    if (isOpen && anchorElement && popoverRef.current) {
      const buttonRect = anchorElement.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      
      const popoverSize = {
        width: popoverRect.width || 200, // fallback width
        height: popoverRect.height || 150, // fallback height
      };
      
      const newPosition = getPopoverPosition(toolbarPosition, buttonRect, popoverSize);
      setPosition(newPosition);
    }
  }, [isOpen, anchorElement, toolbarPosition]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorElement]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl p-4 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>
  );
};

export default ToolPopover;
