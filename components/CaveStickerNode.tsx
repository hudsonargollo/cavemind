import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { CaveStickerData } from '../types';

const CaveStickerNode: React.FC<NodeProps<CaveStickerData>> = ({ data, selected }) => {
  return (
    <div
      className={`relative group transition-all duration-300 ${selected ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
      style={{ minWidth: '50px', minHeight: '50px' }}
    >
      <NodeResizer 
        color="#FF3333" 
        isVisible={selected} 
        keepAspectRatio
        minWidth={50}
        minHeight={50}
      />
      
      <img 
        src={data.src} 
        alt="Sticker" 
        className="w-full h-full object-contain pointer-events-none drop-shadow-2xl select-none" 
        draggable={false}
      />
    </div>
  );
};

export default memo(CaveStickerNode);