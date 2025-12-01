import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CaveNodeData } from '../types';
import { NodeShape } from '../constants';

const CaveNodeComponent: React.FC<NodeProps<CaveNodeData>> = ({ data, selected, id }) => {
  const shape = data.shape || 'process';
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Shape-specific styles
  const getShapeStyles = (s: NodeShape) => {
    switch(s) {
      case 'decision':
        return 'rotate-45 w-[120px] h-[120px] flex items-center justify-center';
      case 'circle':
        return 'rounded-full w-[120px] h-[120px] flex items-center justify-center aspect-square';
      case 'parallelogram':
        return '-skew-x-[20deg] px-6';
      case 'process':
      default:
        return 'rounded-md px-4 py-3 min-w-[150px]';
    }
  };

  // Undo rotation/skew for text content
  const contentStyle = shape === 'decision' ? { transform: 'rotate(-45deg)' } : shape === 'parallelogram' ? { transform: 'skew(20deg)' } : {};

  // Handle double-click to activate editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editRef.current) {
      editRef.current.value = data.label;
    }
    setIsEditing(true);
  };

  // Save changes
  const saveChanges = () => {
    const newLabel = editRef.current?.value.trim() || data.label;
    if (newLabel !== '' && newLabel !== data.label) {
      const event = new CustomEvent('updateNodeLabel', {
        detail: { nodeId: id, label: newLabel }
      });
      window.dispatchEvent(event);
    }
    setIsEditing(false);
  };

  // Cancel changes
  const cancelChanges = () => {
    if (editRef.current) {
      editRef.current.value = data.label;
    }
    setIsEditing(false);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelChanges();
    }
  };

  // Handle click outside
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        saveChanges();
      }
    };

    // Add a small delay to prevent immediate triggering
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);



  // Get colors from data
  const backgroundColor = (data as any).backgroundColor || '#0A0A0A';
  const strokeColor = (data as any).strokeColor || '#333';
  const textColor = (data as any).textColor || '#E5E5E5';

  return (
    <div className="relative group" ref={nodeRef}>
      <div
        className={`
          shadow-lg text-center transition-all duration-300
          ${selected 
            ? 'border-2 border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.3)]' 
            : 'border hover:border-[#555]'
          }
          ${getShapeStyles(shape)}
        `}
        style={{
          backgroundColor,
          borderColor: selected ? '#FF3333' : strokeColor,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-[#FF7A33] !w-3 !h-3 !border-none"
          style={shape === 'decision' ? { left: 0, top: 0, transform: 'translate(0%, 0%)' } : {}}
        />

        <div className="flex flex-col gap-1 items-center justify-center w-full h-full" style={contentStyle}>
          {isEditing ? (
            <input
              ref={(el) => {
                editRef.current = el;
                if (el && !el.dataset.initialized) {
                  el.value = data.label;
                  el.dataset.initialized = 'true';
                  el.focus();
                  el.select();
                }
              }}
              type="text"
              onKeyDown={handleKeyDown}
              onBlur={saveChanges}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-sm font-jersey tracking-wide leading-tight outline-none bg-[#1A1A1A] px-2 py-1 rounded min-w-[80px] text-center border border-[#FF3333]"
              style={{ color: textColor }}
            />
          ) : (
            <div className="text-sm font-jersey tracking-wide leading-tight" style={{ color: textColor }}>
              {data.label}
            </div>
          )}
          {!isEditing && data.details && (
            <div className="text-[10px] text-gray-500 mt-0.5 max-w-[140px] leading-tight">
              {data.details}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[#FF7A33] !w-3 !h-3 !border-none"
          style={shape === 'decision' ? { left: '100%', top: '100%', transform: 'translate(-100%, -100%)' } : {}}
        />

        {/* Diamond Side Handles for Decision nodes */}
        {shape === 'decision' && (
           <>
              <Handle type="target" position={Position.Left} id="l" className="!bg-[#FF7A33] !w-3 !h-3 !border-none !left-0 !bottom-0 !top-[100%] translate-y-[-100%]" />
              <Handle type="source" position={Position.Right} id="r" className="!bg-[#FF7A33] !w-3 !h-3 !border-none !right-0 !top-0 !left-[100%] translate-x-[-100%]" />
           </>
        )}
      </div>
    </div>
  );
};

// Memo with shallow comparison - ReactFlow updates are handled properly
export default memo(CaveNodeComponent, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.data.label === next.data.label &&
    prev.data.shape === next.data.shape
  );
});