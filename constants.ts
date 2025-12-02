export const COLORS = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  primary: '#FF3333', // Focus Red
  secondary: '#FF7A33', // Ember Orange
  text: '#E5E5E5', // Mist Grey
  border: '#333333',
};

export const INITIAL_NODES = [
  {
    id: '1',
    type: 'caveNode',
    position: { x: 0, y: 0 },
    data: { label: 'Comece Aqui', details: 'Clique com o botão direito para opções.', shape: 'process' },
  },
];

export const SYSTEM_INSTRUCTION = `
You are the architect of Modo Caverna. You are a strategic workflow engine.
Your goal is to transform chaos into structure.
You speak in JSON.
When given a prompt, create a logical workflow or mind map.
Break down complex topics into actionable steps (Nodes) and connections (Edges).
Nodes should be brief concepts.
Edges should represent flow or relationship.
`;

export const STICKERS = [
  { id: 'fire', url: 'https://media.giphy.com/media/3o7TKFe8xHMzUoNqg0/giphy.gif' },
  { id: 'ok', url: 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif' },
  { id: 'think', url: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif' },
  { id: 'cool', url: 'https://media.giphy.com/media/3o7TKEP6LnN5NuNoES/giphy.gif' },
  { id: 'mindblown', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif' },
  { id: 'this', url: 'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif' },
  { id: 'party', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { id: 'love', url: 'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif' }
];

export type NodeShape = 'process' | 'decision' | 'circle' | 'parallelogram';