import React, { useEffect, useRef } from 'react';
import { STICKERS } from '../constants';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'canvas' | 'node';
  onClose: () => void;
  // Canvas Actions
  onAddNode?: (type: 'caveNode' | 'caveText' | 'caveImage' | 'caveSticker', payload?: any) => void;
  onPaste?: () => void;
  // Node Actions
  onDelete?: () => void;
  onDuplicate?: () => void;
  onChangeShape?: (shape: 'process' | 'decision' | 'circle' | 'parallelogram') => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  type, 
  onClose, 
  onAddNode, 
  onPaste,
  onDelete,
  onDuplicate,
  onChangeShape
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showStickers, setShowStickers] = React.useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style = { top: y, left: x };

  // -------------------------
  // CANVAS MENU
  // -------------------------
  if (type === 'canvas') {
    return (
      <div 
          ref={menuRef}
          className="fixed z-50 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl p-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
          style={style}
      >
        {!showStickers ? (
            <div className="flex flex-col gap-0.5">
              <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Canvas Actions</div>
              
              <button onClick={() => { onAddNode?.('caveNode', { shape: 'process', label: 'Process' }); onClose(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
                  <div className="w-4 h-3 border border-gray-500 rounded-[2px]" /> Add Process
              </button>
              <button onClick={() => { onAddNode?.('caveNode', { shape: 'decision', label: 'Decision?' }); onClose(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
                  <div className="w-3 h-3 border border-gray-500 rotate-45" /> Add Decision
              </button>
              
              <div className="h-[1px] bg-[#333] my-1" />
              
              <button onClick={() => { onAddNode?.('caveText'); onClose(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
                  <span>📝</span> Add Note
              </button>
              <button onClick={() => { onAddNode?.('caveImage'); onClose(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
                  <span>📷</span> Add Image
              </button>
              <button onClick={() => setShowStickers(true)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left justify-between group transition-colors">
                  <div className="flex items-center gap-3">
                      <span>✨</span> Add Sticker
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-400">›</span>
              </button>
               <div className="h-[1px] bg-[#333] my-1" />
               <button onClick={() => { onPaste?.(); onClose(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
                  <span>📋</span> Paste
              </button>
            </div>
        ) : (
            <div>
                <div className="flex items-center gap-2 px-2 py-1 border-b border-[#333] mb-1">
                    <button onClick={() => setShowStickers(false)} className="text-gray-500 hover:text-white px-2">‹</button>
                    <span className="text-xs font-bold text-gray-400">Reactions</span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 w-[220px] max-h-[300px] overflow-y-auto">
                    {STICKERS.map((sticker) => (
                        <button 
                          key={sticker.id}
                          onClick={() => { onAddNode?.('caveSticker', { src: sticker.url }); onClose(); }}
                          className="aspect-square hover:bg-[#333] rounded p-1 flex items-center justify-center transition-colors border border-transparent hover:border-[#333]"
                        >
                            <img src={sticker.url} alt={sticker.id} className="w-full h-full object-contain pointer-events-none" />
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  }

  // -------------------------
  // NODE MENU
  // -------------------------
  return (
    <div 
        ref={menuRef}
        className="fixed z-50 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl p-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
        style={style}
    >
       <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Node Actions</div>
       <button onClick={() => { onDuplicate?.(); onClose(); }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded text-left transition-colors">
           <span>📄</span> Duplicate
       </button>
       <button onClick={() => { onDelete?.(); onClose(); }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#FF3333] hover:bg-[#333] rounded text-left transition-colors">
           <span>🗑️</span> Delete
       </button>
       
       <div className="h-[1px] bg-[#333] my-1" />
       <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Change Shape</div>
       <div className="grid grid-cols-4 gap-1 p-1">
          <button onClick={() => onChangeShape?.('process')} className="hover:bg-[#333] p-1 rounded border border-[#333]" title="Process"><div className="w-4 h-3 border border-gray-400 rounded-[2px] mx-auto" /></button>
          <button onClick={() => onChangeShape?.('decision')} className="hover:bg-[#333] p-1 rounded border border-[#333]" title="Decision"><div className="w-3 h-3 border border-gray-400 rotate-45 mx-auto" /></button>
          <button onClick={() => onChangeShape?.('circle')} className="hover:bg-[#333] p-1 rounded border border-[#333]" title="Circle"><div className="w-3 h-3 border border-gray-400 rounded-full mx-auto" /></button>
          <button onClick={() => onChangeShape?.('parallelogram')} className="hover:bg-[#333] p-1 rounded border border-[#333]" title="Data"><div className="w-4 h-3 border border-gray-400 -skew-x-[20deg] mx-auto" /></button>
       </div>
    </div>
  );
};

export default ContextMenu;