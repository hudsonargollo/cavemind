import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { PostItNodeData } from '../types';

const CavePostItNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const typedData = data as PostItNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(typedData.text);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Get color gradient based on post-it color
  const getColorGradient = (color: PostItNodeData['color']) => {
    const gradients = {
      yellow: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 50%, #FFEB3B 100%)',
      pink: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 50%, #F06292 100%)',
      blue: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #64B5F6 100%)',
      green: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #81C784 100%)',
      orange: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFB74D 100%)',
    };
    return gradients[color];
  };

  // Handle double-click to activate editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(typedData.text);
  };

  // Save changes
  const saveChanges = () => {
    // Update the node data through React Flow's node update mechanism
    const event = new CustomEvent('updatePostItText', {
      detail: { nodeId: id, text: editValue }
    });
    window.dispatchEvent(event);
    setIsEditing(false);
  };

  // Cancel changes
  const cancelChanges = () => {
    setEditValue(typedData.text);
    setIsEditing(false);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelChanges();
    }
    // Allow Enter for new lines in textarea
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
  }, [isEditing, editValue]);

  // Focus the textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing]);

  const rotation = typedData.rotation || 0;
  const hasShadow = typedData.hasShadow !== false; // Default to true
  const width = typedData.width || 200;
  const height = typedData.height || 200;

  return (
    <div className="relative group" ref={nodeRef}>
      <div
        className={`
          transition-all duration-300 cursor-pointer
          ${selected 
            ? 'ring-2 ring-[#FF3333] ring-offset-2 ring-offset-[#0A0A0A]' 
            : ''
          }
          ${hasShadow ? 'shadow-[4px_4px_12px_rgba(0,0,0,0.3)]' : ''}
        `}
        style={{
          background: getColorGradient(typedData.color),
          transform: `rotate(${rotation}deg)`,
          width: `${width}px`,
          height: `${height}px`,
          padding: '16px',
          position: 'relative',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Post-it top fold effect */}
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '0 20px 20px 0',
            borderColor: `transparent rgba(0,0,0,0.1) transparent transparent`,
          }}
        />

        {/* Content */}
        <div className="w-full h-full flex items-start justify-start">
          {isEditing ? (
            <textarea
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent text-gray-800 text-sm font-handwriting resize-none outline-none"
              style={{
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive",
              }}
              placeholder="Write a note..."
            />
          ) : (
            <div
              className="w-full h-full text-gray-800 text-sm font-handwriting whitespace-pre-wrap break-words overflow-hidden"
              style={{
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive",
              }}
            >
              {typedData.text || 'Double-click to edit'}
            </div>
          )}
        </div>

        {/* Handles - visible on hover, each can be both source and target */}
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          isConnectableStart={true}
          isConnectableEnd={true}
          className="!bg-gray-600 !w-3 !h-3 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          isConnectableStart={true}
          isConnectableEnd={true}
          className="!bg-gray-600 !w-3 !h-3 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          isConnectableStart={true}
          isConnectableEnd={true}
          className="!bg-gray-600 !w-3 !h-3 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectableStart={true}
          isConnectableEnd={true}
          className="!bg-gray-600 !w-3 !h-3 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};

export default memo(CavePostItNode);
