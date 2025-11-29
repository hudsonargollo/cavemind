import { Node, Edge } from '@xyflow/react';
import { NodeShape } from './constants';

export interface CaveNodeData extends Record<string, unknown> {
  label: string;
  details?: string;
  shape?: NodeShape;
}

export interface CaveTextData extends Record<string, unknown> {
  text: string;
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

export type AppNode = CaveNode | TextNode | ImageNode | StickerNode;

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