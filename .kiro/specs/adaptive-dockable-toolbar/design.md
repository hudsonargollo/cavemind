# Design Document

## Overview

The Adaptive Dockable Toolbar transforms the fixed control panel into a flexible, user-customizable interface component. This design enables users to position the toolbar on any screen edge (top, bottom, left, right), with intelligent layout adaptation and popover positioning. The feature integrates the existing React/TypeScript architecture, leveraging Zustand for state management and Tailwind CSS for responsive styling.

The design also includes an AI-powered sketch-to-diagram feature that converts uploaded hand-drawn images into editable canvas elements using Google's Gemini Vision API.

## Architecture

### Component Hierarchy

```
App (ReactFlowProvider + AuthProvider)
└── Flow
    ├── ReactFlow (Canvas)
    ├── AdaptiveDockableToolbar (NEW - replaces CaveControlPanel)
    │   ├── ToolbarContainer (handles positioning & orientation)
    │   ├── ToolbarHandle (drag interaction)
    │   ├── ToolButton[] (individual tools)
    │   └── ToolPopover[] (context-aware popovers)
    ├── SketchUploadModal (NEW)
    └── [existing components...]
```

### State Management

**Toolbar Position State (Zustand Store)**
```typescript
interface ToolbarStore {
  position: 'top' | 'bottom' | 'left' | 'right';
  isDragging: boolean;
  isLocked: boolean; // for free-tier users
  setPosition: (pos: 'top' | 'bottom' | 'left' | 'right') => void;
  setDragging: (dragging: boolean) => void;
}
```

**Persistence Layer**
- LocalStorage for unauthenticated users
- Backend API (`/api/user/preferences`) for authenticated users
- Fallback chain: API → LocalStorage → Default ('top')

## Components and Interfaces

### 1. AdaptiveDockableToolbar Component

**Props Interface**
```typescript
interface AdaptiveDockableToolbarProps {
  onGenerate: (prompt: string) => Promise<void>;
  onSummarize: () => Promise<void>;
  onClear: () => void;
  onAddNode: (type: NodeType) => void;
  onUploadSketch: (file: File) => Promise<void>; // NEW
  isGenerating: boolean;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}
```

**Responsibilities**
- Render toolbar with dynamic orientation based on `position` state
- Handle drag-and-drop repositioning
- Manage context menu for position selection
- Coordinate popover positioning
- Enforce tier-based feature gating

### 2. ToolbarContainer Component

**Styling Logic**
```typescript
const getContainerClasses = (position: ToolbarPosition) => {
  const base = 'fixed z-40 bg-[#1A1A1A]/90 backdrop-blur-md border border-[#333] shadow-2xl';
  const positioning = {
    top: 'top-8 left-1/2 -translate-x-1/2 rounded-b-2xl',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2 rounded-t-2xl',
    left: 'left-8 top-1/2 -translate-y-1/2 rounded-r-2xl',
    right: 'right-8 top-1/2 -translate-y-1/2 rounded-l-2xl',
  };
  const orientation = {
    top: 'flex-row',
    bottom: 'flex-row',
    left: 'flex-col',
    right: 'flex-col',
  };
  return `${base} ${positioning[position]} flex ${orientation[position]} gap-2 p-2 transition-all duration-300`;
};
```

### 3. ToolbarHandle Component

**Drag Interaction**
- Visual indicator (⋮⋮ for horizontal, ⋮ for vertical)
- Drag threshold: 5px to prevent accidental moves
- Drop zone detection: 50px from screen edges
- Visual feedback: semi-transparent overlay at target edge

**Implementation Pattern**
```typescript
const handleDragEnd = (e: DragEvent) => {
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  
  // Edge detection with 50px threshold
  if (clientY < 50) setPosition('top');
  else if (clientY > innerHeight - 50) setPosition('bottom');
  else if (clientX < 50) setPosition('left');
  else if (clientX > innerWidth - 50) setPosition('right');
};
```

### 4. ToolPopover Component

