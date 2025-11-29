import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import AdaptiveDockableToolbar from './AdaptiveDockableToolbar';
import { useToolbarStore } from '../stores/toolbarStore';
import { User } from '../types';

// Mock the auth context
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockProps = {
  onGenerate: vi.fn(),
  onSummarize: vi.fn(),
  isGenerating: false,
  hasSelection: false,
  onClear: vi.fn(),
  onAddNode: vi.fn(),
  onOpenLogin: vi.fn(),
  onOpenPricing: vi.fn(),
  canUndo: false,
  canRedo: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
};

describe('AdaptiveDockableToolbar - Tier Transition Flow', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToolbarStore.setState({
      position: 'top',
      isDragging: false,
      isLocked: false,
      persistenceEnabled: true,
    });
  });

  it('should enable features immediately on upgrade from free to pro', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Start with free tier
    const freeUser: User = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      planTier: 'free',
      authProvider: 'google',
    };

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: freeUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    const { rerender } = render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is locked for free tier
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });

    // Upgrade to pro
    const proUser: User = {
      ...freeUser,
      planTier: 'pro',
    };

    mockUseAuth.mockReturnValue({
      user: proUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Re-render with pro user
    rerender(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is unlocked immediately
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(false);
    });
  });

  it('should reset toolbar to top on downgrade from pro to free', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Start with pro tier and toolbar on right
    const proUser: User = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      planTier: 'pro',
      authProvider: 'google',
    };

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: proUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Set toolbar to right position
    useToolbarStore.setState({ position: 'right', isLocked: false });

    const { rerender } = render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is on right and unlocked
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('right');
      expect(store.isLocked).toBe(false);
    });

    // Downgrade to free
    const freeUser: User = {
      ...proUser,
      planTier: 'free',
    };

    mockUseAuth.mockReturnValue({
      user: freeUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Re-render with free user
    rerender(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is reset to top and locked
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('top');
      expect(store.isLocked).toBe(true);
    }, { timeout: 3000 });
  });

  it('should enable features immediately on upgrade from free to basic', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Start with free tier
    const freeUser: User = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      planTier: 'free',
      authProvider: 'google',
    };

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: freeUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    const { rerender } = render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is locked for free tier
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });

    // Upgrade to basic
    const basicUser: User = {
      ...freeUser,
      planTier: 'basic',
    };

    mockUseAuth.mockReturnValue({
      user: basicUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Re-render with basic user
    rerender(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is unlocked immediately
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(false);
    });
  });

  it('should reset toolbar to top on downgrade from basic to free', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Start with basic tier and toolbar on left
    const basicUser: User = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      planTier: 'basic',
      authProvider: 'google',
    };

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: basicUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Set toolbar to left position
    useToolbarStore.setState({ position: 'left', isLocked: false });

    const { rerender } = render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is on left and unlocked
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('left');
      expect(store.isLocked).toBe(false);
    });

    // Downgrade to free
    const freeUser: User = {
      ...basicUser,
      planTier: 'free',
    };

    mockUseAuth.mockReturnValue({
      user: freeUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Re-render with free user
    rerender(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is reset to top and locked
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('top');
      expect(store.isLocked).toBe(true);
    }, { timeout: 3000 });
  });

  it('should maintain position when upgrading from basic to pro', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Start with basic tier and toolbar on bottom
    const basicUser: User = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      planTier: 'basic',
      authProvider: 'google',
    };

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: basicUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Set toolbar to bottom position
    useToolbarStore.setState({ position: 'bottom', isLocked: false });

    const { rerender } = render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar is on bottom
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('bottom');
      expect(store.isLocked).toBe(false);
    });

    // Upgrade to pro
    const proUser: User = {
      ...basicUser,
      planTier: 'pro',
    };

    mockUseAuth.mockReturnValue({
      user: proUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    // Re-render with pro user
    rerender(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Verify toolbar position is maintained
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.position).toBe('bottom');
      expect(store.isLocked).toBe(false);
    });
  });
});
