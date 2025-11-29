import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { saveToolbarPosition, loadToolbarPosition, clearToolbarPosition } from './persistence';
import { ToolbarPosition } from '../stores/toolbarStore';

describe('Persistence Layer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  /**
   * Feature: adaptive-dockable-toolbar, Property 7: Position preference persistence round-trip
   * Validates: Requirements 4.1, 4.2
   * 
   * For any toolbar position change, saving and then reloading should restore that same position
   */
  it('should persist and restore any toolbar position (round-trip)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        (position) => {
          // Save the position
          const saveResult = saveToolbarPosition(position);
          expect(saveResult).toBe(true);

          // Load the position
          const loadedPosition = loadToolbarPosition();

          // Verify round-trip: loaded position should match saved position
          expect(loadedPosition).toBe(position);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null when no position is saved', () => {
    const position = loadToolbarPosition();
    expect(position).toBeNull();
  });

  it('should return null when saved value is invalid', () => {
    // Manually set an invalid value
    localStorage.setItem('cavemind_toolbar_position', 'invalid_position');
    
    const position = loadToolbarPosition();
    expect(position).toBeNull();
  });

  it('should handle localStorage quota exceeded gracefully', () => {
    // Mock localStorage.setItem to throw QuotaExceededError
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new DOMException('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });

    const result = saveToolbarPosition('top');
    
    // Should return false when quota is exceeded
    expect(result).toBe(false);

    // Restore original setItem
    Storage.prototype.setItem = originalSetItem;
  });

  it('should handle localStorage errors gracefully on load', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('Storage access denied');
    });

    const position = loadToolbarPosition();
    
    // Should return null when load fails
    expect(position).toBeNull();

    // Restore original getItem
    Storage.prototype.getItem = originalGetItem;
  });

  it('should clear toolbar position from localStorage', () => {
    // Save a position first
    saveToolbarPosition('left');
    expect(loadToolbarPosition()).toBe('left');

    // Clear it
    clearToolbarPosition();

    // Should return null after clearing
    expect(loadToolbarPosition()).toBeNull();
  });

  it('should maintain in-memory state when persistence fails', () => {
    // This test verifies the fallback behavior described in requirements
    // When localStorage fails, the application should continue working with in-memory state
    
    // Mock localStorage to fail
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage disabled');
    });

    const result = saveToolbarPosition('right');
    
    // Save should fail
    expect(result).toBe(false);
    
    // But the application can still use in-memory state (tested in store)
    // This test confirms the persistence layer reports failure correctly

    // Restore original setItem
    Storage.prototype.setItem = originalSetItem;
  });
});
