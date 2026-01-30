export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      about_content: {
        Row: {
          id: string;
          title: string;
          description: string;
          mission: string | null;
          vision: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          title?: string;
          description: string;
          mission?: string | null;
          vision?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          mission?: string | null;
          vision?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      about_stats: {
        Row: {
          id: string;
          label: string;
          value: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          value: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          value?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          image_url: string | null;
          head_name: string | null;
          head_email: string | null;
          head_phone: string | null;
          instagram_url: string | null;
          linkedin_url: string | null;
          member_count: number | null;
          activities: string[] | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string;
          image_url?: string | null;
          head_name?: string | null;
          head_email?: string | null;
          head_phone?: string | null;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          member_count?: number | null;
          activities?: string[] | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          image_url?: string | null;
          head_name?: string | null;
          head_email?: string | null;
          head_phone?: string | null;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          member_count?: number | null;
          activities?: string[] | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      committees: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          email: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string;
          email?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          email?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      committee_members: {
        Row: {
          id: string;
          committee_id: string;
          name: string;
          designation: string;
          phone: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          committee_id: string;
          name: string;
          designation: string;
          phone?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          committee_id?: string;
          name?: string;
          designation?: string;
          phone?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_info: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          address: string | null;
          map_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          map_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          map_url?: string | null;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          event_time: string | null;
          location: string | null;
          image_url: string | null;
          tags: string[] | null;
          is_upcoming: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_date: string;
          event_time?: string | null;
          location?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          is_upcoming?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          event_time?: string | null;
          location?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          is_upcoming?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hero_banners: {
        Row: {
          id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string;
          cta_text: string | null;
          cta_link: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url: string;
          cta_text?: string | null;
          cta_link?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string;
          cta_text?: string | null;
          cta_link?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          designation: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          designation?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          designation?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sac_reports: {
        Row: {
          id: string;
          title: string;
          academic_year: string;
          file_url: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          academic_year: string;
          file_url: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          academic_year?: string;
          file_url?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string;
          setting_label: string;
          setting_type: string;
          display_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: string;
          setting_label: string;
          setting_type?: string;
          display_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: string;
          setting_label?: string;
          setting_type?: string;
          display_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          designation: string;
          image_url: string | null;
          linkedin_url: string | null;
          email: string | null;
          phone: string | null;
          batch_year: string | null;
          is_alumni: boolean;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          designation: string;
          image_url?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          phone?: string | null;
          batch_year?: string | null;
          is_alumni?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          designation?: string;
          image_url?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          phone?: string | null;
          batch_year?: string | null;
          is_alumni?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "editor";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin" | "editor";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "editor";
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_editor_or_admin: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "editor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
