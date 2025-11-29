import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CaveNodeData } from '../types';
import { NodeShape } from '../constants';

const CaveNode: React.FC<NodeProps<CaveNodeData>> = ({ data, selected }) => {
  const shape = data.shape || 'process';

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

  return (
    <div className="relative group">
      <div
        className={`
          shadow-lg text-center transition-all duration-300
          ${selected 
            ? 'border-2 border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.3)] bg-[#0A0A0A]' 
            : 'border border-[#333] bg-[#0A0A0A] hover:border-[#555]'
          }
          ${getShapeStyles(shape)}
        `}
      >
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-[#FF7A33] !w-3 !h-3 !border-none"
          style={shape === 'decision' ? { left: 0, top: 0, transform: 'translate(0%, 0%)' } : {}}
        />

        <div className="flex flex-col gap-1 items-center justify-center w-full h-full" style={contentStyle}>
          <div className="text-[#E5E5E5] font-medium text-sm font-sans tracking-wide leading-tight">
            {data.label}
          </div>
          {data.details && (
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

export default memo(CaveNode);