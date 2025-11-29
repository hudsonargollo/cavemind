import { Node, Edge } from '@xyflow/react';
import { NodeShape } from './constants';

export interface CaveNodeData extends Record<string, unknown> {
  label: string;
  details?: string;
  shape?: NodeShape;
}

// Editable Flowchart Node
export interface EditableFlowchartNodeData extends CaveNodeData {
  isEditing: boolean;
  backgroundColor?: string;
  strokeColor?: string;
  textColor?: string;
}

export interface CaveTextData extends Record<string, unknown> {
  text: string;
}

// Resizable Text Node
export interface ResizableTextNodeData extends CaveTextData {
  title?: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  rotation?: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface CaveImageData extends Record<string, unknown> {
  src: string;
  alt?: string;
}

export interface CaveStickerData extends Record<string, unknown> {
  src: string;
}

export type CaveNode = Node<CaveNodeData>;
export type TextNode = Node<CaveTextData>;
export type ImageNode = Node<CaveImageData>;
export type StickerNode = Node<CaveStickerData>;
export type PostItNode = Node<PostItNodeData>;

export type AppNode = CaveNode | TextNode | ImageNode | StickerNode | PostItNode;

export interface GeminiFlowResponse {
  nodes: {
    id: string;
    label: string;
    details?: string;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
  }[];
}

export enum AppMode {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  GENERATING = 'GENERATING',
}

// --- SaaS / Auth Types ---

export type PlanTier = 'free' | 'basic' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  planTier: PlanTier;
  authProvider: 'google' | 'apple';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Arrow Connector
export interface ArrowConnectorData {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  style: 'solid' | 'dashed' | 'dotted';
  headStyle: 'triangle' | 'circle' | 'diamond' | 'none';
  color: string;
  strokeWidth: number;
}

// Post-It Note
export interface PostItNodeData extends Record<string, unknown> {
  text: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
  rotation: number;
  hasShadow: boolean;
  width: number;
  height: number;
}

// Color Picker State
export interface ColorPickerState {
  isOpen: boolean;
  position: { x: number; y: number };
  currentColor: string;
  targetElements: string[]; // IDs of selected elements
  targetProperty: 'background' | 'stroke' | 'text';
  recentColors: string[];
}

// Sticker Database Schema
export interface Sticker {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StickerCollectionResponse {
  stickers: Sticker[];
  total: number;
  page: number;
  pageSize: number;
}

// User Preferences Schema
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  updatedAt: Date;
}

// Sketch Processing Request/Response
export interface SketchProcessingRequest {
  imageData: string; // base64 encoded
  format: 'png' | 'jpeg' | 'webp';
  userId?: string;
}

export interface SketchProcessingResponse {
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