**Dynamic Positioning Algorithm**
```typescript
const getPopoverPosition = (
  toolbarPosition: ToolbarPosition,
  buttonRect: DOMRect,
  popoverSize: { width: number; height: number }
): { top: number; left: number } => {
  const offset = 12; // gap between button and popover
  
  switch (toolbarPosition) {
    case 'top':
      return { top: buttonRect.bottom + offset, left: buttonRect.left };
    case 'bottom':
      return { top: buttonRect.top - popoverSize.height - offset, left: buttonRect.left };
    case 'left':
      return { top: buttonRect.top, left: buttonRect.right + offset };
    case 'right':
      return { top: buttonRect.top, left: buttonRect.left - popoverSize.width - offset };
  }
};
```

**Viewport Boundary Handling**
- Calculate popover dimensions before rendering
- Adjust position if it would overflow viewport
- Priority: stay on-screen > maintain offset

### 5. SketchUploadModal Component

**Props Interface**
```typescript
interface SketchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}
```

**Responsibilities**
- File input with drag-and-drop support
- Image preview before upload
- Progress indicator during AI processing
- Error handling and retry mechanism

### 6. ResizableTextNode Component

**Enhanced Node Data**
```typescript
interface ResizableTextNodeData extends CaveTextData {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}
```

**Resize Handle System**
- 8 resize handles: 4 corners (proportional) + 4 edges (independent)
- Corner handles: maintain aspect ratio during resize
- Edge handles: resize single dimension only
- Visual feedback: handles appear on node selection

**Implementation Pattern**
```typescript
const handleResize = (
  handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
  delta: { x: number; y: number },
  maintainAspectRatio: boolean
) => {
  // Corner handles maintain aspect ratio
  // Edge handles resize independently
  // Enforce minimum dimensions
};
```

### 7. InlineEditableNode Component

**Edit Mode State**
```typescript
interface EditState {
  isEditing: boolean;
  originalText: string;
  cursorPosition: number;
}
```

**Interaction Patterns**
- Double-click to enter edit mode
- Enter key to save and exit
- Escape key to cancel and revert
- Click outside to save and exit
- Tab key to move to next editable node

### 8. ColorPicker Component

**Props Interface**
```typescript
interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  position: { x: number; y: number };
  targetType: 'background' | 'stroke' | 'text';
}
```

**Color Palette**
- Preset colors: 16 common colors in a 4x4 grid
- Custom color input: HSL/RGB/HEX selector
- Recent colors: Last 8 used colors
- Transparency slider for background colors

**Responsibilities**
- Display color palette with visual swatches
- Handle custom color selection
- Apply color to single or multiple selected elements
- Persist color preferences per element type

### 9. Arrow Connector Component

**Arrow Data Model**
```typescript
interface ArrowData {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  style: 'solid' | 'dashed' | 'dotted';
  headStyle: 'triangle' | 'circle' | 'diamond' | 'none';
  color: string;
  strokeWidth: number;
}
```

**Drawing Modes**
- Freeform: Click and drag to create arrow
- Node-to-node: Snap to node connection points
- Multi-segment: Click multiple points for bent arrows

### 10. PostItNode Component

**PostIt Styling**
```typescript
interface PostItNodeData {
  text: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  rotation: number; // slight random rotation for realism
  hasShadow: boolean;
}
```

**Visual Characteristics**
- Default yellow color with gradient
- Subtle drop shadow for depth
- Slight rotation (±2 degrees) for organic feel
- Handwriting-style font option

### 6. StickerPickerPopover Component

**Props Interface**
```typescript
interface StickerPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (stickerId: string, thumbnailUrl: string) => void;
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
}
```

**Responsibilities**
- Fetch sticker collection from database
- Display thumbnail grid with lazy loading
- Handle sticker selection and placement
- Show loading states and error messages
- Position popover based on toolbar location

## Data Models

### User Preferences Schema

```typescript
interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  updatedAt: Date;
}
```

