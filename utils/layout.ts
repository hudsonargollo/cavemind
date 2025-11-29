import { Node, Edge } from '@xyflow/react';
import { GeminiFlowResponse } from '../types';

/**
 * A simple layered layout algorithm to arrange nodes without external heavy libraries like dagre.
 * It identifies levels based on dependencies and positions them in a grid.
 */
export const calculateLayout = (
  data: GeminiFlowResponse
): { nodes: Node[]; edges: Edge[] } => {
  const nodeWidth = 200;
  const nodeHeight = 80;
  const xSpacing = 250;
  const ySpacing = 150;

  const nodesMap = new Map<string, { id: string; label: string; level: number; x: number; y: number }>();
  
  // Initialize nodes
  data.nodes.forEach((n) => {
    nodesMap.set(n.id, { ...n, level: 0, x: 0, y: 0 });
  });

  // Calculate levels (simple BFS-like approach)
  // 1. Find root nodes (nodes that are not targets)
  const targets = new Set(data.edges.map((e) => e.target));
  const roots = data.nodes.filter((n) => !targets.has(n.id));

  // If no roots (circular or isolated), pick the first one
  const queue = roots.length > 0 ? roots.map(r => ({ id: r.id, level: 0 })) : [{ id: data.nodes[0].id, level: 0 }];
  const visited = new Set<string>();

  // Determine vertical levels (depth)
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const node = nodesMap.get(current.id);
    if (node) {
      node.level = Math.max(node.level, current.level);
    }

    // Find children
    const childrenEdges = data.edges.filter((e) => e.source === current.id);
    childrenEdges.forEach((e) => {
      queue.push({ id: e.target, level: current.level + 1 });
    });
  }

  // Group by level to calculate X position
  const levels: Record<number, string[]> = {};
  nodesMap.forEach((node) => {
    if (!levels[node.level]) levels[node.level] = [];
    levels[node.level].push(node.id);
  });

  // Assign X/Y coordinates
  const finalNodes: Node[] = [];
  
  Object.keys(levels).forEach((levelStr) => {
    const level = parseInt(levelStr);
    const nodesInLevel = levels[level];
    const totalWidth = nodesInLevel.length * xSpacing;
    const startX = -(totalWidth / 2); // Center align

    nodesInLevel.forEach((nodeId, index) => {
      const nodeData = nodesMap.get(nodeId)!;
      const x = startX + index * xSpacing;
      const y = level * ySpacing;

      finalNodes.push({
        id: nodeData.id,
        type: 'caveNode',
        position: { x, y },
        data: { label: nodeData.label },
      });
    });
  });

  // Format edges
  const finalEdges: Edge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: '#555' },
    label: e.label,
  }));

  return { nodes: finalNodes, edges: finalEdges };
};