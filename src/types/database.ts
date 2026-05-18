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
      chatbot_configs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          welcome_message: string;
          placeholder: string;
          primary_color: string;
          position: string;
          avatar_url: string | null;
          quick_replies: string[];
          collect_email: boolean;
          collect_name: boolean;
          offline_message: string | null;
          business_hours: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          welcome_message?: string;
          placeholder?: string;
          primary_color?: string;
          position?: string;
          avatar_url?: string | null;
          quick_replies?: string[];
          collect_email?: boolean;
          collect_name?: boolean;
          offline_message?: string | null;
          business_hours?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          welcome_message?: string;
          placeholder?: string;
          primary_color?: string;
          position?: string;
          avatar_url?: string | null;
          quick_replies?: string[];
          collect_email?: boolean;
          collect_name?: boolean;
          offline_message?: string | null;
          business_hours?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          chatbot_id: string;
          contact_id: string | null;
          visitor_name: string | null;
          visitor_email: string | null;
          visitor_ip: string | null;
          source: string | null;
          status: string;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          chatbot_id: string;
          contact_id?: string | null;
          visitor_name?: string | null;
          visitor_email?: string | null;
          visitor_ip?: string | null;
          source?: string | null;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          chatbot_id?: string;
          contact_id?: string | null;
          visitor_name?: string | null;
          visitor_email?: string | null;
          visitor_ip?: string | null;
          source?: string | null;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          tenant_id: string;
          sender_type: string;
          sender_id: string | null;
          content: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          tenant_id: string;
          sender_type: string;
          sender_id?: string | null;
          content: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          tenant_id?: string;
          sender_type?: string;
          sender_id?: string | null;
          content?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      workflows: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          trigger_type: string;
          trigger_config: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          trigger_type: string;
          trigger_config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          trigger_type?: string;
          trigger_config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      workflow_steps: {
        Row: {
          id: string;
          workflow_id: string;
          step_order: number;
          action_type: string;
          action_config: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          step_order?: number;
          action_type: string;
          action_config?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          step_order?: number;
          action_type?: string;
          action_config?: Record<string, unknown>;
          created_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          fields: unknown[];
          submit_button_text: string;
          success_message: string;
          redirect_url: string | null;
          is_active: boolean;
          style_config: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          fields?: unknown[];
          submit_button_text?: string;
          success_message?: string;
          redirect_url?: string | null;
          is_active?: boolean;
          style_config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          fields?: unknown[];
          submit_button_text?: string;
          success_message?: string;
          redirect_url?: string | null;
          is_active?: boolean;
          style_config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_submissions: {
        Row: {
          id: string;
          tenant_id: string;
          form_id: string;
          contact_id: string | null;
          data: Record<string, unknown>;
          source: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          form_id: string;
          contact_id?: string | null;
          data: Record<string, unknown>;
          source?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          form_id?: string;
          contact_id?: string | null;
          data?: Record<string, unknown>;
          source?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      appointment_types: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          color: string;
          is_active: boolean;
          buffer_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          color?: string;
          is_active?: boolean;
          buffer_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          color?: string;
          is_active?: boolean;
          buffer_minutes?: number;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          appointment_type_id: string;
          contact_id: string | null;
          assigned_to: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          status: string;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          appointment_type_id: string;
          contact_id?: string | null;
          assigned_to: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          status?: string;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          appointment_type_id?: string;
          contact_id?: string | null;
          assigned_to?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          status?: string;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_rules: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
export type ChatbotConfig = Database["public"]["Tables"]["chatbot_configs"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type Workflow = Database["public"]["Tables"]["workflows"]["Row"];
export type WorkflowStep = Database["public"]["Tables"]["workflow_steps"]["Row"];
export type Form = Database["public"]["Tables"]["forms"]["Row"];
export type FormSubmission = Database["public"]["Tables"]["form_submissions"]["Row"];
export type AppointmentType = Database["public"]["Tables"]["appointment_types"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AvailabilityRule = Database["public"]["Tables"]["availability_rules"]["Row"];
