import { ToolbarPosition } from '../stores/toolbarStore';

const TOOLBAR_POSITION_KEY = 'cavemind_toolbar_position';

/**
 * Save toolbar position to LocalStorage
 * @param position - The toolbar position to save
 * @returns true if save was successful, false otherwise
 */
export const saveToolbarPosition = (position: ToolbarPosition): boolean => {
  try {
    localStorage.setItem(TOOLBAR_POSITION_KEY, position);
    return true;
  } catch (error) {
    // Handle quota exceeded or other storage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Toolbar position will not persist.');
    } else {
      console.error('Failed to save toolbar position to LocalStorage:', error);
    }
    return false;
  }
};

/**
 * Load toolbar position from LocalStorage
 * @returns The saved toolbar position, or null if not found or invalid
 */
export const loadToolbarPosition = (): ToolbarPosition | null => {
  try {
    const saved = localStorage.getItem(TOOLBAR_POSITION_KEY);
    if (saved && isValidToolbarPosition(saved)) {
      return saved as ToolbarPosition;
    }
    return null;
  } catch (error) {
    console.error('Failed to load toolbar position from LocalStorage:', error);
    return null;
  }
};

/**
 * Validate that a string is a valid toolbar position
 */
const isValidToolbarPosition = (value: string): boolean => {
  return ['top', 'bottom', 'left', 'right'].includes(value);
};

/**
 * Clear toolbar position from LocalStorage
 */
export const clearToolbarPosition = (): void => {
  try {
    localStorage.removeItem(TOOLBAR_POSITION_KEY);
  } catch (error) {
    console.error('Failed to clear toolbar position from LocalStorage:', error);
  }
};
