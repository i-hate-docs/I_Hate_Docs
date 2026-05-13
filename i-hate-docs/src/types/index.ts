export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan?: 'free' | 'pro' | 'teams';
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  original_name: string;
  size_bytes: number;
  mime_type: string;
  storage_path: string;
  page_count: number;
  thumbnail_url?: string;
  tags: string[];
  is_starred: boolean;
  is_deleted: boolean;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  document_id: string;
  user_id: string;
  page: number;
  type: 'highlight' | 'underline' | 'comment' | 'drawing' | 'text';
  color: string;
  content?: string;
  position: { x: number; y: number; width: number; height: number };
  created_at: string;
}

export interface AIMessage {
  id: string;
  document_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface Citation {
  text: string;
  page: number;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface AIChatRequest {
  documentId: string;
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  documentContent?: string;
}

export interface AIChatResponse {
  reply: string;
  citations?: Citation[];
  tokenUsage?: { prompt: number; completion: number };
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  members: string[];
  plan: 'free' | 'pro' | 'teams';
  created_at: string;
}

export interface PresentationSlide {
  id: string;
  document_id: string;
  user_id: string;
  slide_number: number;
  title: string;
  content: string;
  theme: string;
  notes?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  icon: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  capabilities: AgentCapability[];
  is_active: boolean;
}

export type ViewType =
  | 'workspace'
  | 'documents'
  | 'agents'
  | 'presentation'
  | 'redesign'
  | 'research'
  | 'multi-doc'
  | 'recent'
  | 'shared'
  | 'starred'
  | 'templates'
  | 'trash'
  | 'settings';

export interface AppState {
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  currentView: ViewType;
  activeDocumentId: string | null;
  zoomLevel: number;
}
