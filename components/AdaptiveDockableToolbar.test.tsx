import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import AdaptiveDockableToolbar from './AdaptiveDockableToolbar';
import { AuthProvider } from '../contexts/AuthContext';
import { useToolbarStore } from '../stores/toolbarStore';

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

describe('AdaptiveDockableToolbar - Tier-based Feature Gating', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToolbarStore.setState({
      position: 'top',
      isDragging: false,
      isLocked: false,
      persistenceEnabled: true,
    });
  });

  it('should lock toolbar for free tier users', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'free',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });
  });

  it('should unlock toolbar for pro tier users', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'pro',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(false);
    });
  });

  it('should unlock toolbar for basic tier users', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'basic',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(false);
    });
  });

  it('should show upgrade prompt when free user tries to drag toolbar', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'free',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for component to render and lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });

    // Find the drag handle and try to drag it
    const dragHandle = screen.getByLabelText('Toolbar drag handle (Upgrade to Pro to move toolbar)');
    
    // Simulate drag start
    fireEvent.dragStart(dragHandle);

    // Upgrade prompt should appear
    await waitFor(() => {
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
      expect(screen.getByText(/Toolbar customization is a Pro feature/)).toBeInTheDocument();
    });
  });

  it('should show upgrade prompt when free user right-clicks toolbar', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'free',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });

    // Find the drag handle and right-click it
    const dragHandle = screen.getByLabelText('Toolbar drag handle (Upgrade to Pro to move toolbar)');
    fireEvent.contextMenu(dragHandle);

    // Upgrade prompt should appear instead of context menu
    await waitFor(() => {
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });
  });

  it('should call onOpenPricing when upgrade button is clicked', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        planTier: 'free',
        authProvider: 'google',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      upgradePlan: vi.fn(),
    });

    render(
      <ReactFlowProvider>
        <AdaptiveDockableToolbar {...mockProps} />
      </ReactFlowProvider>
    );

    // Wait for lock state to update
    await waitFor(() => {
      const store = useToolbarStore.getState();
      expect(store.isLocked).toBe(true);
    });

    // Trigger upgrade prompt
    const dragHandle = screen.getByLabelText('Toolbar drag handle (Upgrade to Pro to move toolbar)');
    fireEvent.dragStart(dragHandle);

    // Wait for prompt to appear
    await waitFor(() => {
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });

    // Click upgrade button
    const upgradeButton = screen.getByText('Upgrade Now');
    fireEvent.click(upgradeButton);

    // Should call onOpenPricing
    expect(mockProps.onOpenPricing).toHaveBeenCalled();
  });
});
