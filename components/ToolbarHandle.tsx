import React, { useState, useRef } from 'react';
import { ToolbarPosition, useToolbarStore } from '../stores/toolbarStore';

interface ToolbarHandleProps {
  position: ToolbarPosition;
  isLocked: boolean;
  isMobile?: boolean;
  onLockedDragAttempt?: () => void;
}

type DropZone = 'top' | 'bottom' | 'left' | 'right' | null;

const ToolbarHandle: React.FC<ToolbarHandleProps> = ({ position, isLocked, isMobile = false, onLockedDragAttempt }) => {
  const { setPosition, setDragging } = useToolbarStore();
  const [dropZone, setDropZone] = useState<DropZone>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Disable drag on mobile or when locked
    if (isLocked || isMobile) {
      e.preventDefault();
      if (isLocked) {
        onLockedDragAttempt?.();
      }
      return;
    }
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    setDragging(true);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked || isMobile || !dragStartPos.current) return;
    
    // Check if we've moved more than 5px threshold
    if (!hasMoved.current) {
      const dx = Math.abs(e.clientX - dragStartPos.current.x);
      const dy = Math.abs(e.clientY - dragStartPos.current.y);
      if (dx > 5 || dy > 5) {
        hasMoved.current = true;
      }
    }

    if (!hasMoved.current || e.clientX === 0 || e.clientY === 0) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Edge detection with 50px threshold
    let newDropZone: DropZone = null;
    if (clientY < 50) {
      newDropZone = 'top';
    } else if (clientY > innerHeight - 50) {
      newDropZone = 'bottom';
    } else if (clientX < 50) {
      newDropZone = 'left';
    } else if (clientX > innerWidth - 50) {
      newDropZone = 'right';
    }
    
    setDropZone(newDropZone);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked || isMobile) return;
    
    setDragging(false);
    
    if (!hasMoved.current) {
      setDropZone(null);
      dragStartPos.current = null;
      return;
    }

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Edge detection with 50px threshold
    if (clientY < 50) {
      setPosition('top');
    } else if (clientY > innerHeight - 50) {
      setPosition('bottom');
    } else if (clientX < 50) {
      setPosition('left');
    } else if (clientX > innerWidth - 50) {
      setPosition('right');
    }
    
    setDropZone(null);
    dragStartPos.current = null;
    hasMoved.current = false;
  };

  const isHorizontal = position === 'top' || position === 'bottom';
  
  return (
    <>
      {/* Drag Handle */}
      <div
        draggable={!isLocked && !isMobile}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={`
          flex items-center justify-center
          ${isHorizontal ? 'w-8 h-6' : 'w-6 h-8'}
          ${isLocked || isMobile ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'}
          text-gray-500 hover:text-gray-300 transition-colors
        `}
        role="button"
        aria-label={
          isLocked 
            ? 'Toolbar drag handle (Upgrade to Pro to move toolbar)' 
            : isMobile 
            ? 'Toolbar drag handle (disabled on mobile)' 
            : 'Drag to reposition toolbar to different screen edge'
        }
        aria-disabled={isLocked || isMobile}
        tabIndex={isLocked || isMobile ? -1 : 0}
      >
        <span className="text-xs select-none" aria-hidden="true">
          {isHorizontal ? '⋮⋮' : '⋮'}
        </span>
      </div>

      {/* Drop Zone Indicators with fade-in/fade-out animations */}
      {dropZone && (
        <>
          {dropZone === 'top' && (
            <div className="fixed top-0 left-0 right-0 h-16 bg-[#FF3333]/20 border-b-2 border-[#FF3333] pointer-events-none z-50 animate-in fade-in slide-in-from-top-2 duration-300" />
          )}
          {dropZone === 'bottom' && (
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#FF3333]/20 border-t-2 border-[#FF3333] pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-2 duration-300" />
          )}
          {dropZone === 'left' && (
            <div className="fixed top-0 left-0 bottom-0 w-16 bg-[#FF3333]/20 border-r-2 border-[#FF3333] pointer-events-none z-50 animate-in fade-in slide-in-from-left-2 duration-300" />
          )}
          {dropZone === 'right' && (
            <div className="fixed top-0 right-0 bottom-0 w-16 bg-[#FF3333]/20 border-l-2 border-[#FF3333] pointer-events-none z-50 animate-in fade-in slide-in-from-right-2 duration-300" />
          )}
        </>
      )}
    </>
  );
};

export default ToolbarHandle;
