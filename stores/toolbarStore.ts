import { create } from 'zustand';
import { loadToolbarPosition, saveToolbarPosition } from '../utils/persistence';
import { saveUserPreferences, loadUserPreferences } from '../services/preferencesService';
import { PlanTier } from '../types';

export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right';

interface ToolbarStore {
  position: ToolbarPosition;
  isDragging: boolean;
  isLocked: boolean;
  persistenceEnabled: boolean; // Track if persistence is working
  isMobile: boolean; // Track if viewport is mobile size
  savedDesktopPosition: ToolbarPosition | null; // Store desktop position when on mobile
  setPosition: (pos: ToolbarPosition, userId?: string) => Promise<void>;
  setDragging: (dragging: boolean) => void;
  setLocked: (locked: boolean) => void;
  loadPosition: (userId?: string) => Promise<void>;
  updateLockState: (planTier: PlanTier | null) => void;
  setMobile: (isMobile: boolean) => void;
}

// Load initial position from LocalStorage, fallback to 'top'
const initialPosition = loadToolbarPosition() || 'top';

export const useToolbarStore = create<ToolbarStore>((set, get) => ({
  position: initialPosition,
  isDragging: false,
  isLocked: false,
  persistenceEnabled: true,
  isMobile: false,
  savedDesktopPosition: null,
  
  setPosition: async (pos: ToolbarPosition, userId?: string) => {
    // Don't allow position changes if locked or on mobile
    if (get().isLocked || get().isMobile) {
      return;
    }
    
    set({ position: pos });
    
    // If user is authenticated, try to save to API first
    if (userId) {
      const apiResult = await saveUserPreferences(userId, pos);
      if (apiResult) {
        // API save successful
        return;
      }
      // API save failed, fall back to LocalStorage
      console.warn('API save failed, falling back to LocalStorage');
    }
    
    // Save to LocalStorage (for unauthenticated users or API fallback)
    const saved = saveToolbarPosition(pos);
    if (!saved) {
      // If save fails, disable persistence flag but keep in-memory state
      set({ persistenceEnabled: false });
    }
  },
  
  loadPosition: async (userId?: string) => {
    // If user is authenticated, try to load from API first
    if (userId) {
      const apiPreferences = await loadUserPreferences(userId);
      if (apiPreferences?.toolbarPosition) {
        set({ position: apiPreferences.toolbarPosition });
        return;
      }
      // API load failed or no preferences found, fall back to LocalStorage
      console.warn('API load failed or no preferences found, falling back to LocalStorage');
    }
    
    // Load from LocalStorage (for unauthenticated users or API fallback)
    const localPosition = loadToolbarPosition();
    if (localPosition) {
      set({ position: localPosition });
    } else {
      // No saved preference, use default
      set({ position: 'top' });
    }
  },
  
  setDragging: (dragging) => set({ isDragging: dragging }),
  setLocked: (locked) => set({ isLocked: locked }),
  
  updateLockState: (planTier: PlanTier | null) => {
    // Lock toolbar for free tier users, unlock for pro/basic users
    const shouldLock = planTier === 'free';
    set({ isLocked: shouldLock });
  },
  
  setMobile: (isMobile: boolean) => {
    const state = get();
    
    if (isMobile && !state.isMobile) {
      // Transitioning to mobile: save current position and force to bottom
      set({ 
        isMobile: true, 
        savedDesktopPosition: state.position,
        position: 'bottom' 
      });
    } else if (!isMobile && state.isMobile) {
      // Transitioning to desktop: restore saved position
      set({ 
        isMobile: false,
        position: state.savedDesktopPosition || state.position,
        savedDesktopPosition: null
      });
    }
  },
}));
