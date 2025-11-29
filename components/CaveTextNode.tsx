import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CaveTextData } from '../types';

const CaveTextNode: React.FC<NodeProps<CaveTextData>> = ({ data, selected, id }) => {
  const [text, setText] = useState(data.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state with props (Required for Undo/Redo)
  useEffect(() => {
    if (typeof data.text === 'string' && data.text !== text) {
      setText(data.text);
    }
  }, [data.text]);

  // Auto-resize height & update data
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    // Update internal data for export/save logic
    data.text = text; 
  }, [text, data]);

  return (
    <div
      className={`
        group relative bg-[#111] border rounded-md transition-all duration-300 min-w-[200px] max-w-[400px]
        ${selected 
          ? 'border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.2)]' 
          : 'border-[#333] hover:border-[#555]'
        }
      `}
    >
      <NodeResizer 
        color="#FF3333" 
        isVisible={selected} 
        minWidth={150}
        minHeight={100}
      />

      <div className="bg-[#1A1A1A] px-3 py-1 border-b border-[#333] rounded-t-md flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FF7A33]"></div>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Note</span>
      </div>

      <div className="p-3">
        <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-[#E5E5E5] text-sm font-mono focus:outline-none resize-none overflow-hidden leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter intelligence data..."
            rows={3}
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging node when clicking text
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

export default memo(CaveTextNode);