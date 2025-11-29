import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import ToolbarContextMenu from './ToolbarContextMenu';
import { ToolbarPosition } from '../stores/toolbarStore';

describe('ToolbarContextMenu', () => {
  /**
   * Feature: adaptive-dockable-toolbar, Property 4: Context menu selection updates position
   * Validates: Requirements 2.2
   * 
   * For any position selected from the context menu, the toolbar should move to that 
   * position and update its orientation
   */
  it('should update position when any menu option is selected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        (currentPosition, selectedPosition) => {
          const mockOnSelectPosition = vi.fn();
          const mockOnClose = vi.fn();

          const { getByText, unmount } = render(
            <ToolbarContextMenu
              isOpen={true}
              position={{ x: 100, y: 100 }}
              currentPosition={currentPosition}
              onSelectPosition={mockOnSelectPosition}
              onClose={mockOnClose}
              isLocked={false}
            />
          );

          // Find and click the button for the selected position
          const positionLabels: Record<ToolbarPosition, string> = {
            top: 'Dock to Top',
            bottom: 'Dock to Bottom',
            left: 'Dock to Left',
            right: 'Dock to Right',
          };

          const button = getByText(positionLabels[selectedPosition]);
          fireEvent.click(button);

          // Verify the callback was called with the correct position
          expect(mockOnSelectPosition).toHaveBeenCalledWith(selectedPosition);
          expect(mockOnClose).toHaveBeenCalled();
          
          // Clean up to avoid DOM pollution between iterations
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should highlight the current position with a checkmark', () => {
    const positions: ToolbarPosition[] = ['top', 'bottom', 'left', 'right'];

    positions.forEach((currentPosition) => {
      const { container } = render(
        <ToolbarContextMenu
          isOpen={true}
          position={{ x: 100, y: 100 }}
          currentPosition={currentPosition}
          onSelectPosition={vi.fn()}
          onClose={vi.fn()}
          isLocked={false}
        />
      );

      // Find all buttons
      const buttons = container.querySelectorAll('button');
      
      // Check that exactly one button has the checkmark
      let checkmarkCount = 0;
      buttons.forEach((button) => {
        if (button.textContent?.includes('✓')) {
          checkmarkCount++;
          // Verify it's the current position button
          expect(button.className).toContain('FF3333'); // Red color for current
        }
      });

      expect(checkmarkCount).toBe(1);
    });
  });

  it('should not allow position changes when locked', () => {
    const mockOnSelectPosition = vi.fn();
    const mockOnClose = vi.fn();

    const { getByText } = render(
      <ToolbarContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        currentPosition="top"
        onSelectPosition={mockOnSelectPosition}
        onClose={mockOnClose}
        isLocked={true}
      />
    );

    // Try to click a different position
    const button = getByText('Dock to Bottom');
    fireEvent.click(button);

    // Verify the callback was NOT called
    expect(mockOnSelectPosition).not.toHaveBeenCalled();
  });

  it('should close when clicking outside', () => {
    const mockOnClose = vi.fn();

    render(
      <ToolbarContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        currentPosition="top"
        onSelectPosition={vi.fn()}
        onClose={mockOnClose}
        isLocked={false}
      />
    );

    // Click outside the menu
    fireEvent.mouseDown(document.body);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when pressing Escape', () => {
    const mockOnClose = vi.fn();

    render(
      <ToolbarContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        currentPosition="top"
        onSelectPosition={vi.fn()}
        onClose={mockOnClose}
        isLocked={false}
      />
    );

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ToolbarContextMenu
        isOpen={false}
        position={{ x: 100, y: 100 }}
        currentPosition="top"
        onSelectPosition={vi.fn()}
        onClose={vi.fn()}
        isLocked={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
