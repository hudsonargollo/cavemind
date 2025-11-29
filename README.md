# CaveMind (Modo Caverna OS)

**CaveMind** is a high-performance, dark-mode collaborative whiteboard application designed for deep strategic work. Unlike traditional whiteboards that are often cluttered or overly bright, CaveMind provides a "Cave" environment—minimalist, focused, and dark—powered by **Google Gemini 2.0 Flash** to act as an intelligent creative partner.

![CaveMind Banner](https://placehold.co/1200x400/0A0A0A/FF3333?text=CAVE+MIND)

## 🚀 Key Features

### 1. The "Cave" Canvas
A limitless, dot-grid environment designed for low-light focus.
*   **Infinite Pan & Zoom**: Built on React Flow for high performance.
*   **Geometric Strategy Nodes**: 
    *   **Process**: Rounded rectangles for standard steps.
    *   **Decision**: Diamonds for logic gates.
    *   **Start/End**: Circles for terminators.
    *   **Data**: Parallelograms for inputs/outputs.
*   **Multimedia Support**:
    *   **Notes**: Rich text areas for detailed intelligence.
    *   **Images**: Drag-and-drop support directly onto the canvas.
    *   **Stickers**: Expressive reactions (powered by Giphy) to add personality to flows.

### 2. "Cave Brain" (AI Integration)
Powered by **Google Gemini 2.0 Flash**.
*   **Text-to-Flow**: Click the "Spark" (✦) button, describe a strategy (e.g., "SaaS Marketing Funnel"), and watch the AI build a complete diagram instantly.
*   **Path Summarization**: Select a sequence of nodes and click "Summarize Path" to get an executive summary of the selected strategy.

### 3. Advanced Interactions
*   **Context Menus**: Right-click on the canvas to add nodes or paste. Right-click on nodes to delete, duplicate, or change shapes.
*   **Drag & Drop**: Drag images from your desktop directly into the browser to upload.
*   **Internal Clipboard**: Copy and paste nodes within the application.
*   **Auto-Save**: State is automatically persisted to local storage.

---

## 🛠 Technical Architecture

CaveMind is built with a modern, performance-first stack:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Component-based UI logic. |
| **Styling** | Tailwind CSS | Utility-first styling for the "Modo Caverna" design system. |
| **Canvas Engine** | @xyflow/react | Handles the infinite canvas, node rendering, and edges. |
| **Intelligence** | @google/genai | Integration with Google Gemini 2.0 Flash model. |
| **Fonts** | Jersey 15 & Inter | Custom typography for the "War Room" aesthetic. |

### Project Structure

```
/
├── components/
│   ├── CaveNode.tsx         # The main shape node (Process, Decision, etc.)
│   ├── CaveTextNode.tsx     # Resizable text notes
│   ├── CaveImageNode.tsx    # Image containers with Drag & Drop
│   ├── CaveStickerNode.tsx  # Sticker/Reaction nodes
│   ├── CaveControlPanel.tsx # Bottom floating dock for AI & Actions
│   └── ContextMenu.tsx      # Smart right-click menu system
├── services/
│   └── geminiService.ts     # Google Gemini API handling (Prompt Engineering)
├── utils/
│   └── layout.ts            # Algorithms to arrange AI-generated nodes
├── App.tsx                  # Main application controller & state management
├── types.ts                 # TypeScript interfaces
├── constants.ts             # Global configurations & assets
└── index.tsx                # Entry point
```

---

## 📖 User Guide

### Navigation
*   **Pan**: Click and drag on empty space.
*   **Zoom**: Mouse wheel or trackpad pinch.
*   **Select**: Click a node. Shift+Click to select multiple. Shift+Drag to box select.

### Creating Content
1.  **Context Menu (Recommended)**: Right-click anywhere on the canvas to open the creation menu. You can add Shapes, Notes, Images, or Stickers.
2.  **Dock Controls**: Use the `+` button in the bottom-center dock.
3.  **AI Generation**: Click the Red Spark (✦) button, type a prompt (e.g., "Launch plan for a coffee shop"), and press Enter.

### Editing Content
*   **Change Shape**: Right-click a node and select a new shape from the grid, or use the floating toolbar that appears above a selected node.
*   **Edit Text**: Click inside any node to type.
*   **Connect Nodes**: Drag from the orange handle (dot) on one node to another.
*   **Replace Images**: Drag a new image file from your desktop onto an existing Image Node.

---

## 🔧 Installation & Setup

1.  **Prerequisites**: Node.js and npm/yarn.
2.  **Clone & Install**:
    ```bash
    npm install
    ```
    *Ensure you have the dependencies listed in `package.json` (react, @xyflow/react, @google/genai).*

3.  **Environment Variables**:
    CaveMind requires a Google API Key for the AI features.
    ```env
    # .env
    API_KEY=your_google_gemini_api_key
    ```

4.  **Run Development Server**:
    ```bash
    npm start
    ```

## 🎨 Design Tokens

*   **Background**: `#0A0A0A`
*   **Surface**: `#1A1A1A`
*   **Primary Accent**: `#FF3333` (Cave Red)
*   **Secondary Accent**: `#FF7A33` (Ember Orange)

---

## 🤝 Contributing

We welcome contributions to expand the "Cave".
1.  Fork the repo.
2.  Create a feature branch.
3.  Submit a Pull Request.

*Modo Caverna. Discipline meets Technology.*
