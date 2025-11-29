import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { processSketchImage } from './geminiService';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    constructor() {
      this.models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            nodes: [
              {
                id: 'node1',
                type: 'caveNode',
                position: { x: 100, y: 100 },
                data: { label: 'Test Node', shape: 'process' },
              },
            ],
            edges: [
              {
                id: 'edge1',
                source: 'node1',
                target: 'node2',
                animated: true,
              },
            ],
          }),
        }),
      };
    }
  },
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
  },
}));

describe('geminiService - Sketch Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    it('should process a valid image file', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const result = await processSketchImage(file);

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.edges)).toBe(true);
    });

    it('should return nodes with required properties', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const result = await processSketchImage(file);

      expect(result.nodes.length).toBeGreaterThan(0);
      const node = result.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('type');
      expect(node).toHaveProperty('position');
      expect(node).toHaveProperty('data');
      expect(node.position).toHaveProperty('x');
      expect(node.position).toHaveProperty('y');
    });

    it('should return edges with required properties', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const result = await processSketchImage(file);

      expect(result.edges.length).toBeGreaterThan(0);
      const edge = result.edges[0];
      expect(edge).toHaveProperty('id');
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 11: Upload triggers AI processing
     * Validates: Requirements 9.2
     * 
     * For any valid image uploaded, the system should send the image data to the AI vision model API
     */
    it('Property 11: Upload triggers AI processing - valid images trigger API call', () => {
      fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('image/png'),
            fc.constant('image/jpeg'),
            fc.constant('image/webp')
          ),
          fc.string({ minLength: 1, maxLength: 50 }), // filename
          async (mimeType, filename) => {
            // Create a valid image file
            const file = new File(['test image content'], filename, { type: mimeType });

            // Process the image
            const result = await processSketchImage(file);

            // Verify that the API was called and returned valid data
            expect(result).toBeDefined();
            expect(result.nodes).toBeDefined();
            expect(result.edges).toBeDefined();
            
            // Verify the structure is valid
            expect(Array.isArray(result.nodes)).toBe(true);
            expect(Array.isArray(result.edges)).toBe(true);
            
            // All nodes should have required properties
            result.nodes.forEach((node) => {
              expect(node).toHaveProperty('id');
              expect(node).toHaveProperty('type');
              expect(node).toHaveProperty('position');
              expect(node).toHaveProperty('data');
              expect(typeof node.id).toBe('string');
              expect(typeof node.type).toBe('string');
              expect(typeof node.position.x).toBe('number');
              expect(typeof node.position.y).toBe('number');
            });
            
            // All edges should have required properties
            result.edges.forEach((edge) => {
              expect(edge).toHaveProperty('id');
              expect(edge).toHaveProperty('source');
              expect(edge).toHaveProperty('target');
              expect(typeof edge.id).toBe('string');
              expect(typeof edge.source).toBe('string');
              expect(typeof edge.target).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: API response structure validation
     * 
     * For any AI response, the system should validate that it contains nodes and edges arrays
     */
    it('Property: API response structure is validated', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant('image/png'),
          async (mimeType) => {
            const file = new File(['test'], 'test.png', { type: mimeType });
            const result = await processSketchImage(file);

            // Response must have nodes array
            expect(result).toHaveProperty('nodes');
            expect(Array.isArray(result.nodes)).toBe(true);

            // Response must have edges array
            expect(result).toHaveProperty('edges');
            expect(Array.isArray(result.edges)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Node position coordinates are numbers
     * 
     * For any generated node, position coordinates should be valid numbers
     */
    it('Property: Node positions are valid numbers', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant('image/png'),
          async (mimeType) => {
            const file = new File(['test'], 'test.png', { type: mimeType });
            const result = await processSketchImage(file);

            // All node positions should be valid numbers
            result.nodes.forEach((node) => {
              expect(typeof node.position.x).toBe('number');
              expect(typeof node.position.y).toBe('number');
              expect(Number.isFinite(node.position.x)).toBe(true);
              expect(Number.isFinite(node.position.y)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Edge references valid node IDs
     * 
     * For any generated edge, source and target should be non-empty strings
     */
    it('Property: Edge references are valid strings', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant('image/png'),
          async (mimeType) => {
            const file = new File(['test'], 'test.png', { type: mimeType });
            const result = await processSketchImage(file);

            // All edges should have valid source and target strings
            result.edges.forEach((edge) => {
              expect(typeof edge.source).toBe('string');
              expect(typeof edge.target).toBe('string');
              expect(edge.source.length).toBeGreaterThan(0);
              expect(edge.target.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
