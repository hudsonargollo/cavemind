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
    data: { label: 'Start Here', details: 'Welcome to the Cave.' },
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