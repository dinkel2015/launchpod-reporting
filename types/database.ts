// Hand-authored to match supabase/migrations/*.sql. Keep in sync manually —
// there is no live project yet to run `supabase gen types` against.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          podcast_name: string;
          internal_slug: string;
          private_access_token: string;
          logo_url: string | null;
          brand_settings: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          podcast_name: string;
          internal_slug: string;
          private_access_token?: string;
          logo_url?: string | null;
          brand_settings?: Json;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          reporting_period_start: string;
          reporting_period_end: string;
          report_month: string;
          expected_episode_frequency: number | null;
          previous_report_id: string | null;
          status:
            | "draft"
            | "processing"
            | "needs_review"
            | "ready_to_publish"
            | "published"
            | "archived";
          human_context: string | null;
          report_content_json: Json;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          reporting_period_start: string;
          reporting_period_end: string;
          report_month: string;
          expected_episode_frequency?: number | null;
          previous_report_id?: string | null;
          status?: Database["public"]["Tables"]["reports"]["Row"]["status"];
          human_context?: string | null;
          report_content_json?: Json;
          published_at?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      report_uploads: {
        Row: {
          id: string;
          report_id: string;
          source_type: "spotify" | "apple" | "podseo" | "hosting";
          file_name: string;
          file_type: string;
          file_size_bytes: number;
          storage_path: string;
          snapshot_date: string | null;
          parsing_status: "pending" | "processing" | "parsed" | "manual_only" | "failed";
          parsing_errors: string | null;
          validation_status: "unverified" | "verified" | "conflict";
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          source_type: "spotify" | "apple" | "podseo" | "hosting";
          file_name: string;
          file_type: string;
          file_size_bytes?: number;
          storage_path: string;
          snapshot_date?: string | null;
          parsing_status?: Database["public"]["Tables"]["report_uploads"]["Row"]["parsing_status"];
          parsing_errors?: string | null;
          validation_status?: Database["public"]["Tables"]["report_uploads"]["Row"]["validation_status"];
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["report_uploads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "report_uploads_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_metrics: {
        Row: {
          id: string;
          report_id: string;
          upload_id: string | null;
          source_type: "spotify" | "apple" | "podseo" | "hosting";
          original_label: string;
          metric_key: string;
          display_label: string;
          value: string | null;
          previous_value: number | null;
          calculated_delta: number | null;
          unit: "count" | "percent" | "minutes" | "hours" | "rank" | "score";
          period_start: string | null;
          period_end: string | null;
          snapshot_date: string | null;
          authority_level:
            | "authoritative_csv"
            | "platform_export"
            | "verified_screenshot"
            | "manual_verified";
          verification_status: "unverified" | "verified" | "conflict" | "excluded";
          source_page: number | null;
          source_reference: string | null;
          manually_adjusted: boolean;
          included_in_report: boolean;
          notes: string | null;
          entered_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          upload_id?: string | null;
          source_type: "spotify" | "apple" | "podseo" | "hosting";
          original_label: string;
          metric_key: string;
          display_label: string;
          value?: string | null;
          previous_value?: number | null;
          calculated_delta?: number | null;
          unit?: Database["public"]["Tables"]["report_metrics"]["Row"]["unit"];
          period_start?: string | null;
          period_end?: string | null;
          snapshot_date?: string | null;
          authority_level?: Database["public"]["Tables"]["report_metrics"]["Row"]["authority_level"];
          verification_status?: Database["public"]["Tables"]["report_metrics"]["Row"]["verification_status"];
          source_page?: number | null;
          source_reference?: string | null;
          manually_adjusted?: boolean;
          included_in_report?: boolean;
          notes?: string | null;
          entered_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["report_metrics"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "report_metrics_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_observations: {
        Row: {
          id: string;
          report_id: string;
          source_type: string | null;
          metric_key: string | null;
          rule_id: string;
          generated_text: string;
          edited_text: string | null;
          included_in_report: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          source_type?: string | null;
          metric_key?: string | null;
          rule_id: string;
          generated_text: string;
          edited_text?: string | null;
          included_in_report?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["report_observations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "report_observations_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_sections: {
        Row: {
          id: string;
          report_id: string;
          section_type: string;
          enabled: boolean;
          display_order: number;
          content_json: Json;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          section_type: string;
          enabled?: boolean;
          display_order?: number;
          content_json?: Json;
          internal_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["report_sections"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "report_sections_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendations: {
        Row: {
          id: string;
          report_id: string;
          text: string;
          owner: "client" | "lpm" | "shared";
          included: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          text: string;
          owner?: "client" | "lpm" | "shared";
          included?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["recommendations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "recommendations_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_access_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      assert_downloads_reconcile: {
        Args: { p_report_id: string };
        Returns: boolean;
      };
    };
  };
};
