# Implementation Plan

- [x] 1. Set up state management and core infrastructure
  - Create Zustand store for toolbar position state
  - Add new dependencies (zustand, react-colorful, react-rnd)
  - Update TypeScript types for new node data structures
  - _Requirements: 1.1, 1.2, 4.1_

- [x] 2. Implement adaptive dockable toolbar
- [x] 2.1 Create ToolbarContainer component with dynamic positioning
  - Implement CSS classes for all four positions (top, bottom, left, right)
  - Add orientation logic (horizontal for top/bottom, vertical for left/right)
  - Implement smooth transitions (300ms duration)
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 2.2 Create ToolbarHandle component with drag functionality
  - Implement drag event handlers with 5px threshold
  - Add edge detection logic (50px from screen edges)
  - Create visual drop zone indicators
  - _Requirements: 1.1, 1.2, 8.1_

- [x] 2.3 Write property test for toolbar orientation
  - **Property 1: Toolbar orientation matches position**
  - **Validates: Requirements 1.3, 1.4**

- [x] 2.4 Write property test for drag-to-dock snapping
  - **Property 2: Drag-to-dock snaps to nearest edge**
  - **Validates: Requirements 1.2**

- [x] 2.5 Implement context menu for position selection
  - Create context menu component with four dock options
  - Add current position highlighting
  - Wire up position change handlers
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.6 Write property test for context menu selection
  - **Property 4: Context menu selection updates position**
  - **Validates: Requirements 2.2**

- [x] 3. Implement popover positioning system
- [x] 3.1 Create ToolPopover component with dynamic positioning
  - Implement position calculation algorithm for all four toolbar positions
  - Add viewport boundary detection and adjustment
  - Ensure popovers open away from screen edges
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.2 Write property test for popover viewport bounds
  - **Property 6: Popovers remain within viewport bounds**
  - **Validates: Requirements 3.5**

- [x] 4. Implement persistence layer
- [x] 4.1 Add LocalStorage persistence
  - Implement save/load functions for toolbar position
  - Add error handling for quota exceeded
  - Implement fallback to in-memory state
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.2 Create API endpoints for user preferences
  - Implement POST /api/user/preferences endpoint
  - Implement GET /api/user/preferences endpoint
  - Add retry logic with exponential backoff
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4.3 Write property test for persistence round-trip
  - **Property 7: Position preference persistence round-trip**
  - **Validates: Requirements 4.1, 4.2**

- [x] 5. Implement tier-based feature gating
- [x] 5.1 Add toolbar locking for free tier users
  - Check user plan tier from auth context
  - Disable drag functionality for free tier
  - Disable context menu options for free tier
  - Show upgrade prompt on attempted move
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5.2 Implement upgrade/downgrade flow
  - Enable features immediately on upgrade to Pro
  - Reset toolbar to top on downgrade to free
  - Test tier transition edge cases
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. Implement mobile responsive behavior
- [x] 6.1 Add viewport width detection
  - Implement media query listener for 768px breakpoint
  - Force toolbar to bottom on mobile
  - Disable drag and context menu on mobile
  - Restore saved position on desktop resize
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement resizable text nodes
- [x] 7.1 Create ResizableTextNode component
  - Add react-rnd for resize functionality
  - Implement 8 resize handles (4 corners + 4 edges)
  - Add minimum dimension enforcement (50px width, 30px height)
  - Implement text reflow on resize
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7.2 Write property test for minimum dimensions
  - **Property 14: Text node resize maintains minimum dimensions**
  - **Validates: Requirements 10.5**

- [x] 7.3 Write property test for corner resize aspect ratio
  - **Property 15: Corner resize maintains aspect ratio**
  - **Validates: Requirements 10.2**

- [x] 7.4 Write property test for edge resize independence
  - **Property 16: Edge resize changes single dimension**
  - **Validates: Requirements 10.3**

- [x] 8. Implement inline text editing for flowchart nodes
- [x] 8.1 Add inline editing mode to CaveNode component
  - Implement double-click handler to activate editing
  - Add contentEditable div with cursor positioning
  - Implement Enter key to save changes
  - Implement Escape key to cancel changes
  - Implement click-outside to save changes
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 8.2 Write property test for inline editing activation
  - **Property 17: Double-click activates inline editing**
  - **Validates: Requirements 11.1, 11.2**

