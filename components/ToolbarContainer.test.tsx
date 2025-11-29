import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import ToolbarContainer from './ToolbarContainer';
import { ToolbarPosition } from '../stores/toolbarStore';

describe('ToolbarContainer', () => {
  /**
   * Feature: adaptive-dockable-toolbar, Property 1: Toolbar orientation matches position
   * Validates: Requirements 1.3, 1.4
   * 
   * For any toolbar position (top, bottom, left, right), the toolbar layout orientation 
   * should be horizontal for top/bottom and vertical for left/right
   */
  it('should have correct orientation for all positions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        (position) => {
          const { container } = render(
            <ToolbarContainer position={position}>
              <div>Test Child</div>
            </ToolbarContainer>
          );

          const toolbarElement = container.firstChild as HTMLElement;
          const classes = toolbarElement.className;

          // Check orientation based on position
          if (position === 'top' || position === 'bottom') {
            // Horizontal orientation
            expect(classes).toContain('flex-row');
            expect(classes).not.toContain('flex-col');
          } else {
            // Vertical orientation (left or right)
            expect(classes).toContain('flex-col');
            expect(classes).not.toContain('flex-row');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct positioning classes for each position', () => {
    const positions: ToolbarPosition[] = ['top', 'bottom', 'left', 'right'];
    
    positions.forEach((position) => {
      const { container } = render(
        <ToolbarContainer position={position}>
          <div>Test Child</div>
        </ToolbarContainer>
      );

      const toolbarElement = container.firstChild as HTMLElement;
      const classes = toolbarElement.className;

      // Verify base classes
      expect(classes).toContain('fixed');
      expect(classes).toContain('z-40');
      expect(classes).toContain('transition-all');
      expect(classes).toContain('duration-300');

      // Verify position-specific classes
      switch (position) {
        case 'top':
          expect(classes).toContain('top-8');
          expect(classes).toContain('rounded-b-2xl');
          break;
        case 'bottom':
          expect(classes).toContain('bottom-8');
          expect(classes).toContain('rounded-t-2xl');
          break;
        case 'left':
          expect(classes).toContain('left-8');
          expect(classes).toContain('rounded-r-2xl');
          break;
        case 'right':
          expect(classes).toContain('right-8');
          expect(classes).toContain('rounded-l-2xl');
          break;
      }
    });
  });
});
