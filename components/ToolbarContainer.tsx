import React from 'react';
import { ToolbarPosition } from '../stores/toolbarStore';

interface ToolbarContainerProps {
  position: ToolbarPosition;
  children: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  toolbarRef?: React.RefObject<HTMLDivElement>;
}

const getContainerClasses = (position: ToolbarPosition): string => {
  const base = 'fixed z-40 bg-[#1A1A1A]/90 backdrop-blur-md border border-[#333] shadow-2xl';
  
  const positioning = {
    top: 'top-8 left-1/2 -translate-x-1/2 rounded-b-2xl',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2 rounded-t-2xl',
    left: 'left-8 top-1/2 -translate-y-1/2 rounded-r-2xl',
    right: 'right-8 top-1/2 -translate-y-1/2 rounded-l-2xl',
  };
  
  const orientation = {
    top: 'flex-row',
    bottom: 'flex-row',
    left: 'flex-col',
    right: 'flex-col',
  };
  
  // Enhanced transition with smooth easing for position changes and icon repositioning
  return `${base} ${positioning[position]} flex ${orientation[position]} gap-2 p-2 transition-all duration-300 ease-in-out`;
};

const getOrientationLabel = (position: ToolbarPosition): string => {
  const labels = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
  };
  return labels[position];
};

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ position, children, onKeyDown, toolbarRef }) => {
  return (
    <div 
      ref={toolbarRef}
      className={getContainerClasses(position)}
      role="toolbar"
      aria-label={`Main toolbar (docked to ${getOrientationLabel(position)})`}
      aria-orientation={position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical'}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

export default ToolbarContainer;
