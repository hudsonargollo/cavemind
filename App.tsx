import React, { useCallback, useState, useEffect, DragEvent } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  BackgroundVariant,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
  ProOptions
} from '@xyflow/react';
import { toPng } from 'html-to-image';

import CaveNode from './components/CaveNode';
import CaveTextNode from './components/CaveTextNode';
import CaveImageNode from './components/CaveImageNode';
import CaveStickerNode from './components/CaveStickerNode';
import CaveControlPanel from './components/CaveControlPanel';
import ContextMenu from './components/ContextMenu';
import CommandPalette, { Command } from './components/CommandPalette'; // Corrected import
import LoginModal from './components/auth/LoginModal';
import PricingModal from './components/auth/PricingModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { INITIAL_NODES, STICKERS } from './constants';
import { generateFlowFromPrompt, summarizeFlow } from './services/geminiService';
import { calculateLayout } from './utils/layout';

// Define custom node types
const nodeTypes = {
  caveNode: CaveNode,
  caveText: CaveTextNode,
  caveImage: CaveImageNode,
  caveSticker: CaveStickerNode,
};

const proOptions: ProOptions = { hideAttribution: true };
const STORAGE_KEY = 'cavemind_state_v1';

// History Structure
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

// Helper to load initial state
const getInitialState = () => {
  if (typeof window === 'undefined') return { nodes: INITIAL_NODES, edges: [] };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      return { nodes: nodes || INITIAL_NODES, edges: edges || [] };
    }
  } catch (error) { console.warn('Failed to load state', error); }
  return { nodes: INITIAL_NODES, edges: [] };
};

const { nodes: initialNodes, edges: initialEdges } = getInitialState();

