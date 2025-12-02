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
import CavePostItNode from './components/CavePostItNode';
import ResizableTextNode from './components/ResizableTextNode';
import AdaptiveDockableToolbar from './components/AdaptiveDockableToolbar';
import ArrowConnector from './components/ArrowConnector';
import ContextMenu from './components/ContextMenu';
import CommandPalette, { Command } from './components/CommandPalette'; // Corrected import
import LoginModal from './components/auth/LoginModal';
import PricingModal from './components/auth/PricingModal';
import SketchUploadModal from './components/SketchUploadModal';
import PasswordLockModal from './components/PasswordLockModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { INITIAL_NODES, STICKERS } from './constants';
import { generateFlowFromPrompt, summarizeFlow, processSketchImage } from './services/geminiService';
import { calculateLayout } from './utils/layout';
import { ArrowConnectorData } from './types';

// Define custom node types
const nodeTypes = {
  caveNode: CaveNode,
  caveText: CaveTextNode,
  caveImage: CaveImageNode,
  caveSticker: CaveStickerNode,
  cavePostIt: CavePostItNode,
  resizableText: ResizableTextNode,
};

const proOptions: ProOptions = { hideAttribution: true };
const STORAGE_KEY = 'cavemind_state_v1';
const ARROWS_STORAGE_KEY = 'cavemind_arrows_v1';

// History Structure
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  arrows: ArrowConnectorData[];
}

// Helper to load initial state
const getInitialState = () => {
  if (typeof window === 'undefined') return { nodes: INITIAL_NODES, edges: [], arrows: [] };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      const arrowsSaved = localStorage.getItem(ARROWS_STORAGE_KEY);
      const arrows = arrowsSaved ? JSON.parse(arrowsSaved) : [];
      return { nodes: nodes || INITIAL_NODES, edges: edges || [], arrows };
    }
  } catch (error) { console.warn('Failed to load state', error); }
  return { nodes: INITIAL_NODES, edges: [], arrows: [] };
};

const { nodes: initialNodes, edges: initialEdges, arrows: initialArrows } = getInitialState();

