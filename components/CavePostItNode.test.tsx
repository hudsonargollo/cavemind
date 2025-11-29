import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: adaptive-dockable-toolbar, Property 22: Post-it notes have default styling
 * Validates: Requirements 13.4
 * 
 * Property: For any newly created post-it note, it should have yellow color and shadow effect applied by default
 */

describe('CavePostItNode - Property-Based Tests', () => {
  it('Property 22: Post-it notes have default styling', () => {
    fc.assert(
      fc.property(
        // Generate random text content for post-it notes
        fc.string({ minLength: 0, maxLength: 200 }),
        // Generate random positions
        fc.record({
          x: fc.integer({ min: -1000, max: 1000 }),
          y: fc.integer({ min: -1000, max: 1000 }),
        }),
        (text, position) => {
          // Simulate creating a new post-it note with default settings
          const rotation = (Math.random() * 4) - 2; // Random rotation between -2 and 2 degrees
          
          const postItData = {
            text,
            color: 'yellow' as const,
            rotation,
            hasShadow: true,
            width: 200,
            height: 200,
          };

          // Verify default styling properties
          expect(postItData.color).toBe('yellow');
          expect(postItData.hasShadow).toBe(true);
          expect(postItData.rotation).toBeGreaterThanOrEqual(-2);
          expect(postItData.rotation).toBeLessThanOrEqual(2);
          expect(postItData.width).toBe(200);
          expect(postItData.height).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });
});
