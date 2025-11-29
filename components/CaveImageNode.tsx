import React, { memo, useState, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CaveImageData } from '../types';

const CaveImageNode: React.FC<NodeProps<CaveImageData>> = ({ data, selected }) => {
  const [src, setSrc] = useState(data.src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSrc(result);
        data.src = result; // Update data reference
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`
        group relative bg-[#0A0A0A] border rounded-md transition-all duration-300
        ${selected 
          ? 'border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.2)]' 
          : 'border-[#333] hover:border-[#555]'
        }
      `}
      style={{ minWidth: '100px', minHeight: '100px' }}
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
            {/* Overlay to allow re-upload if needed, only visible on hover/select */}
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black/50 hover:bg-black/80 text-white p-1 rounded text-[10px]"
                >
                    Edit
                </button>
             </div>
        </div>
      ) : (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-48 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-[#111] transition-colors"
        >
            <span className="text-2xl text-[#333] mb-2">📷</span>
            <span className="text-xs text-[#555] font-mono">UPLOAD IMAGE</span>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
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