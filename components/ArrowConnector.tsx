import React, { useState, useCallback, useEffect } from 'react';
import { ArrowConnectorData } from '../types';

interface ArrowConnectorProps {
  arrows: ArrowConnectorData[];
  isDrawingMode: boolean;
  onArrowCreate: (arrow: Omit<ArrowConnectorData, 'id'>) => void;
  onArrowUpdate: (id: string, updates: Partial<ArrowConnectorData>) => void;
  onArrowDelete: (id: string) => void;
  selectedArrowId?: string;
  onArrowSelect?: (id: string | undefined) => void;
}

const ArrowConnector: React.FC<ArrowConnectorProps> = ({
  arrows,
  isDrawingMode,
  onArrowCreate,
  onArrowUpdate,
  onArrowDelete,
  selectedArrowId,
  onArrowSelect,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  // Handle mouse down to start drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
  }, [isDrawingMode]);

  // Handle mouse move while drawing
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPoint({ x, y });
  }, [isDrawing, startPoint]);

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !startPoint || !currentPoint) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    // Only create arrow if there's meaningful distance (at least 10px)
    const distance = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
    if (distance > 10) {
      onArrowCreate({
        startPoint: startPoint,
        endPoint: { x: endX, y: endY },
        style: 'solid',
        headStyle: 'triangle',
        color: '#E5E5E5',
        strokeWidth: 2,
      });
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [isDrawing, startPoint, currentPoint, onArrowCreate]);

  // Render arrow head marker
  const renderArrowHead = (headStyle: ArrowConnectorData['headStyle'], color: string, id: string) => {
    switch (headStyle) {
      case 'triangle':
        return (
          <marker
            id={`arrowhead-${id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={color} />
          </marker>
        );
      case 'circle':
        return (
          <marker
            id={`arrowhead-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle cx="4" cy="4" r="3" fill={color} />
          </marker>
        );
      case 'diamond':
        return (
          <marker
            id={`arrowhead-${id}`}
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,5 L5,0 L10,5 L5,10 z" fill={color} />
          </marker>
        );
      case 'none':
      default:
        return null;
    }
  };

  // Get stroke dash array based on style
  const getStrokeDashArray = (style: ArrowConnectorData['style']) => {
    switch (style) {
      case 'dashed':
        return '10,5';
      case 'dotted':
        return '2,3';
      case 'solid':
      default:
        return 'none';
    }
  };

  // Handle arrow click for selection
  const handleArrowClick = useCallback((e: React.MouseEvent, arrowId: string) => {
    e.stopPropagation();
    if (onArrowSelect) {
      onArrowSelect(arrowId === selectedArrowId ? undefined : arrowId);
    }
  }, [selectedArrowId, onArrowSelect]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedArrowId) {
        onArrowDelete(selectedArrowId);
        if (onArrowSelect) {
          onArrowSelect(undefined);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArrowId, onArrowDelete, onArrowSelect]);

  return (
    <svg
      className={`absolute inset-0 w-full h-full ${isDrawingMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ zIndex: isDrawingMode ? 10 : 1 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => {
        if (!isDrawingMode && onArrowSelect) {
          onArrowSelect(undefined);
        }
      }}
    >
      <defs>
        {/* Render arrow head markers for all arrows */}
        {arrows.map((arrow) => renderArrowHead(arrow.headStyle, arrow.color, arrow.id))}
        {/* Render marker for current drawing arrow */}
        {isDrawing && startPoint && currentPoint && renderArrowHead('triangle', '#E5E5E5', 'temp')}
      </defs>

      {/* Render existing arrows */}
      {arrows.map((arrow) => (
        <g key={arrow.id}>
          <line
            x1={arrow.startPoint.x}
            y1={arrow.startPoint.y}
            x2={arrow.endPoint.x}
            y2={arrow.endPoint.y}
            stroke={arrow.color}
            strokeWidth={arrow.strokeWidth}
            strokeDasharray={getStrokeDashArray(arrow.style)}
            markerEnd={arrow.headStyle !== 'none' ? `url(#arrowhead-${arrow.id})` : undefined}
            onClick={(e) => handleArrowClick(e, arrow.id)}
            className={`cursor-pointer transition-all pointer-events-auto ${
              selectedArrowId === arrow.id ? 'stroke-[#FF3333]' : 'hover:opacity-70'
            }`}
            style={{ pointerEvents: 'stroke' }}
          />
          {/* Selection indicators */}
          {selectedArrowId === arrow.id && (
            <>
              <circle
                cx={arrow.startPoint.x}
                cy={arrow.startPoint.y}
                r="4"
                fill="#FF3333"
                className="pointer-events-none"
              />
              <circle
                cx={arrow.endPoint.x}
                cy={arrow.endPoint.y}
                r="4"
                fill="#FF3333"
                className="pointer-events-none"
              />
            </>
          )}
        </g>
      ))}

      {/* Render arrow being drawn */}
      {isDrawing && startPoint && currentPoint && (
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={currentPoint.x}
          y2={currentPoint.y}
          stroke="#E5E5E5"
          strokeWidth={2}
          strokeDasharray="none"
          markerEnd="url(#arrowhead-temp)"
          className="pointer-events-none opacity-70"
        />
      )}
    </svg>
  );
};

export default ArrowConnector;
