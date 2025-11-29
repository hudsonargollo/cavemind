import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CaveNodeData } from '../types';

const CaveNode: React.FC<NodeProps<CaveNodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`
        px-4 py-3 shadow-lg rounded-md min-w-[150px] text-center transition-all duration-300
        ${selected 
          ? 'border-2 border-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,0.3)] bg-[#0A0A0A]' 
          : 'border border-[#333] bg-[#0A0A0A] hover:border-[#555]'
        }
      `}
    >
      {/* Target Handle (Input) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#FF7A33] !w-3 !h-3 !border-none"
      />

      <div className="flex flex-col gap-1">
        <div className="text-[#E5E5E5] font-medium text-sm font-sans tracking-wide">
          {data.label}
        </div>
        {data.details && (
          <div className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
            {data.details}
          </div>
        )}
      </div>

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#FF7A33] !w-3 !h-3 !border-none"
      />
    </div>
  );
};

export default memo(CaveNode);