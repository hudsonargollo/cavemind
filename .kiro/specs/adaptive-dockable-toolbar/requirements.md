# Requirements Document

## Introduction

The Adaptive Dockable Toolbar is a core differentiating feature for KCAVEMINDiro that allows users to customize their workspace layout by positioning the main toolbar on any of the four screen edges (top, bottom, left, or right). This feature maximizes canvas space and adapts to individual workflow preferences, providing a competitive advantage over fixed-layout whiteboard tools like Excalidraw+.

## Glossary

- **Toolbar**: The main UI component containing drawing tools, shape options, and action buttons
- **Docking**: The act of anchoring the Toolbar to a specific screen edge
- **Orientation**: The layout direction of the Toolbar (horizontal for top/bottom, vertical for left/right)
- **Popover**: A floating UI element that displays additional options for a tool (e.g., color picker, stroke width selector)
- **Canvas**: The main drawing surface where users create content
- **User Profile**: The persistent storage of user preferences and settings
- **Viewport**: The visible area of the application window

## Requirements

### Requirement 1

**User Story:** As a user, I want to drag the toolbar to any screen edge, so that I can position it according to my workflow preference and maximize canvas space.

#### Acceptance Criteria

1. WHEN a user drags the Toolbar handle to within 50 pixels of a screen edge, THEN the System SHALL display a visual drop zone indicator at that edge
2. WHEN a user releases the Toolbar handle over a valid drop zone, THEN the System SHALL snap the Toolbar to that edge and update its orientation
3. WHEN the Toolbar is docked to the top or bottom edge, THEN the System SHALL arrange tool icons in a horizontal row layout
4. WHEN the Toolbar is docked to the left or right edge, THEN the System SHALL arrange tool icons in a vertical column layout
5. WHEN a user drags the Toolbar between edges, THEN the System SHALL animate the transition smoothly over 300 milliseconds

### Requirement 2

**User Story:** As a user, I want to select toolbar position from a context menu, so that I can quickly reposition it without dragging.

#### Acceptance Criteria

1. WHEN a user right-clicks on the Toolbar, THEN the System SHALL display a context menu with options "Dock to Top", "Dock to Bottom", "Dock to Left", and "Dock to Right"
2. WHEN a user selects a dock position from the context menu, THEN the System SHALL move the Toolbar to that edge and update its orientation
3. WHEN the context menu is displayed, THEN the System SHALL highlight the current dock position with a checkmark or visual indicator

### Requirement 3

**User Story:** As a user, I want tool popovers to open away from screen edges, so that they remain fully visible and accessible.

#### Acceptance Criteria

1. WHEN the Toolbar is docked to the top edge and a user opens a Popover, THEN the System SHALL position the Popover below the tool icon
2. WHEN the Toolbar is docked to the bottom edge and a user opens a Popover, THEN the System SHALL position the Popover above the tool icon
3. WHEN the Toolbar is docked to the left edge and a user opens a Popover, THEN the System SHALL position the Popover to the right of the tool icon
4. WHEN the Toolbar is docked to the right edge and a user opens a Popover, THEN the System SHALL position the Popover to the left of the tool icon
5. WHEN a Popover would extend beyond the Viewport boundaries, THEN the System SHALL adjust its position to remain fully visible

### Requirement 4

**User Story:** As a user, I want my toolbar position preference saved, so that it persists across sessions without reconfiguration.

#### Acceptance Criteria

1. WHEN a user changes the Toolbar position, THEN the System SHALL save the new position to User Profile storage immediately
2. WHEN a user loads the application, THEN the System SHALL restore the Toolbar to the saved position from User Profile storage
3. WHEN no saved preference exists, THEN the System SHALL default the Toolbar to the top edge
4. WHEN the save operation fails, THEN the System SHALL maintain the current Toolbar position and retry the save operation

### Requirement 5

**User Story:** As a mobile user, I want the toolbar optimized for touch interaction, so that I can access tools comfortably with my thumb.

#### Acceptance Criteria

1. WHEN the Viewport width is less than 768 pixels, THEN the System SHALL force the Toolbar to the bottom edge
2. WHEN the Viewport width is less than 768 pixels, THEN the System SHALL disable drag-to-dock functionality
3. WHEN the Viewport width is less than 768 pixels, THEN the System SHALL disable the context menu dock options
4. WHEN the Viewport width transitions from mobile to desktop size, THEN the System SHALL restore the user's saved Toolbar position preference

### Requirement 6

**User Story:** As a free-tier user, I want a functional toolbar, so that I can use basic drawing features without subscription.

#### Acceptance Criteria

1. WHEN a user has a free-tier subscription, THEN the System SHALL fix the Toolbar to the top edge
2. WHEN a user has a free-tier subscription, THEN the System SHALL disable drag-to-dock functionality
3. WHEN a user has a free-tier subscription, THEN the System SHALL disable context menu dock options
4. WHEN a free-tier user attempts to move the Toolbar, THEN the System SHALL display an upgrade prompt with Pro tier benefits

### Requirement 7

**User Story:** As a Pro or Team tier user, I want full toolbar customization, so that I can optimize my workspace layout.

#### Acceptance Criteria

