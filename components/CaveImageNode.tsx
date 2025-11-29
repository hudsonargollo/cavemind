import React, { memo, useState, useRef, DragEvent, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CaveImageData } from '../types';

const CaveImageNode: React.FC<NodeProps<CaveImageData>> = ({ data, selected }) => {
  const [src, setSrc] = useState(data.src);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with props (Required for Undo/Redo)
  useEffect(() => {
    if (typeof data.src === 'string' && data.src !== src) {
        setSrc(data.src);
    }
  }, [data.src]);

  const handleUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSrc(result);
        data.src = result; // Update data reference
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // Drag Handlers
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className={`
        group relative bg-[#0A0A0A] border rounded-md transition-all duration-300
        ${selected 
          ? 'border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.2)]' 
          : 'border-[#333] hover:border-[#555]'
        }
        ${isDragOver ? 'border-dashed border-[#FF7A33] bg-[#111]' : ''}
      `}
      style={{ minWidth: '150px', minHeight: '150px' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <NodeResizer 
        color="#FF3333" 
        isVisible={selected} 
        keepAspectRatio 
      />
      
      {src ? (
        <div className="w-full h-full p-1 rounded-md overflow-hidden relative">
             <img 
                src={src} 
                alt="Node Visual" 
                className="w-full h-full object-cover rounded-sm pointer-events-none" 
            />
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black/50 hover:bg-black/80 text-white p-1 rounded text-[10px] backdrop-blur"
                >
                    Replace
                </button>
             </div>
        </div>
      ) : (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#111] transition-colors p-4"
        >
            <span className="text-3xl text-[#333] mb-2">{isDragOver ? '📂' : '📷'}</span>
            <span className="text-[10px] text-[#555] font-mono text-center">
              {isDragOver ? 'DROP IMAGE' : 'CLICK OR DROP'}
            </span>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileInputChange} 
        accept="image/*" 
        className="hidden" 
      />

      <Handle type="target" position={Position.Top} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!bg-[#FF7A33] !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(CaveImageNode);