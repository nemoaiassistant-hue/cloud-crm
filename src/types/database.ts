// Auto-generated database types for CloudCRM
// These match the Supabase schema

export type UserRole = "admin" | "staff" | "viewer";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          email: string;
          name: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          tags: string[];
          source: string | null;
          status: string;
          custom_fields: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          tags?: string[];
          source?: string | null;
          status?: string;
          custom_fields?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          tags?: string[];
          source?: string | null;
          status?: string;
          custom_fields?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipelines: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          pipeline_id: string;
          name: string;
          sort_order: number;
          color: string;
        };
        Insert: {
          id?: string;
          pipeline_id: string;
          name: string;
          sort_order?: number;
          color?: string;
        };
        Update: {
          id?: string;
          pipeline_id?: string;
          name?: string;
          sort_order?: number;
          color?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          tenant_id: string;
          contact_id: string;
          pipeline_id: string;
          stage_id: string;
          name: string;
          value: number | null;
          status: string;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contact_id: string;
          pipeline_id: string;
          stage_id: string;
          name: string;
          value?: number | null;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          contact_id?: string;
          pipeline_id?: string;
          stage_id?: string;
          name?: string;
          value?: number | null;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          tenant_id: string;
          contact_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          assigned_to: string | null;
          due_date: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contact_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          contact_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          tenant_id: string;
          contact_id: string;
          channel: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contact_id: string;
          channel?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          contact_id?: string;
          channel?: string;
          status?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          tenant_id: string;
          direction: string;
          channel: string;
          content: string;
          sent_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          tenant_id: string;
          direction: string;
          channel?: string;
          content: string;
          sent_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          tenant_id?: string;
          direction?: string;
          channel?: string;
          content?: string;
          sent_at?: string;
          read_at?: string | null;
        };
      };
      activity_log: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          contact_id: string | null;
          action: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          contact_id?: string | null;
          action: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          contact_id?: string | null;
          action?: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          key_hash: string;
          permissions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          key_hash: string;
          permissions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          key_hash?: string;
          permissions?: string[];
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
}

// Convenience types
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Pipeline = Database["public"]["Tables"]["pipelines"]["Row"];
export type PipelineStage = Database["public"]["Tables"]["pipeline_stages"]["Row"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"];
