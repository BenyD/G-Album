export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          role_id: string | null;
          status: "pending" | "approved" | "suspended";
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id?: string | null;
          status?: "pending" | "approved" | "suspended";
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string | null;
          status?: "pending" | "approved" | "suspended";
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: "super_admin" | "admin" | "editor" | "visitor";
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: "super_admin" | "admin" | "editor" | "visitor";
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: "super_admin" | "admin" | "editor" | "visitor";
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_permission: {
        Args: {
          permission_name: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_status: "pending" | "approved" | "suspended";
      role_type: "super_admin" | "admin" | "editor" | "visitor";
    };
  };
};
