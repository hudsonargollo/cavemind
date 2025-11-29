import React, { useState } from 'react';

interface Props {
  onGenerate: (prompt: string) => Promise<void>;
  onSummarize: () => Promise<void>;
  isGenerating: boolean;
  hasSelection: boolean;
  onClear: () => void;
  onAddNode: (type: 'caveNode' | 'caveText' | 'caveImage') => void;
}

const CaveControlPanel: React.FC<Props> = ({ 
  onGenerate, 
  onSummarize, 
  isGenerating, 
  hasSelection,
  onClear,
  onAddNode
}) => {
  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onGenerate(prompt);
    setPrompt('');
    setExpanded(false);
  };

  const handleAddClick = (type: 'caveNode' | 'caveText' | 'caveImage') => {
    onAddNode(type);
    setShowAddMenu(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-lg px-4 pointer-events-none">
      
      {/* Floating Action Bar */}
      <div className="relative flex items-center gap-2 pointer-events-auto bg-[#1A1A1A]/90 backdrop-blur-md p-2 rounded-full border border-[#333] shadow-2xl">
        
        {/* Spark Button (AI Generation) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all
            ${expanded ? 'bg-[#FF3333] rotate-45' : 'bg-[#FF3333] hover:bg-[#D92B2B]'}
            text-white font-bold shadow-lg
          `}
          title="Spark AI"
        >
          {expanded ? '+' : '✦'}
        </button>

        <div className="w-[1px] h-6 bg-[#333] mx-1"></div>

        {/* Manual Add Node Group */}
        <div className="relative">
            {showAddMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#1A1A1A] border border-[#333] rounded-lg p-1 flex flex-col gap-1 shadow-xl animate-in slide-in-from-bottom-2">
                     <button onClick={() => handleAddClick('caveNode')} className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] rounded w-full whitespace-nowrap">
                        <div className="w-3 h-3 border border-[#E5E5E5] rounded-sm"></div> Process
                     </button>
                     <button onClick={() => handleAddClick('caveText')} className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] rounded w-full whitespace-nowrap">
                        <span className="font-mono text-[10px]">TXT</span> Note
                     </button>
                     <button onClick={() => handleAddClick('caveImage')} className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] rounded w-full whitespace-nowrap">
                        <span className="text-[10px]">📷</span> Image
                     </button>
                </div>
            )}
            <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] text-[#E5E5E5] transition-colors border ${showAddMenu ? 'border-[#FF3333]' : 'border-transparent'}`}
                title="Add..."
            >
            <span className="text-lg leading-none pb-1">+</span>
            </button>
        </div>

        <div className="w-[1px] h-6 bg-[#333] mx-1"></div>

        <button
            onClick={onClear}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
            Clear
        </button>

        {hasSelection && (
          <>
             <div className="w-[1px] h-6 bg-[#333] mx-1"></div>
             <button
              onClick={onSummarize}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#333] hover:bg-[#444] text-[#E5E5E5] text-xs font-medium transition-all"
            >
              {isGenerating ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                <span>Summarize Path</span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Prompt Input Modal */}
      {expanded && (
        <div className="pointer-events-auto w-full bg-[#0A0A0A] border border-[#333] p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
            <h3 className="text-[#FF3333] font-jersey text-xl mb-2">CAVE_BRAIN_V1</h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a workflow, strategy, or system..."
                    className="flex-1 bg-[#1A1A1A] border border-[#333] text-[#E5E5E5] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF3333] placeholder-gray-600 font-sans text-sm"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-[#E5E5E5] text-black hover:bg-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors"
                >
                    {isGenerating ? '...' : 'EXECUTE'}
                </button>
            </form>
            <div className="mt-2 text-[10px] text-gray-600 font-mono">
                MODEL: GEMINI-2.0-FLASH // LATENCY: LOW
            </div>
        </div>
      )}
    </div>
  );
};

export default CaveControlPanel;