### Sketch Processing Request

```typescript
interface SketchProcessingRequest {
  imageData: string; // base64 encoded
  format: 'png' | 'jpeg' | 'webp';
  userId?: string;
}

interface SketchProcessingResponse {
  nodes: Array<{
    id: string;
    type: 'caveNode' | 'caveText' | 'caveImage';
    position: { x: number; y: number };
    data: {
      label?: string;
      text?: string;
      shape?: 'process' | 'decision' | 'circle' | 'parallelogram';
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated?: boolean;
  }>;
}
```

### Enhanced Node Types

```typescript
// Resizable Text Node
interface ResizableTextNodeData extends CaveTextData {
  text: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  backgroundColor?: string;
  textColor?: string;
}

// Editable Flowchart Node
interface EditableFlowchartNodeData extends CaveNodeData {
  label: string;
  shape: 'process' | 'decision' | 'circle' | 'parallelogram';
  isEditing: boolean;
  backgroundColor?: string;
  strokeColor?: string;
  textColor?: string;
}

// Arrow Connector
interface ArrowConnectorData {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  style: 'solid' | 'dashed' | 'dotted';
  headStyle: 'triangle' | 'circle' | 'diamond' | 'none';
  color: string;
  strokeWidth: number;
}

// Post-It Note
interface PostItNodeData {
  text: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
  rotation: number;
  hasShadow: boolean;
  width: number;
  height: number;
}

// Color Picker State
interface ColorPickerState {
  isOpen: boolean;
  position: { x: number; y: number };
  currentColor: string;
  targetElements: string[]; // IDs of selected elements
  targetProperty: 'background' | 'stroke' | 'text';
  recentColors: string[];
}
```

### Sticker Database Schema