1. WHEN a user has a Pro or Team tier subscription, THEN the System SHALL enable drag-to-dock functionality
2. WHEN a user has a Pro or Team tier subscription, THEN the System SHALL enable all context menu dock options
3. WHEN a user upgrades from free to Pro tier, THEN the System SHALL immediately enable toolbar customization features
4. WHEN a user downgrades from Pro to free tier, THEN the System SHALL reset the Toolbar to the top edge and disable customization

### Requirement 8

**User Story:** As a user, I want visual feedback during toolbar interactions, so that I understand the system's response to my actions.

#### Acceptance Criteria

1. WHEN a user hovers the Toolbar handle near a screen edge during drag, THEN the System SHALL display a semi-transparent drop zone shadow at that edge
2. WHEN the Toolbar transitions between positions, THEN the System SHALL animate the movement with a 300 millisecond duration
3. WHEN a user clicks a tool icon, THEN the System SHALL provide visual feedback indicating the tool is selected
4. WHEN the Toolbar orientation changes, THEN the System SHALL animate icon repositioning smoothly without jarring layout shifts

### Requirement 9

**User Story:** As a user, I want to upload a sketch image and have it converted to editable diagram elements, so that I can quickly digitize hand-drawn concepts.

#### Acceptance Criteria

1. WHEN a user uploads an image file through the Toolbar, THEN the System SHALL accept common image formats (PNG, JPEG, WEBP)
2. WHEN an image is uploaded, THEN the System SHALL send the image to an AI vision model for analysis
3. WHEN the AI model processes the sketch, THEN the System SHALL generate editable Canvas nodes representing detected shapes, text, and connectors
4. WHEN the conversion completes, THEN the System SHALL place the generated elements on the Canvas at the center of the Viewport
5. WHEN the AI model cannot process the image, THEN the System SHALL display an error message and allow the user to retry or cancel

### Requirement 10

**User Story:** As a user, I want to resize text nodes in both width and height, so that I can control the text area dimensions independently.

#### Acceptance Criteria

1. WHEN a user selects a text node, THEN the System SHALL display resize handles on all four corners and all four edges
2. WHEN a user drags a corner resize handle, THEN the System SHALL resize both width and height proportionally
3. WHEN a user drags an edge resize handle, THEN the System SHALL resize only that dimension independently
4. WHEN a text node is resized, THEN the System SHALL reflow the text content to fit the new dimensions
5. WHEN a text node reaches minimum dimensions (50px width, 30px height), THEN the System SHALL prevent further reduction

### Requirement 11

**User Story:** As a user, I want to edit text directly on flowchart nodes, so that I can quickly update labels without opening separate dialogs.

#### Acceptance Criteria

1. WHEN a user double-clicks a flowchart node, THEN the System SHALL enable inline text editing mode
2. WHEN inline editing is active, THEN the System SHALL display a text cursor and allow keyboard input
3. WHEN a user presses Enter in editing mode, THEN the System SHALL save the changes and exit editing mode
4. WHEN a user presses Escape in editing mode, THEN the System SHALL discard changes and exit editing mode
5. WHEN a user clicks outside the node during editing, THEN the System SHALL save changes and exit editing mode

### Requirement 12

**User Story:** As a user, I want to change the color of elements, so that I can visually organize and categorize my diagrams.

#### Acceptance Criteria

1. WHEN a user selects an element and opens the color picker, THEN the System SHALL display a palette with preset colors and a custom color selector
2. WHEN a user selects a color, THEN the System SHALL apply it to the selected element's background or stroke
3. WHEN multiple elements are selected, THEN the System SHALL apply the color to all selected elements
4. WHEN a color is applied, THEN the System SHALL save the color preference for that element type
5. WHEN the color picker is opened, THEN the System SHALL highlight the current element color

### Requirement 13

**User Story:** As a user, I want to add arrow connectors and post-it note shapes, so that I can create more expressive and varied diagrams.

#### Acceptance Criteria

1. WHEN a user selects the arrow tool from the Toolbar, THEN the System SHALL enable arrow drawing mode
2. WHEN a user drags from one point to another in arrow mode, THEN the System SHALL create an arrow connector between those points
3. WHEN a user selects the post-it tool from the Toolbar, THEN the System SHALL add a post-it note shape to the Canvas
4. WHEN a post-it note is created, THEN the System SHALL apply a default yellow color and shadow effect
5. WHEN an arrow is created, THEN the System SHALL allow customization of arrow head style, line style, and color

### Requirement 10

**User Story:** As a user, I want to select stickers from a database collection with thumbnail previews, so that I can quickly add visual elements to my canvas without uploading files.

#### Acceptance Criteria

1. WHEN a user clicks the sticker tool in the Toolbar, THEN the System SHALL display a popover with thumbnail previews of available stickers from the database
2. WHEN the sticker popover is displayed, THEN the System SHALL load and render thumbnail images for all stickers in the collection
3. WHEN a user clicks a sticker thumbnail, THEN the System SHALL add that sticker to the Canvas at the center of the Viewport
4. WHEN the sticker database is empty or fails to load, THEN the System SHALL display a fallback message indicating no stickers are available
5. WHEN a user scrolls through the sticker collection, THEN the System SHALL lazy-load thumbnails to optimize performance
