export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro' | 'teams'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'teams'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'teams'
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          original_name: string
          size_bytes: number
          mime_type: string
          storage_path: string
          page_count: number
          thumbnail_url: string | null
          tags: string[]
          is_starred: boolean
          is_deleted: boolean
          workspace_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          original_name: string
          size_bytes: number
          mime_type: string
          storage_path: string
          page_count?: number
          thumbnail_url?: string | null
          tags?: string[]
          is_starred?: boolean
          is_deleted?: boolean
          workspace_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          tags?: string[]
          is_starred?: boolean
          is_deleted?: boolean
          thumbnail_url?: string | null
          workspace_id?: string | null
          updated_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          document_id: string
          user_id: string
          page: number
          type: string
          color: string
          content: string | null
          position: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          page: number
          type: string
          color: string
          content?: string | null
          position: Json
          created_at?: string
        }
        Update: {
          type?: string
          color?: string
          content?: string | null
          position?: Json
        }
      }
      ai_messages: {
        Row: {
          id: string
          document_id: string
          user_id: string
          role: string
          content: string
          citations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          role: string
          content: string
          citations?: Json | null
          created_at?: string
        }
        Update: {
          content?: string
          citations?: Json | null
        }
      }
      presentations: {
        Row: {
          id: string
          document_id: string
          user_id: string
          slide_number: number
          title: string
          content: string
          theme: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          slide_number: number
          title: string
          content: string
          theme?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          content?: string
          theme?: string
          notes?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
