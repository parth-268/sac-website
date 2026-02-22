export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      about_content: {
        Row: {
          description: string;
          id: string;
          mission: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
          vision: string | null;
        };
        Insert: {
          description: string;
          id?: string;
          mission?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          vision?: string | null;
        };
        Update: {
          description?: string;
          id?: string;
          mission?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          vision?: string | null;
        };
        Relationships: [];
      };
      about_stats: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          label: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          label: string;
          value: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          label?: string;
          value?: string;
        };
        Relationships: [];
      };
      academic_years: {
        Row: {
          created_at: string;
          end_date: string | null;
          id: string;
          is_active: boolean;
          start_date: string | null;
          updated_at: string;
          year: string;
        };
        Insert: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          is_active?: boolean;
          start_date?: string | null;
          updated_at?: string;
          year: string;
        };
        Update: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          is_active?: boolean;
          start_date?: string | null;
          updated_at?: string;
          year?: string;
        };
        Relationships: [];
      };
      club_members: {
        Row: {
          club_id: string;
          created_at: string;
          designation: string;
          display_order: number;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          club_id: string;
          created_at?: string;
          designation: string;
          display_order?: number;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          club_id?: string;
          created_at?: string;
          designation?: string;
          display_order?: number;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "club_members_club_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
        ];
      };
      clubs: {
        Row: {
          created_at: string;
          description: string;
          display_order: number;
          email: string | null;
          icon: string;
          id: string;
          image_url: string | null;
          instagram_url: string | null;
          is_active: boolean;
          junior_count: number;
          linkedin_url: string | null;
          logo_url: string | null;
          name: string;
          senior_count: number;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          display_order?: number;
          email?: string | null;
          icon?: string;
          id?: string;
          image_url?: string | null;
          instagram_url?: string | null;
          is_active?: boolean;
          junior_count?: number;
          linkedin_url?: string | null;
          logo_url?: string | null;
          name: string;
          senior_count?: number;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          display_order?: number;
          email?: string | null;
          icon?: string;
          id?: string;
          image_url?: string | null;
          instagram_url?: string | null;
          is_active?: boolean;
          junior_count?: number;
          linkedin_url?: string | null;
          logo_url?: string | null;
          name?: string;
          senior_count?: number;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      committee_members: {
        Row: {
          committee_id: string;
          created_at: string;
          designation: string;
          display_order: number;
          id: string;
          name: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          committee_id: string;
          created_at?: string;
          designation: string;
          display_order?: number;
          id?: string;
          name: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          committee_id?: string;
          created_at?: string;
          designation?: string;
          display_order?: number;
          id?: string;
          name?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_fkey";
            columns: ["committee_id"];
            isOneToOne: false;
            referencedRelation: "committees";
            referencedColumns: ["id"];
          },
        ];
      };
      committees: {
        Row: {
          created_at: string;
          description: string;
          display_order: number;
          email: string | null;
          icon: string;
          id: string;
          is_active: boolean;
          junior_count: number;
          logo_url: string | null;
          name: string;
          senior_count: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          display_order?: number;
          email?: string | null;
          icon?: string;
          id?: string;
          is_active?: boolean;
          junior_count?: number;
          logo_url?: string | null;
          name: string;
          senior_count?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          display_order?: number;
          email?: string | null;
          icon?: string;
          id?: string;
          is_active?: boolean;
          junior_count?: number;
          logo_url?: string | null;
          name?: string;
          senior_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_info: {
        Row: {
          address: string | null;
          email: string;
          id: string;
          map_url: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          email: string;
          id?: string;
          map_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          email?: string;
          id?: string;
          map_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          email: string;
          id: string;
          is_deleted: boolean;
          is_read: boolean;
          message: string;
          name: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          email: string;
          id?: string;
          is_deleted?: boolean;
          is_read?: boolean;
          message: string;
          name: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          id?: string;
          is_deleted?: boolean;
          is_read?: boolean;
          message?: string;
          name?: string;
          subject?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          academic_year: string | null;
          banner_image_url: string | null;
          conducted_by_id: string | null;
          conducted_by_name: string | null;
          conducted_by_type: string | null;
          created_at: string;
          description: string;
          end_time: string | null;
          event_date: string;
          id: string;
          is_archived: boolean;
          is_featured: boolean;
          is_published: boolean;
          map_link: string | null;
          short_description: string | null;
          start_time: string | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          venue: string | null;
        };
        Insert: {
          academic_year?: string | null;
          banner_image_url?: string | null;
          conducted_by_id?: string | null;
          conducted_by_name?: string | null;
          conducted_by_type?: string | null;
          created_at?: string;
          description: string;
          end_time?: string | null;
          event_date: string;
          id?: string;
          is_archived?: boolean;
          is_featured?: boolean;
          is_published?: boolean;
          map_link?: string | null;
          short_description?: string | null;
          start_time?: string | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          venue?: string | null;
        };
        Update: {
          academic_year?: string | null;
          banner_image_url?: string | null;
          conducted_by_id?: string | null;
          conducted_by_name?: string | null;
          conducted_by_type?: string | null;
          created_at?: string;
          description?: string;
          end_time?: string | null;
          event_date?: string;
          id?: string;
          is_archived?: boolean;
          is_featured?: boolean;
          is_published?: boolean;
          map_link?: string | null;
          short_description?: string | null;
          start_time?: string | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          venue?: string | null;
        };
        Relationships: [];
      };
      hero_banners: {
        Row: {
          created_at: string;
          cta_link: string | null;
          cta_text: string | null;
          display_order: number;
          id: string;
          image_url: string;
          is_active: boolean;
          subtitle: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cta_link?: string | null;
          cta_text?: string | null;
          display_order?: number;
          id?: string;
          image_url: string;
          is_active?: boolean;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          cta_link?: string | null;
          cta_text?: string | null;
          display_order?: number;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          designation: string | null;
          full_name: string;
          id: string;
          role: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          designation?: string | null;
          full_name: string;
          id?: string;
          role?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          designation?: string | null;
          full_name?: string;
          id?: string;
          role?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sac_reports: {
        Row: {
          academic_year: string;
          created_at: string;
          description: string | null;
          display_order: number;
          document_type: string;
          file_url: string;
          id: string;
          is_active: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          academic_year: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          document_type?: string;
          file_url: string;
          id?: string;
          is_active?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          academic_year?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          document_type?: string;
          file_url?: string;
          id?: string;
          is_active?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          display_order: number;
          id: string;
          setting_key: string;
          setting_label: string;
          setting_type: string;
          setting_value: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          display_order?: number;
          id?: string;
          setting_key: string;
          setting_label: string;
          setting_type?: string;
          setting_value: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          display_order?: number;
          id?: string;
          setting_key?: string;
          setting_label?: string;
          setting_type?: string;
          setting_value?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          batch_year: string | null;
          created_at: string;
          designation: string;
          display_order: number;
          email: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_alumni: boolean;
          linkedin_url: string | null;
          name: string;
          phone: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          batch_year?: string | null;
          created_at?: string;
          designation: string;
          display_order?: number;
          email?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_alumni?: boolean;
          linkedin_url?: string | null;
          name: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          batch_year?: string | null;
          created_at?: string;
          designation?: string;
          display_order?: number;
          email?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_alumni?: boolean;
          linkedin_url?: string | null;
          name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bootstrap_admin: { Args: never; Returns: boolean };
      create_admin_user: {
        Args: {
          target_email: string;
          target_member_id?: string;
          target_name: string;
          target_password: string;
        };
        Returns: undefined;
      };
      dearmor: { Args: { "": string }; Returns: string };
      delete_admin_by_email: {
        Args: { target_email: string };
        Returns: undefined;
      };
      gen_random_uuid: { Args: never; Returns: string };
      gen_salt: { Args: { "": string }; Returns: string };
      get_full_user_directory: {
        Args: never;
        Returns: Database["public"]["CompositeTypes"]["user_directory_item"][];
        SetofOptions: {
          from: "*";
          to: "user_directory_item";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      is_editor_or_admin: { Args: { _user_id: string }; Returns: boolean };
      pgp_armor_headers: {
        Args: { "": string };
        Returns: Record<string, unknown>[];
      };
      sync_club_member_counts: {
        Args: { club_id_input: string };
        Returns: undefined;
      };
      update_admin_password: {
        Args: { new_password: string; target_email: string };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "admin" | "editor";
    };
    CompositeTypes: {
      user_directory_item: {
        user_id: string | null;
        email: string | null;
        full_name: string | null;
        role: string | null;
        is_team_member: boolean | null;
        team_member_id: string | null;
        last_sign_in_at: string | null;
        created_at: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const;