function Flow() {
  const { user, login, upgradePlan } = useAuth();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  
  // UI State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number; 
    visible: boolean; 
    type: 'canvas' | 'node'; 
    targetNodeId?: string 
  } | null>(null);

  // Clipboard State
  const [clipboardNode, setClipboardNode] = useState<Node | null>(null);

  // History State
  const [history, setHistory] = useState<{ past: HistoryState[], future: HistoryState[] }>({ past: [], future: [] });

  const { fitView, screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  // --- History Logic ---
  const takeSnapshot = useCallback(() => {
    setHistory(curr => {
        const snapshot = { 
            nodes: JSON.parse(JSON.stringify(getNodes())), 
            edges: JSON.parse(JSON.stringify(getEdges())) 
        };
        const newPast = [...curr.past, snapshot];
        if (newPast.length > 50) newPast.shift(); // Limit history depth
        return {
            past: newPast,
            future: []
        };
    });
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    setHistory(curr => {
        if (curr.past.length === 0) return curr;
        const previous = curr.past[curr.past.length - 1];
        const newPast = curr.past.slice(0, -1);
        
        // Push current state to future
        const currentSnapshot = { 
            nodes: JSON.parse(JSON.stringify(getNodes())), 
            edges: JSON.parse(JSON.stringify(getEdges())) 
        };
        
        setNodes(previous.nodes);
        setEdges(previous.edges);
        
        return {
            past: newPast,
            future: [currentSnapshot, ...curr.future]
        };
    });
  }, [getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    setHistory(curr => {
        if (curr.future.length === 0) return curr;
        const next = curr.future[0];
        const newFuture = curr.future.slice(1);
        
        // Push current state to past
        const currentSnapshot = { 
            nodes: JSON.parse(JSON.stringify(getNodes())), 
            edges: JSON.parse(JSON.stringify(getEdges())) 
        };

        setNodes(next.nodes);
        setEdges(next.edges);
        
        return {
            past: [...curr.past, currentSnapshot],
            future: newFuture
        };
    });
  }, [getNodes, getEdges, setNodes, setEdges]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Toggle Command Palette
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
        // Undo
        if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Redo
        if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-save
  useEffect(() => {
    const saveState = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }, 1000);
    return () => clearTimeout(saveState);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
        takeSnapshot();
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#555' } }, eds));
    },
    [setEdges, takeSnapshot]
  );

  const handleSelectionChange = useCallback(({ nodes: selected }: { nodes: Node[] }) => {
    setSelectedNodes(selected);
    if (selected.length === 0) setSummary(null);
    if (selected.length === 1) setClipboardNode(selected[0]); 
  }, []);

  const handleGenerate = async (prompt: string) => {
    takeSnapshot();
    setIsGenerating(true);
    try {
      const data = await generateFlowFromPrompt(prompt);
      if (data) {
        const layout = calculateLayout(data);
        setNodes(layout.nodes);
        setEdges(layout.edges);
        setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
      }
    } catch (error) {
      alert("Failed to generate flow. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummarize = async () => {
    if (selectedNodes.length === 0) return;
    setIsGenerating(true);
    try {
        const nodeData = selectedNodes.map(n => ({ label: n.data.label as string }));
        const text = await summarizeFlow(nodeData);
        setSummary(text);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleClear = () => {
    takeSnapshot();
    setNodes([]);
    setEdges([]);
    setSummary(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Add Node Handler
  const handleAddNode = (type: 'caveNode' | 'caveText' | 'caveImage' | 'caveSticker', payload: any = {}) => {
    takeSnapshot();
    const id = `${Date.now()}`;
    let position = { x: 0, y: 0 };
    
    if (contextMenu?.visible) {
        position = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
    } else {
        position = screenToFlowPosition({
            x: window.innerWidth / 2 + (Math.random() * 40 - 20),
            y: window.innerHeight / 2 + (Math.random() * 40 - 20)
        });
    }

    let data = {};
    if (type === 'caveNode') data = { label: payload.label || 'New Process', shape: payload.shape || 'process' };
    if (type === 'caveText') data = { text: '' };
    if (type === 'caveImage') data = { src: '' };
    if (type === 'caveSticker') {
        const src = payload.src || STICKERS[Math.floor(Math.random() * STICKERS.length)].url;
        data = { src };
    }

    const newNode: Node = { id, position, data, type };
    setNodes((nds) => nds.concat(newNode));
  };

  const handlePaste = () => {
      if (!clipboardNode) return;
      takeSnapshot();
      const position = contextMenu?.visible 
        ? screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y }) 
        : { x: clipboardNode.position.x + 50, y: clipboardNode.position.y + 50 };

      const newNode = {
          ...clipboardNode,
          id: `${Date.now()}`,
          position,
          selected: true
      };
      setNodes((nds) => nds.concat(newNode));
  };

  const handleDelete = () => {
      const targetId = contextMenu?.targetNodeId || (selectedNodes.length > 0 ? selectedNodes[0].id : null);
      if (!targetId) return;
      
      takeSnapshot();
      setNodes((nds) => nds.filter((n) => n.id !== targetId));
      setEdges((eds) => eds.filter((e) => e.source !== targetId && e.target !== targetId));
  };

  const handleDuplicate = () => {
      const targetId = contextMenu?.targetNodeId || (selectedNodes.length > 0 ? selectedNodes[0].id : null);
      if (!targetId) return;

      takeSnapshot();
      const original = nodes.find(n => n.id === targetId);
      if (!original) return;
      
      const newNode = {
          ...original,
          id: `${Date.now()}`,
          position: { x: original.position.x + 50, y: original.position.y + 50 },
          selected: true
      };
      setNodes((nds) => nds.concat(newNode));
  };

  const handleChangeShape = (shape: 'process' | 'decision' | 'circle' | 'parallelogram') => {
      const targetId = contextMenu?.targetNodeId || (selectedNodes.length > 0 ? selectedNodes[0].id : null);
      if (!targetId) return;

      takeSnapshot();
      setNodes((nds) => nds.map((n) => {
          if (n.id === targetId) {
              return { ...n, data: { ...n.data, shape } };
          }
          return n;
      }));
  };

  const handleExportPNG = () => {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) return;
    toPng(flowElement, { backgroundColor: '#0A0A0A', style: { transform: `translate(0,0) scale(1)` } })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `cavemind-export-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      });
  };

  const commands: Command[] = [
    { id: 'add-process', label: 'Add Process Node', shortcut: 'P', icon: '◻️', action: () => handleAddNode('caveNode', { shape: 'process', label: 'Process' }) },
    { id: 'add-decision', label: 'Add Decision Node', shortcut: 'D', icon: '◇', action: () => handleAddNode('caveNode', { shape: 'decision', label: 'Decision?' }) },
    { id: 'add-note', label: 'Add Note', shortcut: 'N', icon: '📝', action: () => handleAddNode('caveText') },
    { id: 'add-image', label: 'Add Image', shortcut: 'I', icon: '📷', action: () => handleAddNode('caveImage') },
    { id: 'spark-ai', label: 'Spark AI Generation', shortcut: '✨', icon: '✦', action: () => alert("Click the Spark button in the dock.") },
    { id: 'export-png', label: 'Export as PNG', icon: '🖼️', action: handleExportPNG },
    { id: 'clear', label: 'Clear Canvas', icon: '🗑️', action: handleClear },
    { id: 'login', label: 'Login / Sign Up', icon: '👤', action: () => setIsLoginOpen(true) },
    { id: 'pricing', label: 'View Pricing', icon: '💲', action: () => setIsPricingOpen(true) },
  ];

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, visible: true, type: 'canvas' });
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
      setContextMenu({ x: event.clientX, y: event.clientY, visible: true, type: 'node', targetNodeId: node.id });
  }, [setNodes]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((event: DragEvent) => {
      event.preventDefault();
      if ((event.target as HTMLElement).closest('.react-flow__node')) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            takeSnapshot();
            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                setNodes((nds) => nds.concat({
                    id: `${Date.now()}`,
                    type: 'caveImage',
                    position,
                    data: { src },
                }));
            };
            reader.readAsDataURL(file);
        }
      }
    }, [screenToFlowPosition, setNodes, takeSnapshot]
  );

  return (
    <div 
        className="w-screen h-screen bg-[#0A0A0A] relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => setContextMenu(null)}
    >
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        commands={commands}
      />

      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <h1 className="text-4xl text-[#E5E5E5] font-jersey tracking-wider">
          CAVE<span className="text-[#FF3333]">MIND</span>
        </h1>
        <p className="text-[#555] text-xs font-mono mt-1">MODO CAVERNA OS v1.1</p>
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={async (provider) => {
            await login(provider);
            setIsLoginOpen(false);
        }}
      />

      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)}
        onUpgrade={upgradePlan}
        currentTier={user?.planTier || 'free'}
      />

      {contextMenu?.visible && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            type={contextMenu.type}
            onClose={() => setContextMenu(null)}
            onAddNode={handleAddNode}
            onPaste={handlePaste}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onChangeShape={handleChangeShape}
          />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onSelectionChange={handleSelectionChange}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        proOptions={proOptions}
        className="bg-[#0A0A0A]"
        minZoom={0.1}
        onMoveStart={() => setContextMenu(null)}
        onNodeDragStart={takeSnapshot} // Snapshots state before node is dragged
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333333" />
        <Controls className="!bg-[#1A1A1A] !border !border-[#333] !shadow-xl !rounded-md overflow-hidden [&>button]:!border-b-[#333] [&>button]:!bg-[#1A1A1A] [&>button]:!fill-[#E5E5E5] [&>button:hover]:!bg-[#333] [&>button:hover]:!fill-white last:[&>button]:!border-b-0"/>
      </ReactFlow>

      {summary && (
        <div className="absolute top-24 right-6 w-80 bg-[#1A1A1A]/95 backdrop-blur border border-[#333] p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[500px] z-50">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                <h3 className="text-[#FF7A33] font-bold uppercase text-xs tracking-widest">Report</h3>
                <button onClick={() => setSummary(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{summary}</pre>
        </div>
      )}

      <CaveControlPanel 
        onGenerate={handleGenerate} 
        onSummarize={handleSummarize}
        onClear={handleClear}
        onAddNode={handleAddNode}
        isGenerating={isGenerating}
        hasSelection={selectedNodes.length > 0}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AuthProvider>
        <Flow />
      </AuthProvider>
    </ReactFlowProvider>
  );
}