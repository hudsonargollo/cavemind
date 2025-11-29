import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import * as fc from 'fast-check';
import React from 'react';
import CaveNode from './CaveNode';
import { CaveNodeData } from '../types';
import { NodeShape } from '../constants';

// Helper to render a node with ReactFlow context
const renderNode = (data: CaveNodeData, selected = false, id = 'test-node') => {
  return render(
    <ReactFlowProvider>
      <CaveNode
        id={id}
        data={data}
        selected={selected}
        type="caveNode"
        isConnectable={true}
        xPos={0}
        yPos={0}
        zIndex={0}
        dragging={false}
      />
    </ReactFlowProvider>
  );
};

// Arbitrary generator for node shapes
const shapeArbitrary = fc.constantFrom<NodeShape>('process', 'decision', 'circle', 'parallelogram');

// Arbitrary generator for node labels (non-empty, non-whitespace-only)
const labelArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('CaveNode Inline Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 17: Double-click activates inline editing', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 17: Double-click activates inline editing
     * Validates: Requirements 11.1, 11.2
     */
    it('should activate inline editing mode with cursor visible on double-click', async () => {
      await fc.assert(
        fc.asyncProperty(
          labelArbitrary,
          shapeArbitrary,
          async (label, shape) => {
            const data: CaveNodeData = { label, shape };
            const { container, unmount } = renderNode(data, true);

            // Find the shape div (the one with onDoubleClick handler)
            const shapeDiv = container.querySelector('.shadow-lg');
            expect(shapeDiv).toBeTruthy();

            // Double-click the node
            await act(async () => {
              fireEvent.doubleClick(shapeDiv!);
            });

            // Wait for state update with a shorter timeout
            await waitFor(() => {
              const editableElement = container.querySelector('[contenteditable="true"]');
              expect(editableElement).toBeTruthy();
            }, { timeout: 1000 });

            // Property: After double-click, an editable element should be present
            const editableElement = container.querySelector('[contenteditable="true"]');
            
            // Property: The editable element should contain the current label
            expect(editableElement?.textContent).toBe(label);
            
            // Property: The editable element should have contenteditable attribute
            expect(editableElement?.getAttribute('contenteditable')).toBe('true');

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 18: Enter key saves inline edits', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 18: Enter key saves inline edits
     * Validates: Requirements 11.3
     */
    it('should save changes and exit editing mode when Enter is pressed', async () => {
      await fc.assert(
        fc.asyncProperty(
          labelArbitrary,
          labelArbitrary,
          shapeArbitrary,
          async (originalLabel, newLabel, shape) => {
            // Skip if labels are the same
            fc.pre(originalLabel !== newLabel);
            
            const data: CaveNodeData = { label: originalLabel, shape };
            const nodeId = `test-node-${Date.now()}-${Math.random()}`;
            const { container, unmount } = renderNode(data, true, nodeId);

            // Activate editing mode - double-click the shape div
            const shapeDiv = container.querySelector('.shadow-lg');
            await act(async () => {
              fireEvent.doubleClick(shapeDiv!);
            });

            // Wait for editing mode to activate
            await waitFor(() => {
              const editableElement = container.querySelector('[contenteditable="true"]');
              expect(editableElement).toBeTruthy();
            }, { timeout: 1000 });

            // Find the editable element
            const editableElement = container.querySelector('[contenteditable="true"]') as HTMLElement;

            // Change the text
            editableElement.textContent = newLabel;
            fireEvent.input(editableElement);

            // Mock the event listener to capture the update
            let capturedLabel: string | null = null;
            const mockListener = (e: Event) => {
              const customEvent = e as CustomEvent<{ nodeId: string; label: string }>;
              if (customEvent.detail.nodeId === nodeId) {
                capturedLabel = customEvent.detail.label;
              }
            };
            window.addEventListener('updateNodeLabel', mockListener);

            // Press Enter
            await act(async () => {
              fireEvent.keyDown(editableElement, { key: 'Enter' });
            });

            // Property: After Enter, the custom event should be dispatched with new label
            expect(capturedLabel).toBe(newLabel);

            // Property: After Enter, editing mode should be exited
            await waitFor(() => {
              const editableAfter = container.querySelector('[contenteditable="true"]');
              expect(editableAfter).toBeFalsy();
            }, { timeout: 1000 });

            window.removeEventListener('updateNodeLabel', mockListener);
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Escape key cancels inline edits', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 19: Escape key cancels inline edits
     * Validates: Requirements 11.4
     */
    it('should discard changes and restore original text when Escape is pressed', async () => {
      await fc.assert(
        fc.asyncProperty(
          labelArbitrary,
          labelArbitrary,
          shapeArbitrary,
          async (originalLabel, newLabel, shape) => {
            // Skip if labels are the same
            fc.pre(originalLabel !== newLabel);
            
            const data: CaveNodeData = { label: originalLabel, shape };
            const nodeId = `test-node-${Date.now()}-${Math.random()}`;
            const { container, unmount } = renderNode(data, true, nodeId);

            // Activate editing mode - double-click the shape div
            const shapeDiv = container.querySelector('.shadow-lg');
            await act(async () => {
              fireEvent.doubleClick(shapeDiv!);
            });

            // Wait for editing mode to activate
            await waitFor(() => {
              const editableElement = container.querySelector('[contenteditable="true"]');
              expect(editableElement).toBeTruthy();
            }, { timeout: 1000 });

            // Find the editable element
            const editableElement = container.querySelector('[contenteditable="true"]') as HTMLElement;

            // Change the text
            editableElement.textContent = newLabel;
            fireEvent.input(editableElement);

            // Mock the event listener to ensure no update is dispatched
            let eventDispatched = false;
            const mockListener = () => {
              eventDispatched = true;
            };
            window.addEventListener('updateNodeLabel', mockListener);

            // Press Escape
            await act(async () => {
              fireEvent.keyDown(editableElement, { key: 'Escape' });
            });

            // Property: After Escape, no update event should be dispatched
            expect(eventDispatched).toBe(false);

            // Property: After Escape, editing mode should be exited
            await waitFor(() => {
              const editableAfter = container.querySelector('[contenteditable="true"]');
              expect(editableAfter).toBeFalsy();
            }, { timeout: 1000 });

            // Property: The displayed label should still be the original
            // Find the label by looking for the non-editable text div
            const labelElement = container.querySelector('.font-medium.text-sm');
            expect(labelElement?.textContent).toBe(originalLabel);

            window.removeEventListener('updateNodeLabel', mockListener);
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