function Flow() {
  const { user, login, upgradePlan } = useAuth();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [arrows, setArrows] = useState<ArrowConnectorData[]>(initialArrows);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedNodeColor, setSelectedNodeColor] = useState<string>('#333333');
  
  // Arrow drawing state
  const [isArrowDrawingMode, setIsArrowDrawingMode] = useState(false);
  const [selectedArrowId, setSelectedArrowId] = useState<string | undefined>(undefined);
  
  // UI State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSketchUploadOpen, setIsSketchUploadOpen] = useState(false);
  const [isProcessingSketch, setIsProcessingSketch] = useState(false);
  const [isPasswordLockOpen, setIsPasswordLockOpen] = useState(false);
  const [passwordLockMode, setPasswordLockMode] = useState<'set' | 'unlock'>('set');
  const [isDocumentLocked, setIsDocumentLocked] = useState(false);
  const [documentPasswordHash, setDocumentPasswordHash] = useState<string | null>(null);

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
            edges: JSON.parse(JSON.stringify(getEdges())),
            arrows: JSON.parse(JSON.stringify(arrows))
        };
        const newPast = [...curr.past, snapshot];
        if (newPast.length > 50) newPast.shift(); // Limit history depth
        return {
            past: newPast,
            future: []
        };
    });
  }, [getNodes, getEdges, arrows]);

  const undo = useCallback(() => {
    setHistory(curr => {
        if (curr.past.length === 0) return curr;
        const previous = curr.past[curr.past.length - 1];
        const newPast = curr.past.slice(0, -1);
        
        // Push current state to future
        const currentSnapshot = { 
            nodes: JSON.parse(JSON.stringify(getNodes())), 
            edges: JSON.parse(JSON.stringify(getEdges())),
            arrows: JSON.parse(JSON.stringify(arrows))
        };
        
        setNodes(previous.nodes);
        setEdges(previous.edges);
        setArrows(previous.arrows);
        
        return {
            past: newPast,
            future: [currentSnapshot, ...curr.future]
        };
    });
  }, [getNodes, getEdges, arrows, setNodes, setEdges]);

  const redo = useCallback(() => {
    setHistory(curr => {
        if (curr.future.length === 0) return curr;
        const next = curr.future[0];
        const newFuture = curr.future.slice(1);
        
        // Push current state to past
        const currentSnapshot = { 
            nodes: JSON.parse(JSON.stringify(getNodes())), 
            edges: JSON.parse(JSON.stringify(getEdges())),
            arrows: JSON.parse(JSON.stringify(arrows))
        };

        setNodes(next.nodes);
        setEdges(next.edges);
        setArrows(next.arrows);
        
        return {
            past: [...curr.past, currentSnapshot],
            future: newFuture
        };
    });
  }, [getNodes, getEdges, arrows, setNodes, setEdges]);

  // Handle node label updates from inline editing
  useEffect(() => {
    const handleUpdateNodeLabel = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string; label: string }>;
      const { nodeId, label } = customEvent.detail;
      
      // Use ReactFlow's proper update pattern - only update the specific node's data
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label } }
            : node
        )
      );
    };

    const handleUpdatePostItText = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string; text: string }>;
      const { nodeId, text } = customEvent.detail;
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, text } }
            : node
        )
      );
    };

    const handleUpdateResizableText = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string; text: string; title: string }>;
      const { nodeId, text, title } = customEvent.detail;
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, text, title } }
            : node
        )
      );
    };

    window.addEventListener('updateNodeLabel', handleUpdateNodeLabel);
    window.addEventListener('updatePostItText', handleUpdatePostItText);
    window.addEventListener('updateResizableText', handleUpdateResizableText);
    return () => {
      window.removeEventListener('updateNodeLabel', handleUpdateNodeLabel);
      window.removeEventListener('updatePostItText', handleUpdatePostItText);
      window.removeEventListener('updateResizableText', handleUpdateResizableText);
    };
  }, [setNodes, takeSnapshot]);

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
      localStorage.setItem(ARROWS_STORAGE_KEY, JSON.stringify(arrows));
    }, 1000);
    return () => clearTimeout(saveState);
  }, [nodes, edges, arrows]);

  const onConnect = useCallback(
    (params: Connection) => {
        takeSnapshot();
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, takeSnapshot]
  );

  const handleSelectionChange = useCallback(({ nodes: selected }: { nodes: Node[] }) => {
    setSelectedNodes(selected);
    if (selected.length === 0) {
      setSummary(null);
      setSelectedNodeColor('#333333');
    }
    if (selected.length === 1) {
      setClipboardNode(selected[0]);
      // Get the current color from the selected node
      const nodeData = selected[0].data as any;
      const currentColor = nodeData.backgroundColor || nodeData.strokeColor || '#333333';
      setSelectedNodeColor(currentColor);
    } else if (selected.length > 1) {
      // For multiple selections, use the first node's color
      const nodeData = selected[0].data as any;
      const currentColor = nodeData.backgroundColor || nodeData.strokeColor || '#333333';
      setSelectedNodeColor(currentColor);
    }
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
    setArrows([]);
    setSummary(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ARROWS_STORAGE_KEY);
  };

  // Add Node Handler
  const handleAddNode = (type: 'caveNode' | 'caveText' | 'caveImage' | 'caveSticker' | 'cavePostIt' | 'resizableText', payload: any = {}) => {
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
    if (type === 'cavePostIt') {
        // Default yellow color with shadow effect and slight rotation (±2 degrees)
        const rotation = (Math.random() * 4) - 2; // Random rotation between -2 and 2 degrees
        data = { 
          text: '', 
          color: payload.color || 'yellow', 
          rotation,
          hasShadow: true,
          width: 200,
          height: 200
        };
    }
    if (type === 'resizableText') data = { text: '', width: 200, height: 100, minWidth: 50, minHeight: 30 };

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

  const handleColorChange = (color: string, property: 'background' | 'stroke' | 'text') => {
    if (selectedNodes.length === 0) return;
    
    takeSnapshot();
    
    // Get IDs of all selected nodes
    const selectedIds = selectedNodes.map(n => n.id);
    
    // Apply color to all selected nodes
    setNodes((nds) => nds.map((n) => {
      if (selectedIds.includes(n.id)) {
        const updatedData = { ...n.data };
        
        // Special handling for post-it notes
        if (n.type === 'cavePostIt') {
          // Map hex colors to post-it color names
          const colorMap: Record<string, 'yellow' | 'pink' | 'blue' | 'green' | 'orange'> = {
            '#FFEB3B': 'yellow',
            '#FFF59D': 'yellow',
            '#F06292': 'pink',
            '#F8BBD0': 'pink',
            '#64B5F6': 'blue',
            '#BBDEFB': 'blue',
            '#81C784': 'green',
            '#C8E6C9': 'green',
            '#FFB74D': 'orange',
            '#FFE0B2': 'orange',
          };
          
          // Try to find a matching post-it color, default to yellow
          updatedData.color = colorMap[color] || 'yellow';
        } else {
          // Apply color based on property type for other nodes
          if (property === 'background') {
            updatedData.backgroundColor = color;
          } else if (property === 'stroke') {
            updatedData.strokeColor = color;
          } else if (property === 'text') {
            updatedData.textColor = color;
          }
        }
        
        return { ...n, data: updatedData };
      }
      return n;
    }));
    
    // Update the selected node color state
    setSelectedNodeColor(color);
    
    // Save color preference per element type
    if (selectedNodes.length > 0) {
      const nodeType = selectedNodes[0].type || 'caveNode';
      const prefKey = `cavemind_color_pref_${nodeType}_${property}`;
      localStorage.setItem(prefKey, color);
    }
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

  // Arrow management functions
  const handleArrowCreate = useCallback((arrow: Omit<ArrowConnectorData, 'id'>) => {
    takeSnapshot();
    const newArrow: ArrowConnectorData = {
      ...arrow,
      id: `arrow-${Date.now()}`,
    };
    setArrows((prev) => [...prev, newArrow]);
  }, [takeSnapshot]);

  const handleArrowUpdate = useCallback((id: string, updates: Partial<ArrowConnectorData>) => {
    takeSnapshot();
    setArrows((prev) => prev.map((arrow) => (arrow.id === id ? { ...arrow, ...updates } : arrow)));
  }, [takeSnapshot]);

  const handleArrowDelete = useCallback((id: string) => {
    takeSnapshot();
    setArrows((prev) => prev.filter((arrow) => arrow.id !== id));
  }, [takeSnapshot]);

  const handleToggleArrowMode = useCallback(() => {
    setIsArrowDrawingMode((prev) => !prev);
    setSelectedArrowId(undefined);
  }, []);

  const handleSketchUpload = useCallback(async (file: File) => {
    setIsProcessingSketch(true);
    try {
      const result = await processSketchImage(file);
      
      // Get viewport center for positioning
      const viewportCenter = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      // Calculate offset to center the generated diagram
      const avgX = result.nodes.reduce((sum, n) => sum + n.position.x, 0) / result.nodes.length;
      const avgY = result.nodes.reduce((sum, n) => sum + n.position.y, 0) / result.nodes.length;
      const offsetX = viewportCenter.x - avgX;
      const offsetY = viewportCenter.y - avgY;
      
      // Convert AI response nodes to Canvas nodes with centered positioning
      const newNodes: Node[] = result.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
        data: node.data,
      }));
      
      // Convert AI response edges to Canvas edges
      const newEdges: Edge[] = result.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated ?? true,
        style: { stroke: '#555' },
      }));
      
      // Take snapshot before adding new nodes
      takeSnapshot();
      
      // Add generated nodes and edges to canvas
      setNodes((nds) => [...nds, ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);
      
      // Close modal and fit view to show new content
      setIsSketchUploadOpen(false);
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
    } catch (error) {
      console.error('Sketch processing failed:', error);
      alert('Failed to process sketch. Please try again.');
    } finally {
      setIsProcessingSketch(false);
    }
  }, [screenToFlowPosition, takeSnapshot, setNodes, setEdges, fitView]);

  // Simple hash function for password
  const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleLockDocument = () => {
    if (isDocumentLocked) {
      // Unlock
      setPasswordLockMode('unlock');
      setIsPasswordLockOpen(true);
    } else {
      // Lock
      setPasswordLockMode('set');
      setIsPasswordLockOpen(true);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (passwordLockMode === 'set') {
      // Set password and lock
      const hash = hashPassword(password);
      setDocumentPasswordHash(hash);
      setIsDocumentLocked(true);
      localStorage.setItem('cavemind_password_hash', hash);
      setIsPasswordLockOpen(false);
    } else {
      // Verify password and unlock
      const hash = hashPassword(password);
      if (hash === documentPasswordHash) {
        setIsDocumentLocked(false);
        setDocumentPasswordHash(null);
        localStorage.removeItem('cavemind_password_hash');
        setIsPasswordLockOpen(false);
      } else {
        alert('Incorrect password');
      }
    }
  };

  // Load password lock status on mount
  useEffect(() => {
    const savedHash = localStorage.getItem('cavemind_password_hash');
    if (savedHash) {
      setDocumentPasswordHash(savedHash);
      setIsDocumentLocked(true);
    }
  }, []);

  const commands: Command[] = [
    { id: 'add-process', label: 'Adicionar Processo', shortcut: 'P', icon: '◻️', action: () => handleAddNode('caveNode', { shape: 'process', label: 'Processo' }) },
    { id: 'add-decision', label: 'Adicionar Decisão', shortcut: 'D', icon: '◇', action: () => handleAddNode('caveNode', { shape: 'decision', label: 'Decisão?' }) },
    { id: 'add-note', label: 'Adicionar Nota', shortcut: 'N', icon: '📝', action: () => handleAddNode('caveText') },
    { id: 'add-image', label: 'Adicionar Imagem', shortcut: 'I', icon: '📷', action: () => handleAddNode('caveImage') },
    { id: 'spark-ai', label: 'Geração Spark AI', shortcut: '✨', icon: '✦', action: () => alert("Clique no botão Spark no painel.") },
    { id: 'export-png', label: 'Exportar como PNG', icon: '🖼️', action: handleExportPNG },
    { id: 'clear', label: 'Limpar Tela', icon: '🗑️', action: handleClear },
    { id: 'login', label: 'Login / Cadastrar', icon: '👤', action: () => setIsLoginOpen(true) },
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
            nodeType={contextMenu.targetNodeId ? nodes.find(n => n.id === contextMenu.targetNodeId)?.type : undefined}
            onClose={() => setContextMenu(null)}
            onAddNode={handleAddNode}
            onPaste={handlePaste}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onChangeShape={handleChangeShape}
          />
      )}

      <div className="relative w-full h-full">
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
          onNodeDragStart={takeSnapshot}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333333" />
          <Controls className="!bg-[#1A1A1A] !border !border-[#333] !shadow-xl !rounded-md overflow-hidden [&>button]:!border-b-[#333] [&>button]:!bg-[#1A1A1A] [&>button]:!fill-[#E5E5E5] [&>button:hover]:!bg-[#333] [&>button:hover]:!fill-white last:[&>button]:!border-b-0"/>
        </ReactFlow>

        {/* Arrow Connector Layer */}
        <ArrowConnector
          arrows={arrows}
          isDrawingMode={isArrowDrawingMode}
          onArrowCreate={handleArrowCreate}
          onArrowUpdate={handleArrowUpdate}
          onArrowDelete={handleArrowDelete}
          selectedArrowId={selectedArrowId}
          onArrowSelect={setSelectedArrowId}
        />
      </div>

      {summary && (
        <div className="absolute top-24 right-6 w-80 bg-[#1A1A1A]/95 backdrop-blur border border-[#333] p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[500px] z-50">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                <h3 className="text-[#FF7A33] font-bold uppercase text-xs tracking-widest">Report</h3>
                <button onClick={() => setSummary(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{summary}</pre>
        </div>
      )}

      <AdaptiveDockableToolbar 
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
        onColorChange={handleColorChange}
        selectedNodeColor={selectedNodeColor}
        selectedNodeType={selectedNodes.length > 0 ? selectedNodes[0].type : undefined}
        isArrowDrawingMode={isArrowDrawingMode}
        onToggleArrowMode={handleToggleArrowMode}
        selectedArrowId={selectedArrowId}
        onArrowUpdate={handleArrowUpdate}
        onOpenSketchUpload={() => setIsSketchUploadOpen(true)}
        isDocumentLocked={isDocumentLocked}
        onToggleLock={handleLockDocument}
      />

      <SketchUploadModal
        isOpen={isSketchUploadOpen}
        onClose={() => setIsSketchUploadOpen(false)}
        onUpload={handleSketchUpload}
        isProcessing={isProcessingSketch}
      />

      <PasswordLockModal
        isOpen={isPasswordLockOpen}
        mode={passwordLockMode}
        onClose={() => setIsPasswordLockOpen(false)}
        onSubmit={handlePasswordSubmit}
      />

      {/* Lock overlay when document is locked */}
      {isDocumentLocked && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-[#1A1A1A] border-2 border-[#FF3333] rounded-xl p-8 text-center pointer-events-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-jersey text-white mb-2">DOCUMENT LOCKED</h2>
            <p className="text-gray-400 font-jersey mb-6">This document is password protected</p>
            <button
              onClick={handleLockDocument}
              className="bg-[#FF3333] hover:bg-[#D92B2B] text-white rounded-lg px-6 py-3 font-jersey transition-all duration-200"
            >
              🔓 Unlock Document
            </button>
          </div>
        </div>
      )}
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