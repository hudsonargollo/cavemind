import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Rnd } from 'react-rnd';
import { ResizableTextNodeData } from '../types';

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

const ResizableTextNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const typedData = data as ResizableTextNodeData;
  const [title, setTitle] = useState(typedData.title || 'NOTA SEM TÍTULO');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [rotation, setRotation] = useState(typedData.rotation || 0);
  const [width, setWidth] = useState(Math.max(MIN_WIDTH, typedData.width || 200));
  const [height, setHeight] = useState(Math.max(MIN_HEIGHT, typedData.height || 100));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize textarea value once
  useEffect(() => {
    if (textareaRef.current && !textareaRef.current.value) {
      textareaRef.current.value = typedData.text || '';
    }
  }, []);

  // Update data when dimensions or rotation change
  useEffect(() => {
    typedData.width = width;
    typedData.height = height;
    typedData.rotation = rotation;
    typedData.minWidth = MIN_WIDTH;
    typedData.minHeight = MIN_HEIGHT;
  }, [width, height, rotation, typedData]);

  const handleResize = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    const newWidth = Math.max(MIN_WIDTH, ref.offsetWidth);
    const newHeight = Math.max(MIN_HEIGHT, ref.offsetHeight);

    // All handles resize independently (no aspect ratio locking)
    setWidth(newWidth);
    setHeight(newHeight);
  };

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Get colors from data
  const backgroundColor = typedData.backgroundColor || '#111';
  const textColor = typedData.textColor || '#E5E5E5';

  return (
    <div
      className={`
        group relative border rounded-md transition-all duration-300
        ${selected 
          ? 'border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.2)]' 
          : 'border-[#333] hover:border-[#555]'
        }
      `}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        backgroundColor,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Resize handles - only visible when selected */}
      {selected && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <Rnd
            size={{ width, height }}
            position={{ x: 0, y: 0 }}
            onResize={handleResize}
            onResizeStop={handleResize}
            minWidth={MIN_WIDTH}
            minHeight={MIN_HEIGHT}
            disableDragging={true}
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
            resizeHandleStyles={{
              top: { cursor: 'ns-resize', height: '8px', top: '-4px', pointerEvents: 'auto' },
              right: { cursor: 'ew-resize', width: '8px', right: '-4px', pointerEvents: 'auto' },
              bottom: { cursor: 'ns-resize', height: '8px', bottom: '-4px', pointerEvents: 'auto' },
              left: { cursor: 'ew-resize', width: '8px', left: '-4px', pointerEvents: 'auto' },
              topRight: { cursor: 'nesw-resize', width: '8px', height: '8px', top: '-4px', right: '-4px', pointerEvents: 'auto' },
              bottomRight: { cursor: 'nwse-resize', width: '8px', height: '8px', bottom: '-4px', right: '-4px', pointerEvents: 'auto' },
              bottomLeft: { cursor: 'nesw-resize', width: '8px', height: '8px', bottom: '-4px', left: '-4px', pointerEvents: 'auto' },
              topLeft: { cursor: 'nwse-resize', width: '8px', height: '8px', top: '-4px', left: '-4px', pointerEvents: 'auto' },
            }}
            resizeHandleClasses={{
              top: 'bg-[#FF3333] opacity-0 hover:opacity-100 transition-opacity',
              right: 'bg-[#FF3333] opacity-0 hover:opacity-100 transition-opacity',
              bottom: 'bg-[#FF3333] opacity-0 hover:opacity-100 transition-opacity',
              left: 'bg-[#FF3333] opacity-0 hover:opacity-100 transition-opacity',
              topRight: 'bg-[#FF3333] rounded-full opacity-0 hover:opacity-100 transition-opacity',
              bottomRight: 'bg-[#FF3333] rounded-full opacity-0 hover:opacity-100 transition-opacity',
              bottomLeft: 'bg-[#FF3333] rounded-full opacity-0 hover:opacity-100 transition-opacity',
              topLeft: 'bg-[#FF3333] rounded-full opacity-0 hover:opacity-100 transition-opacity',
            }}
          >
            <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
          </Rnd>
        </div>
      )}

      <div className="bg-[#1A1A1A] px-3 py-1 border-b border-[#333] rounded-t-md flex items-center gap-2">
        <span className="text-[10px]">🔺</span>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              typedData.title = e.target.value;
            }}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
              } else if (e.key === 'Escape') {
                setTitle(typedData.title || 'NOTA SEM TÍTULO');
                setIsEditingTitle(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[10px] uppercase tracking-widest text-gray-300 font-bold bg-[#0A0A0A] px-2 py-0.5 rounded outline-none focus:ring-1 focus:ring-[#FF3333] flex-1"
            maxLength={30}
          />
        ) : (
          <span 
            className="text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer hover:text-gray-300 transition-colors flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
          >
            {title}
          </span>
        )}
        {/* Rotation controls - only visible when selected */}
        {selected && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation((r) => (r - 15 + 360) % 360);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-gray-300 text-xs px-1"
              title="Rotate left"
            >
              ↺
            </button>
            <span className="text-[8px] text-gray-600 min-w-[24px] text-center">{rotation}°</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation((r) => (r + 15) % 360);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-gray-300 text-xs px-1"
              title="Rotate right"
            >
              ↻
            </button>
          </div>
        )}
      </div>

      <div className="p-3 overflow-hidden" style={{ height: `calc(100% - 32px)` }}>
        <textarea
          ref={textareaRef}
          defaultValue={typedData.text || ''}
          className="w-full h-full bg-transparent text-sm font-jersey focus:outline-none resize-none overflow-auto leading-relaxed"
          style={{ color: textColor }}
          placeholder="Enter resizable text..."
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            typedData.text = e.target.value;
          }}
        />
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(ResizableTextNode);
