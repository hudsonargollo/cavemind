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
  useReactFlow,
  ProOptions
} from '@xyflow/react';

import CaveNode from './components/CaveNode';
import CaveTextNode from './components/CaveTextNode';
import CaveImageNode from './components/CaveImageNode';
import CaveControlPanel from './components/CaveControlPanel';
import { INITIAL_NODES } from './constants';
import { generateFlowFromPrompt, summarizeFlow } from './services/geminiService';
import { calculateLayout } from './utils/layout';

// Define custom node types
const nodeTypes = {
  caveNode: CaveNode,
  caveText: CaveTextNode,
  caveImage: CaveImageNode,
};

// Configuration to hide React Flow attribution
const proOptions: ProOptions = { hideAttribution: true };

const STORAGE_KEY = 'cavemind_state_v1';

// Helper to load initial state safely
const getInitialState = () => {
  if (typeof window === 'undefined') return { nodes: INITIAL_NODES, edges: [] };
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      return { 
        nodes: nodes || INITIAL_NODES, 
        edges: edges || [] 
      };
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage', error);
  }
  
  return { nodes: INITIAL_NODES, edges: [] };
};

const { nodes: initialNodes, edges: initialEdges } = getInitialState();

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  const { fitView, screenToFlowPosition, getNodes } = useReactFlow();

  // Auto-save effect with debounce
  useEffect(() => {
    const saveState = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
      } catch (e) {
        console.error("Failed to save state", e);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(saveState);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#555' } }, eds)),
    [setEdges]
  );

  const handleSelectionChange = useCallback(({ nodes: selected }: { nodes: Node[] }) => {
    setSelectedNodes(selected);
    if (selected.length === 0) setSummary(null);
  }, []);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setSummary(null);
    try {
      const data = await generateFlowFromPrompt(prompt);
      if (data) {
        const layout = calculateLayout(data);
        setNodes(layout.nodes);
        setEdges(layout.edges);
        
        // Wait for render then fit view
        setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
      }
    } catch (error) {
      alert("Failed to generate flow. Check API Key or try again.");
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
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleClear = () => {
    // Clear state
    setNodes([]);
    setEdges([]);
    setSummary(null);
    // Clear storage immediately
    localStorage.removeItem(STORAGE_KEY);
  };

  // Add node manually (Center of screen)
  const handleAddNode = (type: 'caveNode' | 'caveText' | 'caveImage' = 'caveNode') => {
    const id = `${Date.now()}`;
    const flowCenter = screenToFlowPosition({
        x: window.innerWidth / 2 + (Math.random() * 40 - 20),
        y: window.innerHeight / 2 + (Math.random() * 40 - 20)
    });

    let data = {};
    if (type === 'caveNode') data = { label: 'New Process' };
    if (type === 'caveText') data = { text: '' };
    if (type === 'caveImage') data = { src: '' };

    const newNode: Node = {
      id,
      position: flowCenter,
      data,
      type,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Add node via Right Click
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'caveNode',
        position,
        data: { label: 'New Node' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Drag and Drop Handler for Images
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                const newNode: Node = {
                    id: `${Date.now()}`,
                    type: 'caveImage',
                    position,
                    data: { src },
                };
                setNodes((nds) => nds.concat(newNode));
            };
            reader.readAsDataURL(file);
        }
      }
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div 
        className="w-screen h-screen bg-[#0A0A0A] relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <h1 className="text-4xl text-[#E5E5E5] font-jersey tracking-wider">
          CAVE<span className="text-[#FF3333]">MIND</span>
        </h1>
        <p className="text-[#555] text-xs font-mono mt-1">MODO CAVERNA OS v1.1</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onSelectionChange={handleSelectionChange}
        onPaneContextMenu={onPaneContextMenu}
        fitView
        proOptions={proOptions}
        className="bg-[#0A0A0A]"
        minZoom={0.1}
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#333333" 
        />
        <Controls 
            className="!bg-[#1A1A1A] !border !border-[#333] !shadow-xl !rounded-md overflow-hidden [&>button]:!border-b-[#333] [&>button]:!bg-[#1A1A1A] [&>button]:!fill-[#E5E5E5] [&>button:hover]:!bg-[#333] [&>button:hover]:!fill-white last:[&>button]:!border-b-0"
        />
      </ReactFlow>

      {/* Summary Overlay */}
      {summary && (
        <div className="absolute top-24 right-6 w-80 bg-[#1A1A1A]/95 backdrop-blur border border-[#333] p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[500px] z-50 animate-in fade-in slide-in-from-right-10">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                <h3 className="text-[#FF7A33] font-bold uppercase text-xs tracking-widest">Strategy Report</h3>
                <button onClick={() => setSummary(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="prose prose-invert prose-sm text-gray-300 font-sans">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{summary}</pre>
            </div>
        </div>
      )}

      <CaveControlPanel 
        onGenerate={handleGenerate} 
        onSummarize={handleSummarize}
        onClear={handleClear}
        onAddNode={handleAddNode}
        isGenerating={isGenerating}
        hasSelection={selectedNodes.length > 0}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}