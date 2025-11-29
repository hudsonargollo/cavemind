import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import ArrowConnector from './ArrowConnector';
import { ArrowConnectorData } from '../types';

describe('ArrowConnector', () => {
  describe('Property 21: Arrow creation connects two points', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 21: Arrow creation connects two points
     * Validates: Requirements 13.2
     * 
     * For any arrow drawing operation from point A to point B, 
     * the system should create an arrow connector with those endpoints
     */
    it('should create arrows with exact start and end points for any valid coordinates', () => {
      fc.assert(
        fc.property(
          // Generate random start and end points within reasonable bounds
          fc.record({
            startX: fc.integer({ min: 0, max: 1000 }),
            startY: fc.integer({ min: 0, max: 1000 }),
            endX: fc.integer({ min: 0, max: 1000 }),
            endY: fc.integer({ min: 0, max: 1000 }),
          }),
          (points) => {
            // Calculate distance to ensure meaningful arrow (at least 10px)
            const distance = Math.sqrt(
              Math.pow(points.endX - points.startX, 2) + 
              Math.pow(points.endY - points.startY, 2)
            );
            
            // Skip if distance is too small (less than 10px)
            fc.pre(distance >= 10);
            
            const createdArrows: ArrowConnectorData[] = [];
            const onArrowCreate = vi.fn((arrow: Omit<ArrowConnectorData, 'id'>) => {
              const newArrow: ArrowConnectorData = {
                ...arrow,
                id: `arrow-${Date.now()}-${Math.random()}`,
              };
              createdArrows.push(newArrow);
            });

            const { container } = render(
              <ArrowConnector
                arrows={[]}
                isDrawingMode={true}
                onArrowCreate={onArrowCreate}
                onArrowUpdate={vi.fn()}
                onArrowDelete={vi.fn()}
              />
            );

            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();

            if (!svg) return;

            // Simulate drawing an arrow from start to end point
            const rect = { left: 0, top: 0, width: 1000, height: 1000 };
            svg.getBoundingClientRect = vi.fn(() => rect as DOMRect);

            // Mouse down at start point
            fireEvent.mouseDown(svg, {
              clientX: points.startX,
              clientY: points.startY,
            });

            // Mouse move to end point
            fireEvent.mouseMove(svg, {
              clientX: points.endX,
              clientY: points.endY,
            });

            // Mouse up at end point
            fireEvent.mouseUp(svg, {
              clientX: points.endX,
              clientY: points.endY,
            });

            // Verify arrow was created
            expect(onArrowCreate).toHaveBeenCalledTimes(1);
            expect(createdArrows).toHaveLength(1);

            const createdArrow = createdArrows[0];

            // Property: Arrow endpoints must match the drawn coordinates exactly
            expect(createdArrow.startPoint.x).toBe(points.startX);
            expect(createdArrow.startPoint.y).toBe(points.startY);
            expect(createdArrow.endPoint.x).toBe(points.endX);
            expect(createdArrow.endPoint.y).toBe(points.endY);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should not create arrows for very short drags (less than 10px)', () => {
      fc.assert(
        fc.property(
          // Generate points that are very close together
          fc.record({
            startX: fc.integer({ min: 100, max: 900 }),
            startY: fc.integer({ min: 100, max: 900 }),
            deltaX: fc.integer({ min: -9, max: 9 }),
            deltaY: fc.integer({ min: -9, max: 9 }),
          }),
          (points) => {
            const endX = points.startX + points.deltaX;
            const endY = points.startY + points.deltaY;
            
            const distance = Math.sqrt(
              Math.pow(points.deltaX, 2) + Math.pow(points.deltaY, 2)
            );
            
            // Only test cases where distance is less than 10px
            fc.pre(distance < 10);

            const onArrowCreate = vi.fn();

            const { container } = render(
              <ArrowConnector
                arrows={[]}
                isDrawingMode={true}
                onArrowCreate={onArrowCreate}
                onArrowUpdate={vi.fn()}
                onArrowDelete={vi.fn()}
              />
            );

            const svg = container.querySelector('svg');
            if (!svg) return;

            const rect = { left: 0, top: 0, width: 1000, height: 1000 };
            svg.getBoundingClientRect = vi.fn(() => rect as DOMRect);

            fireEvent.mouseDown(svg, {
              clientX: points.startX,
              clientY: points.startY,
            });

            fireEvent.mouseMove(svg, {
              clientX: endX,
              clientY: endY,
            });

            fireEvent.mouseUp(svg, {
              clientX: endX,
              clientY: endY,
            });

            // Property: Very short drags should not create arrows
            expect(onArrowCreate).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve arrow properties when creating with different styles', () => {
      fc.assert(
        fc.property(
          fc.record({
            startX: fc.integer({ min: 0, max: 1000 }),
            startY: fc.integer({ min: 0, max: 1000 }),
            endX: fc.integer({ min: 0, max: 1000 }),
            endY: fc.integer({ min: 0, max: 1000 }),
          }),
          (points) => {
            const distance = Math.sqrt(
              Math.pow(points.endX - points.startX, 2) + 
              Math.pow(points.endY - points.startY, 2)
            );
            
            fc.pre(distance >= 10);

            const createdArrows: ArrowConnectorData[] = [];
            const onArrowCreate = vi.fn((arrow: Omit<ArrowConnectorData, 'id'>) => {
              const newArrow: ArrowConnectorData = {
                ...arrow,
                id: `arrow-${Date.now()}-${Math.random()}`,
              };
              createdArrows.push(newArrow);
            });

            const { container } = render(
              <ArrowConnector
                arrows={[]}
                isDrawingMode={true}
                onArrowCreate={onArrowCreate}
                onArrowUpdate={vi.fn()}
                onArrowDelete={vi.fn()}
              />
            );

            const svg = container.querySelector('svg');
            if (!svg) return;

            const rect = { left: 0, top: 0, width: 1000, height: 1000 };
            svg.getBoundingClientRect = vi.fn(() => rect as DOMRect);

            fireEvent.mouseDown(svg, { clientX: points.startX, clientY: points.startY });
            fireEvent.mouseMove(svg, { clientX: points.endX, clientY: points.endY });
            fireEvent.mouseUp(svg, { clientX: points.endX, clientY: points.endY });

            expect(createdArrows).toHaveLength(1);
            const arrow = createdArrows[0];

            // Property: Created arrows should have default properties
            expect(arrow.style).toBe('solid');
            expect(arrow.headStyle).toBe('triangle');
            expect(arrow.color).toBe('#E5E5E5');
            expect(arrow.strokeWidth).toBe(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Arrow rendering', () => {
    it('should render existing arrows with correct endpoints', () => {
      const testArrows: ArrowConnectorData[] = [
        {
          id: 'arrow-1',
          startPoint: { x: 100, y: 100 },
          endPoint: { x: 200, y: 200 },
          style: 'solid',
          headStyle: 'triangle',
          color: '#E5E5E5',
          strokeWidth: 2,
        },
      ];

      const { container } = render(
        <ArrowConnector
          arrows={testArrows}
          isDrawingMode={false}
          onArrowCreate={vi.fn()}
          onArrowUpdate={vi.fn()}
          onArrowDelete={vi.fn()}
        />
      );

      const line = container.querySelector('line');
      expect(line).toBeTruthy();
      expect(line?.getAttribute('x1')).toBe('100');
      expect(line?.getAttribute('y1')).toBe('100');
      expect(line?.getAttribute('x2')).toBe('200');
      expect(line?.getAttribute('y2')).toBe('200');
    });

    it('should not allow drawing when not in drawing mode', () => {
      const onArrowCreate = vi.fn();

      const { container } = render(
        <ArrowConnector
          arrows={[]}
          isDrawingMode={false}
          onArrowCreate={onArrowCreate}
          onArrowUpdate={vi.fn()}
          onArrowDelete={vi.fn()}
        />
      );

      const svg = container.querySelector('svg');
      if (!svg) return;

      const rect = { left: 0, top: 0, width: 1000, height: 1000 };
      svg.getBoundingClientRect = vi.fn(() => rect as DOMRect);

      fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(svg, { clientX: 200, clientY: 200 });

      expect(onArrowCreate).not.toHaveBeenCalled();
    });
  });
});
