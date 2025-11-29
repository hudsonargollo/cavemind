import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { saveUserPreferences, loadUserPreferences } from './preferencesService';
import { ToolbarPosition } from '../stores/toolbarStore';

// Mock fetch globally
global.fetch = vi.fn();

describe('Preferences Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Feature: adaptive-dockable-toolbar, Property 7: Position preference persistence round-trip
   * Validates: Requirements 4.1, 4.2
   * 
   * For any toolbar position change, saving to API and then loading should restore that same position
   */
  it('should persist and restore any toolbar position via API (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.constantFrom<ToolbarPosition>('top', 'bottom', 'left', 'right'),
        async (userId, position) => {
          // Mock successful save
          (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              userId,
              toolbarPosition: position,
              updatedAt: new Date(),
            }),
          });

          // Save the position
          const saveResult = await saveUserPreferences(userId, position);
          expect(saveResult).not.toBeNull();
          expect(saveResult?.toolbarPosition).toBe(position);

          // Mock successful load
          (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              userId,
              toolbarPosition: position,
              updatedAt: new Date(),
            }),
          });

          // Load the position
          const loadResult = await loadUserPreferences(userId);

          // Verify round-trip: loaded position should match saved position
          expect(loadResult).not.toBeNull();
          expect(loadResult?.toolbarPosition).toBe(position);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null when API returns 404', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await loadUserPreferences('user123');
    expect(result).toBeNull();
  });

  it('should retry on failure with exponential backoff', async () => {
    // Mock fetch to fail twice, then succeed
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: 'user123',
          toolbarPosition: 'left',
          updatedAt: new Date(),
        }),
      });

    const result = await saveUserPreferences('user123', 'left');

    // Should succeed after retries
    expect(result).not.toBeNull();
    expect(result?.toolbarPosition).toBe('left');

    // Should have been called 3 times (initial + 2 retries)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should return null after all retries exhausted', async () => {
    // Mock fetch to always fail
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const result = await saveUserPreferences('user123', 'top');

    // Should return null after all retries
    expect(result).toBeNull();

    // Should have been called 3 times (max retries)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should handle HTTP errors with retry', async () => {
    // Mock fetch to return 500 error twice, then succeed
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: 'user123',
          toolbarPosition: 'bottom',
          updatedAt: new Date(),
        }),
      });

    const result = await loadUserPreferences('user123');

    // Should succeed after retries
    expect(result).not.toBeNull();
    expect(result?.toolbarPosition).toBe('bottom');

    // Should have been called 3 times
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should send correct request format for save', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        userId: 'user123',
        toolbarPosition: 'right',
        updatedAt: new Date(),
      }),
    });

    await saveUserPreferences('user123', 'right');

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/preferences',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('user123'),
      })
    );
  });

  it('should send correct request format for load', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        userId: 'user123',
        toolbarPosition: 'top',
        updatedAt: new Date(),
      }),
    });

    await loadUserPreferences('user123');

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/preferences?userId=user123',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });
});
