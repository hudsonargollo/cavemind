import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToolbarStore } from '../stores/toolbarStore';
import ToolbarContainer from './ToolbarContainer';
import ToolbarHandle from './ToolbarHandle';
import ToolbarContextMenu from './ToolbarContextMenu';
import UpgradePrompt from './UpgradePrompt';
import ColorPicker from './ColorPicker';

interface AdaptiveDockableToolbarProps {
  onGenerate: (prompt: string) => Promise<void>;
  onSummarize: () => Promise<void>;
  isGenerating: boolean;
  hasSelection: boolean;
  onClear: () => void;
  onAddNode: (type: 'caveNode' | 'caveText' | 'caveImage' | 'caveSticker' | 'cavePostIt') => void;
  onOpenLogin: () => void;
  onOpenPricing: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onColorChange?: (color: string, property: 'background' | 'stroke' | 'text') => void;
  selectedNodeColor?: string;
  selectedNodeType?: string;
  isArrowDrawingMode?: boolean;
  onToggleArrowMode?: () => void;
  selectedArrowId?: string;
  onArrowUpdate?: (id: string, updates: Partial<import('../types').ArrowConnectorData>) => void;
  onOpenSketchUpload?: () => void;
  isDocumentLocked?: boolean;
  onToggleLock?: () => void;
}

