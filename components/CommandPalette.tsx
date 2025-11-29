import React, { useState, useEffect, useRef } from 'react';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<Props> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#333] shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-[#333] flex items-center px-4">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent py-4 text-[#E5E5E5] placeholder-gray-600 outline-none font-sans"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="px-2 py-1 bg-[#333] rounded text-[10px] text-gray-400 font-mono">ESC</div>
        </div>

        <ul ref={listRef} className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <li
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                className={`
                  px-4 py-3 flex justify-between items-center cursor-pointer transition-colors
                  ${index === selectedIndex ? 'bg-[#333] border-l-2 border-[#FF3333]' : 'hover:bg-[#252525] border-l-2 border-transparent'}
                `}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-3">
                    {cmd.icon && <span className="text-gray-400">{cmd.icon}</span>}
                    <span className={index === selectedIndex ? 'text-white' : 'text-gray-300'}>
                    {cmd.label}
                    </span>
                </div>
                {cmd.shortcut && (
                  <span className="text-xs text-gray-500 font-mono bg-[#0A0A0A] px-2 py-1 rounded">
                    {cmd.shortcut}
                  </span>
                )}
              </li>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No commands found.
            </div>
          )}
        </ul>
        
        <div className="px-4 py-2 bg-[#0A0A0A] border-t border-[#333] flex justify-between items-center text-[10px] text-gray-500">
            <span>CaveMind Command</span>
            <span>Use ↑↓ to navigate, ↵ to select</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;