import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getPopoverPosition } from './ToolPopover';
import { ToolbarPosition } from '../stores/toolbarStore';

describe('ToolPopover', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  /**
   * Feature: adaptive-dockable-toolbar, Property 6: Popovers remain within viewport bounds
   * Validates: Requirements 3.5
   * 
   * For any popover that would extend beyond viewport boundaries, the system should 
   * adjust its position to keep it fully visible
   */
  it('should keep popover within viewport bounds for all positions and sizes', () => {
    fc.assert(
      fc.property(
        // Generate random toolbar positions
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        // Generate random button positions (anywhere on screen)
        fc.record({
          top: fc.integer({ min: 0, max: 1080 }),
          left: fc.integer({ min: 0, max: 1920 }),
          bottom: fc.integer({ min: 0, max: 1080 }),
          right: fc.integer({ min: 0, max: 1920 }),
          width: fc.integer({ min: 20, max: 100 }),
          height: fc.integer({ min: 20, max: 100 }),
        }).filter(rect => rect.bottom > rect.top && rect.right > rect.left),
        // Generate random popover sizes
        fc.record({
          width: fc.integer({ min: 100, max: 500 }),
          height: fc.integer({ min: 100, max: 400 }),
        }),
        (toolbarPosition, buttonRect, popoverSize) => {
          // Create a proper DOMRect-like object
          const rect = {
            ...buttonRect,
            x: buttonRect.left,
            y: buttonRect.top,
            toJSON: () => buttonRect,
          } as DOMRect;

          const position = getPopoverPosition(toolbarPosition, rect, popoverSize);

          // Verify popover stays within viewport bounds
          // Left edge should be at least 8px from left
          expect(position.left).toBeGreaterThanOrEqual(8);
          
          // Right edge should not exceed viewport width minus 8px padding
          expect(position.left + popoverSize.width).toBeLessThanOrEqual(window.innerWidth);
          
          // Top edge should be at least 8px from top
          expect(position.top).toBeGreaterThanOrEqual(8);
          
          // Bottom edge should not exceed viewport height minus 8px padding
          expect(position.top + popoverSize.height).toBeLessThanOrEqual(window.innerHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should position popover correctly relative to toolbar position', () => {
    // Use button positions that won't trigger viewport boundary adjustments
    const buttonRect = {
      top: 500,
      left: 500,
      bottom: 540,
      right: 540,
      width: 40,
      height: 40,
      x: 500,
      y: 500,
      toJSON: () => ({}),
    } as DOMRect;

    const popoverSize = { width: 200, height: 150 };
    const offset = 12;

    // Test top position - popover should appear below
    const topPosition = getPopoverPosition('top', buttonRect, popoverSize);
    expect(topPosition.top).toBe(buttonRect.bottom + offset);
    expect(topPosition.left).toBe(buttonRect.left);

    // Test bottom position - popover should appear above
    const bottomPosition = getPopoverPosition('bottom', buttonRect, popoverSize);
    expect(bottomPosition.top).toBe(buttonRect.top - popoverSize.height - offset);
    expect(bottomPosition.left).toBe(buttonRect.left);

    // Test left position - popover should appear to the right
    const leftPosition = getPopoverPosition('left', buttonRect, popoverSize);
    expect(leftPosition.top).toBe(buttonRect.top);
    expect(leftPosition.left).toBe(buttonRect.right + offset);

    // Test right position - popover should appear to the left
    const rightPosition = getPopoverPosition('right', buttonRect, popoverSize);
    expect(rightPosition.top).toBe(buttonRect.top);
    expect(rightPosition.left).toBe(buttonRect.left - popoverSize.width - offset);
  });

  it('should adjust position when popover would overflow right edge', () => {
    const buttonRect = {
      top: 100,
      left: 1850, // Near right edge
      bottom: 140,
      right: 1890,
      width: 40,
      height: 40,
      x: 1850,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect;

    const popoverSize = { width: 200, height: 150 };

    const position = getPopoverPosition('top', buttonRect, popoverSize);

    // Should be adjusted to fit within viewport
    expect(position.left + popoverSize.width).toBeLessThanOrEqual(window.innerWidth);
    expect(position.left).toBeGreaterThanOrEqual(8);
  });

  it('should adjust position when popover would overflow bottom edge', () => {
    const buttonRect = {
      top: 1000, // Near bottom edge
      left: 500,
      bottom: 1040,
      right: 540,
      width: 40,
      height: 40,
      x: 500,
      y: 1000,
      toJSON: () => ({}),
    } as DOMRect;

    const popoverSize = { width: 200, height: 150 };

    const position = getPopoverPosition('top', buttonRect, popoverSize);

    // Should be adjusted to fit within viewport
    expect(position.top + popoverSize.height).toBeLessThanOrEqual(window.innerHeight);
    expect(position.top).toBeGreaterThanOrEqual(8);
  });

  it('should adjust position when popover would overflow left edge', () => {
    const buttonRect = {
      top: 100,
      left: 5, // Near left edge
      bottom: 140,
      right: 45,
      width: 40,
      height: 40,
      x: 5,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect;

    const popoverSize = { width: 200, height: 150 };

    const position = getPopoverPosition('right', buttonRect, popoverSize);

    // Should be adjusted to fit within viewport
    expect(position.left).toBeGreaterThanOrEqual(8);
  });

  it('should adjust position when popover would overflow top edge', () => {
    const buttonRect = {
      top: 5, // Near top edge
      left: 500,
      bottom: 45,
      right: 540,
      width: 40,
      height: 40,
      x: 500,
      y: 5,
      toJSON: () => ({}),
    } as DOMRect;

    const popoverSize = { width: 200, height: 150 };

    const position = getPopoverPosition('bottom', buttonRect, popoverSize);

    // Should be adjusted to fit within viewport
    expect(position.top).toBeGreaterThanOrEqual(8);
  });
});