```typescript
interface Sticker {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface StickerCollectionResponse {
  stickers: Sticker[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Toolbar orientation matches position
*For any* toolbar position (top, bottom, left, right), the toolbar layout orientation should be horizontal for top/bottom and vertical for left/right
**Validates: Requirements 1.3, 1.4**

### Property 2: Drag-to-dock snaps to nearest edge
*For any* drag release position within 50 pixels of a screen edge, the toolbar should snap to that edge and update its position state
**Validates: Requirements 1.2**

### Property 3: Drop zone indicator appears near edges
*For any* drag position within 50 pixels of a screen edge, a visual drop zone indicator should be displayed at that edge
**Validates: Requirements 1.1, 8.1**

### Property 4: Context menu selection updates position
*For any* position selected from the context menu, the toolbar should move to that position and update its orientation
**Validates: Requirements 2.2**

### Property 5: Current position is highlighted in menu
*For any* current toolbar position, opening the context menu should display a visual indicator (checkmark) next to that position option
**Validates: Requirements 2.3**

### Property 6: Popovers remain within viewport bounds
*For any* popover that would extend beyond viewport boundaries, the system should adjust its position to keep it fully visible
**Validates: Requirements 3.5**

### Property 7: Position preference persistence round-trip
*For any* toolbar position change, saving and then reloading the application should restore that same position
**Validates: Requirements 4.1, 4.2**

### Property 8: Failed saves maintain current state
*For any* save operation failure, the toolbar should remain in its current position and attempt to retry the save
**Validates: Requirements 4.4**

### Property 9: Tool selection provides visual feedback
*For any* tool icon clicked, the system should provide visual feedback indicating selection
**Validates: Requirements 8.3**

### Property 10: Image format validation
*For any* file upload, the system should accept PNG, JPEG, and WEBP formats and reject all other formats
**Validates: Requirements 9.1**

### Property 11: Upload triggers AI processing
*For any* valid image uploaded, the system should send the image data to the AI vision model API
**Validates: Requirements 9.2**

### Property 12: Generated elements are centered
*For any* successful sketch conversion, the generated nodes should be positioned at the center of the viewport
**Validates: Requirements 9.4**

### Property 13: AI errors display retry UI
*For any* AI processing failure, the system should display an error message with retry and cancel options
**Validates: Requirements 9.5**

### Property 14: Text node resize maintains minimum dimensions
*For any* text node resize operation, the system should prevent dimensions from going below 50px width and 30px height
**Validates: Requirements 10.5**

### Property 15: Corner resize maintains aspect ratio
*For any* corner handle drag on a text node, the width and height should change proportionally
**Validates: Requirements 10.2**

### Property 16: Edge resize changes single dimension
*For any* edge handle drag on a text node, only the corresponding dimension (width or height) should change
**Validates: Requirements 10.3**

### Property 17: Double-click activates inline editing
*For any* flowchart node, double-clicking should enable inline text editing mode with cursor visible
**Validates: Requirements 11.1, 11.2**

### Property 18: Enter key saves inline edits
*For any* node in inline editing mode, pressing Enter should save the text changes and exit editing mode
**Validates: Requirements 11.3**

### Property 19: Escape key cancels inline edits
*For any* node in inline editing mode, pressing Escape should discard changes and restore original text
**Validates: Requirements 11.4**

### Property 20: Color picker applies to all selected elements
*For any* color selection when multiple elements are selected, the color should be applied to all selected elements
**Validates: Requirements 12.3**

### Property 21: Arrow creation connects two points
*For any* arrow drawing operation from point A to point B, the system should create an arrow connector with those endpoints
**Validates: Requirements 13.2**

### Property 22: Post-it notes have default styling
*For any* newly created post-it note, it should have yellow color and shadow effect applied by default
**Validates: Requirements 13.4**

## Error Handling

### Toolbar Positioning Errors

**Scenario**: User drags toolbar but browser doesn't support drag events
- **Handling**: Fallback to context menu only, display informational tooltip
- **Recovery**: No data loss, toolbar remains functional via menu

**Scenario**: Saved position preference is corrupted or invalid
- **Handling**: Validate position value, fallback to default ('top')
- **Recovery**: Log error, reset to default, allow user to reposition

### Persistence Errors

**Scenario**: LocalStorage is full or disabled
- **Handling**: Catch quota exceeded errors, use in-memory state only
- **Recovery**: Display warning banner, position resets on reload

**Scenario**: API save request fails (network error, 500 response)
- **Handling**: Retry with exponential backoff (3 attempts)
- **Recovery**: If all retries fail, fallback to LocalStorage

### Sketch Upload Errors

**Scenario**: User uploads unsupported file format
- **Handling**: Validate file type before upload, show error toast
- **Recovery**: Clear file input, allow user to select different file

**Scenario**: Image file exceeds size limit (10MB)
- **Handling**: Check file size before processing, show error with limit
- **Recovery**: Prompt user to compress or select smaller image

**Scenario**: AI API returns error or timeout
- **Handling**: Display user-friendly error message with retry button
- **Recovery**: Preserve uploaded image, allow retry without re-upload

**Scenario**: AI returns malformed response
- **Handling**: Validate response schema, log error details
- **Recovery**: Show generic error, offer manual node creation as alternative

## Testing Strategy

### Unit Testing

**Toolbar Positioning Logic**
- Test `getContainerClasses()` returns correct CSS for each position
- Test edge detection algorithm with boundary values (0px, 49px, 50px, 51px)
- Test orientation calculation for all four positions

**Popover Positioning**
- Test `getPopoverPosition()` for each toolbar position
- Test viewport boundary detection with various screen sizes
- Test position adjustment when popover would overflow

**State Management**
- Test Zustand store actions (setPosition, setDragging)
- Test persistence layer (save/load from LocalStorage and API)
- Test fallback chain when storage methods fail

**File Validation**
- Test image format detection for valid formats (PNG, JPEG, WEBP)
- Test rejection of invalid formats (PDF, SVG, GIF)
- Test file size validation

**Text Node Resizing**
- Test resize handle positioning for all 8 handles
- Test minimum dimension enforcement (50px width, 30px height)
- Test aspect ratio maintenance for corner handles
- Test independent dimension changes for edge handles
- Test text reflow after resize

**Inline Editing**
- Test double-click activation of edit mode
- Test Enter key saves changes
- Test Escape key cancels changes
- Test click-outside saves changes
- Test cursor positioning and text selection

**Color Picker**
- Test color application to single element
- Test color application to multiple selected elements
- Test preset color selection
- Test custom color input (HEX, RGB, HSL)
- Test recent colors tracking

**Arrow Connectors**
- Test arrow creation from point A to point B
- Test arrow style variations (solid, dashed, dotted)
- Test arrow head styles (triangle, circle, diamond, none)
- Test arrow color and stroke width customization

**Post-It Notes**
- Test default styling (yellow color, shadow)
- Test color variations (yellow, pink, blue, green, orange)
- Test rotation randomization (±2 degrees)
- Test text editing on post-it notes

### Property-Based Testing

We will use **fast-check** (a property-based testing library for TypeScript) to verify universal properties across randomized inputs.

**Configuration**: Each property test will run a minimum of 100 iterations to ensure statistical confidence.

**Test Tagging**: Each property-based test will include a comment linking it to the design document property:
```typescript
// Feature: adaptive-dockable-toolbar, Property 1: Toolbar orientation matches position
```

**Property Test Examples**:

1. **Orientation Consistency**: Generate random toolbar positions, verify layout direction matches expected orientation
2. **Edge Snapping**: Generate random drag coordinates, verify toolbar snaps to correct edge when within threshold
3. **Persistence Round-Trip**: Generate random positions, save and load, verify position is preserved
4. **Viewport Bounds**: Generate random popover sizes and positions, verify they never extend beyond viewport
5. **Format Validation**: Generate random file extensions, verify only valid image formats are accepted
6. **Text Node Minimum Dimensions**: Generate random resize deltas, verify dimensions never go below minimums
7. **Corner Resize Aspect Ratio**: Generate random corner drag deltas, verify width/height ratio is maintained
8. **Edge Resize Independence**: Generate random edge drag deltas, verify only one dimension changes
9. **Color Application**: Generate random color values and element selections, verify color applies to all selected
10. **Arrow Endpoint Validation**: Generate random start/end points, verify arrow connects those exact coordinates

### Integration Testing

**Drag-and-Drop Flow**
- Simulate complete drag gesture from one edge to another
- Verify drop zone indicators appear and disappear correctly
- Verify toolbar animates to new position
- Verify position is saved to storage

**Context Menu Flow**
- Open context menu, select each position option
- Verify toolbar moves and orientation updates
- Verify current position is highlighted in menu

**Sketch Upload Flow**
- Upload valid image file
- Mock AI API response with sample nodes/edges
- Verify nodes are added to canvas at center
- Verify error handling when API fails

**Tier-Based Restrictions**
- Test free tier: verify toolbar is locked to top, drag/menu disabled
- Test Pro tier: verify all positioning features enabled
- Test upgrade flow: verify features unlock immediately
- Test downgrade flow: verify toolbar resets to top

### End-to-End Testing

**User Journey: First-Time User**
1. Load application (toolbar defaults to top)
2. Drag toolbar to right edge
3. Verify toolbar snaps and rotates to vertical
4. Reload application
5. Verify toolbar is still on right edge

**User Journey: Sketch Upload**
1. Click upload button in toolbar
2. Select hand-drawn flowchart image
3. Wait for AI processing
4. Verify editable nodes appear on canvas
5. Verify nodes can be moved and edited

**User Journey: Mobile Responsive**
1. Load application on desktop (toolbar on right)
2. Resize window to mobile width (<768px)
3. Verify toolbar moves to bottom
4. Verify drag handle is disabled
5. Resize back to desktop
6. Verify toolbar returns to right edge

## Implementation Notes

### Performance Considerations

**Drag Performance**
- Throttle drag event handlers to 60fps (16ms)
- Use CSS transforms for positioning (GPU-accelerated)
- Debounce save operations (500ms after drag ends)

**Animation Performance**
- Use `transition-all duration-300` for smooth transitions
- Leverage `will-change: transform` for elements that will animate
- Avoid layout thrashing by batching DOM reads/writes

**AI Processing**
- Show loading indicator immediately on upload
- Stream response if API supports it
- Implement request cancellation if user closes modal

### Accessibility

**Keyboard Navigation**
- Toolbar should be focusable and navigable with Tab
- Arrow keys should move focus between tools
- Enter/Space should activate focused tool
- Context menu should be accessible via Shift+F10 or context menu key

**Screen Reader Support**
- Toolbar should have `role="toolbar"` and `aria-label="Main toolbar"`
- Current position should be announced when changed
- Drag handle should have `aria-label="Drag to reposition toolbar"`
- Drop zones should have `aria-live="polite"` announcements

**Visual Indicators**
- Drop zones should have sufficient contrast (WCAG AA)
- Focus indicators should be visible on all interactive elements
- Animation should respect `prefers-reduced-motion` media query

### Browser Compatibility

**Drag and Drop API**
- Supported in all modern browsers (Chrome 4+, Firefox 3.5+, Safari 3.1+)
- Fallback: Context menu only for browsers without drag support

**CSS Features**
- `backdrop-filter` for blur effect (fallback: solid background)
- CSS Grid and Flexbox (widely supported)
- CSS transitions and transforms (widely supported)

**Storage APIs**
- LocalStorage (universal support)
- Fallback: In-memory state only if LocalStorage unavailable

### Security Considerations

**File Upload**
- Validate file type on both client and server
- Scan uploaded files for malware (server-side)
- Limit file size to prevent DoS (10MB max)
- Use signed URLs for temporary storage

**API Communication**
- Use HTTPS for all API requests
- Include CSRF tokens for authenticated requests
- Rate limit sketch processing (5 requests per minute per user)
- Sanitize AI-generated content before rendering

**Data Privacy**
- Don't log uploaded image data
- Delete temporary files after processing
- Allow users to opt-out of AI features
- Comply with GDPR for EU users

## Dependencies

### New Dependencies

```json
{
  "fast-check": "^3.15.0",  // Property-based testing
  "@testing-library/react": "^14.0.0",  // Component testing
  "@testing-library/user-event": "^14.5.0",  // User interaction simulation
  "vitest": "^1.0.0",  // Test runner
  "zustand": "^4.4.0",  // State management for toolbar position
  "react-colorful": "^5.6.1",  // Color picker component
  "react-rnd": "^10.4.1"  // Resizable and draggable components
}
```

### Existing Dependencies (Leveraged)

- `react` and `react-dom`: Core UI framework
- `@xyflow/react`: Canvas/flow management
- `@google/genai`: AI vision API for sketch processing
- `zustand`: State management (to be added for toolbar state)
- Tailwind CSS: Styling and responsive design

## Migration Strategy

### Phase 1: Core Toolbar Refactor (Week 1)
- Create new `AdaptiveDockableToolbar` component
- Implement positioning logic and state management
- Add drag-and-drop functionality
- Implement context menu
- Write unit tests

### Phase 2: Persistence & Tier Gating (Week 1)
- Add LocalStorage persistence
- Implement API endpoints for user preferences
- Add tier-based feature gating
- Test upgrade/downgrade flows

### Phase 3: Sketch Upload Feature (Week 2)
- Create `SketchUploadModal` component
- Integrate Gemini Vision API
- Implement node generation from AI response
- Add error handling and retry logic
- Write integration tests

### Phase 4: Polish & Testing (Week 2)
- Add animations and transitions
- Implement accessibility features
- Write property-based tests
- Conduct end-to-end testing
- Performance optimization

### Phase 5: Deployment (Week 3)
- Feature flag rollout (10% → 50% → 100%)
- Monitor error rates and performance
- Gather user feedback
- Iterate on UX improvements