- [x] 8.3 Write property test for Enter key save
  - **Property 18: Enter key saves inline edits**
  - **Validates: Requirements 11.3**

- [x] 8.4 Write property test for Escape key cancel
  - **Property 19: Escape key cancels inline edits**
  - **Validates: Requirements 11.4**

- [x] 9. Implement color picker system
- [x] 9.1 Create ColorPicker component
  - Integrate react-colorful for color selection
  - Add preset color palette (16 colors in 4x4 grid)
  - Implement recent colors tracking (last 8 colors)
  - Add transparency slider for backgrounds
  - _Requirements: 12.1, 12.2, 12.5_

- [x] 9.2 Implement color application logic
  - Apply color to single selected element
  - Apply color to multiple selected elements
  - Save color preference per element type
  - Update node data with new color values
  - _Requirements: 12.2, 12.3, 12.4_

- [x] 9.3 Write property test for multi-element color application
  - **Property 20: Color picker applies to all selected elements**
  - **Validates: Requirements 12.3**

- [x] 10. Implement arrow connectors
- [x] 10.1 Create ArrowConnector component
  - Implement arrow drawing mode in toolbar
  - Add click-and-drag arrow creation
  - Implement arrow data model with start/end points
  - Add arrow rendering with SVG
  - _Requirements: 13.1, 13.2_

- [x] 10.2 Add arrow customization options
  - Implement line style selector (solid, dashed, dotted)
  - Implement arrow head style selector (triangle, circle, diamond, none)
  - Add color picker integration for arrows
  - Add stroke width control
  - _Requirements: 13.5_

- [x] 10.3 Write property test for arrow endpoint validation
  - **Property 21: Arrow creation connects two points**
  - **Validates: Requirements 13.2**

- [x] 11. Implement post-it note shapes
- [x] 11.1 Create PostItNode component
  - Implement post-it tool in toolbar
  - Add post-it node with default yellow styling
  - Implement shadow effect for depth
  - Add slight rotation (±2 degrees) for organic feel
  - _Requirements: 13.3, 13.4_

- [x] 11.2 Add post-it color variations
  - Implement color options (yellow, pink, blue, green, orange)
  - Add color selector in post-it context menu
  - Apply gradient effect for realistic appearance
  - _Requirements: 13.4_

- [x] 11.3 Write property test for post-it default styling
  - **Property 22: Post-it notes have default styling**
  - **Validates: Requirements 13.4**

- [x] 12. Implement sketch-to-diagram AI feature
- [x] 12.1 Create SketchUploadModal component
  - Add file input with drag-and-drop support
  - Implement image preview before upload
  - Add file format validation (PNG, JPEG, WEBP)
  - Add file size validation (10MB max)
  - _Requirements: 9.1_

- [x] 12.2 Integrate Gemini Vision API
  - Implement image upload to Gemini API
  - Parse AI response into node/edge data structures
  - Handle API errors with retry mechanism
  - Add loading indicator during processing
  - _Requirements: 9.2, 9.3, 9.5_

- [x] 12.3 Implement node generation from AI response
  - Convert AI response to Canvas nodes
  - Position generated nodes at viewport center
  - Make generated nodes editable
  - _Requirements: 9.4_

- [x] 12.4 Write property test for image format validation
  - **Property 10: Image format validation**
  - **Validates: Requirements 9.1**

- [x] 12.5 Write property test for AI processing trigger
  - **Property 11: Upload triggers AI processing**
  - **Validates: Requirements 9.2**

- [x] 13. Add animations and polish
- [x] 13.1 Implement toolbar transition animations
  - Add 300ms transition for position changes
  - Implement smooth icon repositioning
  - Add drop zone fade-in/fade-out animations
  - _Requirements: 1.5, 8.2_

- [x] 13.2 Add visual feedback for interactions
  - Implement hover states for all interactive elements
  - Add focus indicators for keyboard navigation
  - Implement tool selection visual feedback
  - _Requirements: 8.3_

- [x] 14. Implement accessibility features
- [x] 14.1 Add keyboard navigation
  - Make toolbar focusable and navigable with Tab
  - Implement arrow key navigation between tools
  - Add Enter/Space activation for focused tools
  - Add Shift+F10 for context menu

- [x] 14.2 Add screen reader support
  - Add ARIA labels to toolbar and tools
  - Implement aria-live announcements for position changes
  - Add descriptive labels for drag handle
  - Ensure all interactive elements have accessible names

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
