import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Rnd } from 'react-rnd';
import { ResizableTextNodeData } from '../types';

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

const ResizableTextNodeComponent: React.FC<NodeProps> = ({ data, selected, id }) => {
  const typedData = data as ResizableTextNodeData;
  const defaultTitle = 'NOTA SEM TÍTULO';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [rotation, setRotation] = useState(typedData.rotation || 0);
  const [width, setWidth] = useState(Math.max(MIN_WIDTH, typedData.width || 200));
  const [height, setHeight] = useState(Math.max(MIN_HEIGHT, typedData.height || 100));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isEditingTextRef = useRef(false);
  const isEditingTitleRef = useRef(false);
  
  const currentTitle = typedData.title || defaultTitle;
  
  // Update dimensions in data directly (no re-render needed)
  useEffect(() => {
    typedData.width = width;
    typedData.height = height;
    typedData.rotation = rotation;
  }, [width, height, rotation, typedData]);

  const handleResize = (
    _e: MouseEvent | TouchEvent,
    _direction: string,
    ref: HTMLElement,
    _delta: { width: number; height: number },
    _position: { x: number; y: number }
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
            defaultValue={currentTitle}
            onBlur={() => {
              const newTitle = titleInputRef.current?.value || currentTitle;
              const event = new CustomEvent('updateResizableText', {
                detail: { nodeId: id, text: textareaRef.current?.value || '', title: newTitle }
              });
              window.dispatchEvent(event);
              setIsEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newTitle = titleInputRef.current?.value || currentTitle;
                const event = new CustomEvent('updateResizableText', {
                  detail: { nodeId: id, text: textareaRef.current?.value || '', title: newTitle }
                });
                window.dispatchEvent(event);
                setIsEditingTitle(false);
              } else if (e.key === 'Escape') {
                if (titleInputRef.current) {
                  titleInputRef.current.value = currentTitle;
                }
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
            {currentTitle}
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
          ref={(el) => {
            textareaRef.current = el;
            // Only set initial value once when element is created
            if (el && !el.dataset.initialized) {
              el.value = typedData.text || '';
              el.dataset.initialized = 'true';
            }
          }}
          className="w-full h-full bg-transparent text-sm font-jersey focus:outline-none resize-none overflow-auto leading-relaxed"
          style={{ color: textColor }}
          placeholder="Digite o texto redimensionável..."
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={(e) => {
            const event = new CustomEvent('updateResizableText', {
              detail: { nodeId: id, text: e.target.value, title: currentTitle }
            });
            window.dispatchEvent(event);
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

// Smart memo - only re-render when necessary
export default memo(ResizableTextNodeComponent, (prev, next) => {
  const prevData = prev.data as ResizableTextNodeData;
  const nextData = next.data as ResizableTextNodeData;
  
  // Always re-render if selection changes
  if (prev.selected !== next.selected) return false;
  
  // Always re-render if id changes
  if (prev.id !== next.id) return false;
  
  // Re-render if title changes (but not text - text is handled by uncontrolled input)
  if (prevData.title !== nextData.title) return false;
  
  // Re-render if dimensions change
  if (prevData.width !== nextData.width || prevData.height !== nextData.height) return false;
  
  // Re-render if rotation changes
  if (prevData.rotation !== nextData.rotation) return false;
  
  // Don't re-render for text changes (uncontrolled input handles it)
  return true;
});