const AdaptiveDockableToolbar: React.FC<AdaptiveDockableToolbarProps> = ({
  onGenerate,
  onSummarize,
  isGenerating,
  hasSelection,
  onClear,
  onAddNode,
  onOpenLogin,
  onOpenPricing,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onColorChange,
  selectedNodeColor = '#333333',
  selectedNodeType,
  isArrowDrawingMode = false,
  onToggleArrowMode,
  selectedArrowId,
  onArrowUpdate,
  onOpenSketchUpload,
  isDocumentLocked = false,
  onToggleLock,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { position, isLocked, isMobile, setPosition, loadPosition, updateLockState, setMobile } = useToolbarStore();
  
  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [colorPickerProperty, setColorPickerProperty] = useState<'background' | 'stroke' | 'text'>('background');
  
  // Arrow customization state
  const [showArrowCustomization, setShowArrowCustomization] = useState(false);
  const [arrowCustomizationPosition, setArrowCustomizationPosition] = useState({ x: 0, y: 0 });

  // Track previous tier to detect upgrades/downgrades
  const [previousTier, setPreviousTier] = useState<string | null>(null);

  // Keyboard navigation state
  const [focusedToolIndex, setFocusedToolIndex] = useState<number>(-1);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const toolButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Accessibility announcement state
  const [announcement, setAnnouncement] = React.useState<string>('');

  // Handle tier changes (upgrade/downgrade)
  useEffect(() => {
    const currentTier = user?.planTier || null;
    
    // If this is not the first render and tier has changed
    if (previousTier !== null && previousTier !== currentTier) {
      // Downgrade to free: reset toolbar to top
      if (currentTier === 'free') {
        setPosition('top', user?.id);
      }
      // Upgrade from free: features are automatically enabled via lock state
      // No need to do anything special, just update lock state below
    }
    
    // Update lock state for current tier
    updateLockState(currentTier);
    
    // Update previous tier for next comparison
    setPreviousTier(currentTier);
  }, [user?.planTier, user?.id, previousTier, updateLockState, setPosition]);

  // Load saved position on mount
  useEffect(() => {
    loadPosition(user?.id);
  }, [user?.id, loadPosition]);

  // Announce position changes for screen readers
  useEffect(() => {
    const positionLabels = {
      top: 'top',
      bottom: 'bottom',
      left: 'left',
      right: 'right',
    };
    setAnnouncement(`Toolbar moved to ${positionLabels[position]} edge`);
    
    // Clear announcement after a short delay
    const timer = setTimeout(() => setAnnouncement(''), 1000);
    return () => clearTimeout(timer);
  }, [position]);

  // Handle viewport width detection for mobile responsiveness
  useEffect(() => {
    const MOBILE_BREAKPOINT = 768;
    
    // Check initial viewport width
    const checkMobile = () => {
      const isMobileView = window.innerWidth < MOBILE_BREAKPOINT;
      setMobile(isMobileView);
    };
    
    // Check on mount
    checkMobile();
    
    // Create media query listener
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Handler for media query changes
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setMobile(e.matches);
    };
    
    // Add listener (use addEventListener for modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }
    
    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, [setMobile]);

  const isProFeature = (feature: string) => {
    if (!isAuthenticated) return false;
    if (user?.planTier === 'free') return false;
    return true;
  };

  const handleSparkClick = () => {
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }
    if (!isProFeature('ai')) {
      onOpenPricing();
      return;
    }
    setExpanded(!expanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onGenerate(prompt);
    setPrompt('');
    setExpanded(false);
  };

  const handleAddClick = (type: 'caveNode' | 'caveText' | 'caveImage' | 'caveSticker' | 'cavePostIt') => {
    onAddNode(type);
    setShowAddMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Disable context menu on mobile
    if (isMobile) {
      return;
    }
    
    // If locked, show upgrade prompt instead of context menu
    if (isLocked) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handlePositionSelect = async (pos: typeof position) => {
    await setPosition(pos, user?.id);
  };

  const handleDragAttempt = () => {
    // This will be called when a locked user tries to drag
    if (isLocked) {
      setShowUpgradePrompt(true);
    }
  };

  // Keyboard navigation handler
  const handleToolbarKeyDown = (e: React.KeyboardEvent) => {
    const isHorizontal = position === 'top' || position === 'bottom';
    const forwardKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const backwardKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    // Get all focusable tool buttons
    const toolButtons = toolButtonRefs.current.filter(btn => btn !== null && !btn.disabled);

    if (e.key === forwardKey) {
      e.preventDefault();
      const nextIndex = (focusedToolIndex + 1) % toolButtons.length;
      setFocusedToolIndex(nextIndex);
      toolButtons[nextIndex]?.focus();
    } else if (e.key === backwardKey) {
      e.preventDefault();
      const prevIndex = focusedToolIndex <= 0 ? toolButtons.length - 1 : focusedToolIndex - 1;
      setFocusedToolIndex(prevIndex);
      toolButtons[prevIndex]?.focus();
    } else if (e.key === 'F10' && e.shiftKey) {
      e.preventDefault();
      // Open context menu at toolbar position
      if (!isMobile && !isLocked && toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        setContextMenuPosition({ x: rect.left, y: rect.bottom + 8 });
        setShowContextMenu(true);
      }
    }
  };

  const isHorizontal = position === 'top' || position === 'bottom';

  return (
    <>
      <ToolbarContainer position={position} onKeyDown={handleToolbarKeyDown} toolbarRef={toolbarRef}>
        {/* Drag Handle */}
        <div onContextMenu={handleContextMenu}>
          <ToolbarHandle 
            position={position} 
            isLocked={isLocked}
            isMobile={isMobile}
            onLockedDragAttempt={handleDragAttempt}
          />
        </div>

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`}></div>

        {/* User Profile / Auth Button */}
        <div className="relative">
          {isAuthenticated && user ? (
            <button
              ref={(el) => (toolButtonRefs.current[0] = el)}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border border-[#333] hover:border-[#E5E5E5] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
              aria-label={`User menu for ${user.name} (${user.planTier} plan)`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ) : (
            <button
              ref={(el) => (toolButtonRefs.current[0] = el)}
              onClick={onOpenLogin}
              className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-gray-400 hover:text-white hover:bg-[#444] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
              aria-label="Login to your account"
            >
              Login
            </button>
          )}

          {/* User Menu Dropdown */}
          {showUserMenu && isAuthenticated && user && (
            <div 
              className={`
                absolute ${position === 'bottom' ? 'bottom-full mb-3' : 'top-full mt-3'}
                ${position === 'right' ? 'right-0' : 'left-0'}
                w-48 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl overflow-hidden 
                animate-in fade-in zoom-in-95 duration-200 origin-${position === 'bottom' ? 'bottom' : 'top'}-${position === 'right' ? 'right' : 'left'}
              `}
              role="menu"
              aria-label="User account menu"
            >
              <div className="px-4 py-3 border-b border-[#333]" role="presentation">
                <div className="text-sm text-white font-medium truncate">{user.name}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                  {user.planTier} Plan
                </div>
              </div>
              {user.planTier === 'free' && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenPricing();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#FF3333] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-inset focus:ring-[#FF3333] font-bold transition-all duration-150"
                  role="menuitem"
                  aria-label="Upgrade to Pro plan"
                >
                  <span aria-hidden="true">⚡</span> Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-[#333] hover:text-white hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-inset focus:ring-[#FF3333] transition-all duration-150"
                role="menuitem"
                aria-label="Log out of your account"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Undo / Redo */}
        <button
          ref={(el) => (toolButtonRefs.current[1] = el)}
          onClick={onUndo}
          disabled={!canUndo}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent text-[#E5E5E5] transition-all duration-200"
          aria-label="Undo last action"
          aria-keyshortcuts="Control+Z"
        >
          ↩
        </button>
        <button
          ref={(el) => (toolButtonRefs.current[2] = el)}
          onClick={onRedo}
          disabled={!canRedo}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent text-[#E5E5E5] transition-all duration-200"
          aria-label="Redo last undone action"
          aria-keyshortcuts="Control+Y"
        >
          ↪
        </button>

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Spark Button (AI Generation) */}
        <button
          ref={(el) => (toolButtonRefs.current[3] = el)}
          onClick={handleSparkClick}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]
            ${expanded ? 'bg-[#FF3333] rotate-45 scale-110' : 'bg-[#FF3333] hover:bg-[#D92B2B] hover:scale-105'}
            text-white font-bold shadow-lg
          `}
          aria-label={isAuthenticated && user?.planTier !== 'free' ? 'Spark AI - Generate diagram from prompt' : 'Spark AI (Upgrade to Pro required)'}
          aria-expanded={expanded}
        >
          {expanded ? '+' : '✦'}
        </button>

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Manual Add Node Group */}
        <div className="relative">
          {showAddMenu && (
            <div 
              className={`
                absolute ${position === 'bottom' ? 'bottom-full mb-3' : 'top-full mt-3'}
                ${position === 'left' ? 'left-full ml-3' : position === 'right' ? 'right-full mr-3' : 'left-1/2 -translate-x-1/2'}
                bg-[#1A1A1A] border border-[#333] rounded-lg p-1 flex flex-col gap-1 shadow-xl 
                animate-in slide-in-from-${position === 'bottom' ? 'bottom' : position === 'top' ? 'top' : position}-2 fade-in duration-200
              `}
              role="menu"
              aria-label="Add element menu"
            >
              <button
                onClick={() => handleAddClick('caveNode')}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-[#FF3333] rounded w-full whitespace-nowrap transition-all duration-150"
                role="menuitem"
                aria-label="Add process node"
              >
                <div className="w-3 h-3 border border-[#E5E5E5] rounded-sm" aria-hidden="true"></div> Process
              </button>
              <button
                onClick={() => handleAddClick('caveText')}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-[#FF3333] rounded w-full whitespace-nowrap transition-all duration-150"
                role="menuitem"
                aria-label="Add text note"
              >
                <span className="font-jersey text-[10px]" aria-hidden="true">TXT</span> Note
              </button>
              <button
                onClick={() => handleAddClick('caveImage')}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-[#FF3333] rounded w-full whitespace-nowrap transition-all duration-150"
                role="menuitem"
                aria-label="Add image"
              >
                <span className="text-[10px]" aria-hidden="true">📷</span> Image
              </button>
              <button
                onClick={() => handleAddClick('caveSticker')}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-[#FF3333] rounded w-full whitespace-nowrap transition-all duration-150"
                role="menuitem"
                aria-label="Add sticker"
              >
                <span className="text-[10px]" aria-hidden="true">✨</span> Sticker
              </button>
              <button
                onClick={() => handleAddClick('cavePostIt')}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E5E5E5] hover:bg-[#333] hover:scale-105 focus:outline-none focus:bg-[#444] focus:ring-2 focus:ring-[#FF3333] rounded w-full whitespace-nowrap transition-all duration-150"
                role="menuitem"
                aria-label="Add post-it note"
              >
                <span className="text-[10px]" aria-hidden="true">📝</span> Post-it
              </button>
            </div>
          )}
          <button
            ref={(el) => (toolButtonRefs.current[4] = el)}
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] text-[#E5E5E5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] border ${
              showAddMenu ? 'border-[#FF3333] scale-110' : 'border-transparent'
            }`}
            aria-label="Add element"
            aria-expanded={showAddMenu}
            aria-haspopup="menu"
          >
            <span className="text-lg leading-none pb-1" aria-hidden="true">+</span>
          </button>
        </div>

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Sketch Upload Button */}
        {onOpenSketchUpload && (
          <button
            ref={(el) => (toolButtonRefs.current[5] = el)}
            onClick={onOpenSketchUpload}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] text-[#E5E5E5] transition-all duration-200"
            aria-label="Upload sketch to convert to diagram"
          >
            <span aria-hidden="true">📷</span>
          </button>
        )}

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Arrow Drawing Mode Button */}
        {onToggleArrowMode && (
          <button
            ref={(el) => (toolButtonRefs.current[6] = el)}
            onClick={onToggleArrowMode}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] ${
              isArrowDrawingMode 
                ? 'bg-[#FF3333] text-white scale-110 shadow-lg' 
                : 'hover:bg-[#333] hover:scale-105 text-[#E5E5E5]'
            }`}
            aria-label={isArrowDrawingMode ? 'Exit arrow drawing mode' : 'Enter arrow drawing mode'}
            aria-pressed={isArrowDrawingMode}
          >
            <span aria-hidden="true">→</span>
          </button>
        )}

        {/* Arrow Customization Button (shown when arrow is selected) */}
        {selectedArrowId && onArrowUpdate && (
          <button
            ref={(el) => (toolButtonRefs.current[7] = el)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              let x = rect.left;
              let y = rect.bottom + 8;
              
              // Adjust position based on toolbar location
              if (position === 'bottom') {
                y = rect.top - 8;
              } else if (position === 'left') {
                x = rect.right + 8;
                y = rect.top;
              } else if (position === 'right') {
                x = rect.left - 8;
                y = rect.top;
              }
              
              setArrowCustomizationPosition({ x, y });
              setShowArrowCustomization(!showArrowCustomization);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200 ${
              showArrowCustomization ? 'bg-[#333] scale-110' : ''
            }`}
            aria-label="Customize selected arrow"
            aria-expanded={showArrowCustomization}
            aria-haspopup="true"
          >
            <span aria-hidden="true">⚙</span>
          </button>
        )}

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {/* Color Picker Button */}
        {hasSelection && (
          <button
            ref={(el) => (toolButtonRefs.current[8] = el)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              let x = rect.left;
              let y = rect.bottom + 8;
              
              // Adjust position based on toolbar location
              if (position === 'bottom') {
                y = rect.top - 8;
              } else if (position === 'left') {
                x = rect.right + 8;
                y = rect.top;
              } else if (position === 'right') {
                x = rect.left - 8;
                y = rect.top;
              }
              
              setColorPickerPosition({ x, y });
              setColorPickerProperty('background');
              setShowColorPicker(!showColorPicker);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200 relative ${
              showColorPicker ? 'bg-[#333] scale-110' : ''
            }`}
            aria-label={`Change color of selected elements (current: ${selectedNodeColor})`}
            aria-expanded={showColorPicker}
            aria-haspopup="true"
          >
            <div 
              className="w-5 h-5 rounded border-2 border-[#555] hover:border-[#E5E5E5] transition-all duration-200" 
              style={{ backgroundColor: selectedNodeColor }}
              aria-hidden="true"
            />
          </button>
        )}

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        {onToggleLock && (
          <button
            ref={(el) => (toolButtonRefs.current[9] = el)}
            onClick={onToggleLock}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200 ${
              isDocumentLocked ? 'text-[#FF3333]' : 'text-[#E5E5E5]'
            }`}
            aria-label={isDocumentLocked ? 'Unlock document' : 'Lock document'}
            title={isDocumentLocked ? 'Unlock document' : 'Lock document with password'}
          >
            {isDocumentLocked ? '🔒' : '🔓'}
          </button>
        )}

        <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>

        <button
          ref={(el) => (toolButtonRefs.current[10] = el)}
          onClick={onClear}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] rounded transition-all duration-200"
          aria-label="Clear canvas"
        >
          Clear
        </button>

        {hasSelection && (
          <>
            <div className={`w-[1px] ${isHorizontal ? 'h-6' : 'w-6 h-[1px]'} bg-[#333]`} aria-hidden="true"></div>
            <button
              ref={(el) => (toolButtonRefs.current[11] = el)}
              onClick={onSummarize}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#333] hover:bg-[#444] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] text-[#E5E5E5] text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Summarize selected path using AI"
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                <span>Summarize Path</span>
              )}
            </button>
          </>
        )}
      </ToolbarContainer>

      {/* Prompt Input Modal - positioned based on toolbar location */}
      {expanded && (
        <div
          className={`
            fixed z-40 w-full max-w-lg px-4 pointer-events-auto
            bg-[#0A0A0A] border border-[#333] p-4 rounded-xl shadow-2xl
            animate-in slide-in-from-${position === 'bottom' ? 'bottom' : 'top'}-4 fade-in duration-200
            ${position === 'top' ? 'top-24 left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'bottom-24 left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'left-24 top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'right-24 top-1/2 -translate-y-1/2' : ''}
          `}
          role="dialog"
          aria-label="AI diagram generation prompt"
          aria-modal="false"
        >
          <h3 className="text-[#FF3333] font-jersey text-xl mb-2" id="prompt-dialog-title">CAVE_BRAIN_V1</h3>
          <form onSubmit={handleSubmit} className="flex gap-2" aria-labelledby="prompt-dialog-title">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a workflow, strategy, or system..."
              className="flex-1 bg-[#1A1A1A] border border-[#333] text-[#E5E5E5] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF3333] focus:ring-2 focus:ring-[#FF3333]/50 placeholder-gray-600 font-jersey text-sm transition-all duration-200"
              aria-label="AI generation prompt"
              autoFocus
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#E5E5E5] text-black hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
              aria-label="Execute AI generation"
            >
              {isGenerating ? '...' : 'EXECUTE'}
            </button>
          </form>
          <div className="mt-2 text-[10px] text-gray-600 font-jersey" aria-hidden="true">
            MODEL: GEMINI-2.0-FLASH // LATENCY: LOW
          </div>
        </div>
      )}

      {/* Context Menu */}
      <ToolbarContextMenu
        isOpen={showContextMenu}
        position={contextMenuPosition}
        currentPosition={position}
        onSelectPosition={handlePositionSelect}
        onClose={() => setShowContextMenu(false)}
        isLocked={isLocked}
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          onOpenPricing();
        }}
        feature="Toolbar customization"
      />

      {/* Color Picker */}
      {showColorPicker && onColorChange && (
        <ColorPicker
          currentColor={selectedNodeColor}
          onColorChange={(color) => onColorChange(color, colorPickerProperty)}
          position={colorPickerPosition}
          targetProperty={colorPickerProperty}
          onClose={() => setShowColorPicker(false)}
          isPostIt={selectedNodeType === 'cavePostIt'}
        />
      )}

      {/* Arrow Customization Menu */}
      {showArrowCustomization && selectedArrowId && onArrowUpdate && (
        <div
          className="fixed bg-[#1A1A1A] border border-[#333] rounded-lg p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{ left: arrowCustomizationPosition.x, top: arrowCustomizationPosition.y }}
          role="dialog"
          aria-label="Arrow customization options"
        >
          <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider" id="arrow-style-heading">Arrow Style</div>
          
          {/* Line Style */}
          <div className="mb-3" role="group" aria-labelledby="line-style-label">
            <div className="text-[10px] text-gray-500 mb-1" id="line-style-label">Line Style</div>
            <div className="flex gap-1">
              {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onArrowUpdate(selectedArrowId, { style })}
                  className="px-2 py-1 text-[10px] bg-[#333] hover:bg-[#444] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] rounded capitalize transition-all duration-150"
                  aria-label={`Set line style to ${style}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow Head Style */}
          <div className="mb-3" role="group" aria-labelledby="arrow-head-label">
            <div className="text-[10px] text-gray-500 mb-1" id="arrow-head-label">Arrow Head</div>
            <div className="flex gap-1">
              {(['triangle', 'circle', 'diamond', 'none'] as const).map((headStyle) => (
                <button
                  key={headStyle}
                  onClick={() => onArrowUpdate(selectedArrowId, { headStyle })}
                  className="px-2 py-1 text-[10px] bg-[#333] hover:bg-[#444] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] rounded capitalize transition-all duration-150"
                  aria-label={`Set arrow head to ${headStyle}`}
                >
                  {headStyle}
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="mb-3" role="group" aria-labelledby="stroke-width-label">
            <div className="text-[10px] text-gray-500 mb-1" id="stroke-width-label">Stroke Width</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((width) => (
                <button
                  key={width}
                  onClick={() => onArrowUpdate(selectedArrowId, { strokeWidth: width })}
                  className="px-2 py-1 text-[10px] bg-[#333] hover:bg-[#444] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] rounded transition-all duration-150"
                  aria-label={`Set stroke width to ${width} pixels`}
                >
                  {width}px
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker for Arrow */}
          <div role="group" aria-labelledby="arrow-color-label">
            <div className="text-[10px] text-gray-500 mb-1" id="arrow-color-label">Color</div>
            <div className="flex gap-1 flex-wrap">
              {['#E5E5E5', '#FF3333', '#FF7A33', '#FFD700', '#00FF00', '#00BFFF', '#FF69B4', '#9370DB'].map((color) => (
                <button
                  key={color}
                  onClick={() => onArrowUpdate(selectedArrowId, { color })}
                  className="w-6 h-6 rounded border-2 border-[#555] hover:border-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3333] transition-all duration-150"
                  style={{ backgroundColor: color }}
                  aria-label={`Set arrow color to ${color}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowArrowCustomization(false)}
            className="mt-3 w-full text-[10px] text-gray-500 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF3333] rounded py-1 transition-all duration-150"
          >
            Close
          </button>
        </div>
      )}

      {/* Accessibility: Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  );
};

export default AdaptiveDockableToolbar;
