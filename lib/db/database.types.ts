export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "subscriber" | "admin";
export type DrawMode = "random" | "weighted";
export type DrawMatchTier = "match_5" | "match_4" | "match_3";
export type PayoutStatus = "pending" | "paid";
export type SubscriptionStatus = "pending" | "active" | "lapsed" | "cancelled";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      charities: {
        Row: {
          created_at: string;
          description: string;
          hero_image: string | null;
          id: string;
          is_featured: boolean;
          name: string;
          tags: string[];
          upcoming_event: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          hero_image?: string | null;
          id: string;
          is_featured?: boolean;
          name: string;
          tags?: string[];
          upcoming_event?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          hero_image?: string | null;
          id?: string;
          is_featured?: boolean;
          name?: string;
          tags?: string[];
          upcoming_event?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      draw_entries: {
        Row: {
          created_at: string;
          draw_id: string;
          id: string;
          numbers: number[];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          draw_id: string;
          id?: string;
          numbers: number[];
          user_id: string;
        };
        Update: {
          created_at?: string;
          draw_id?: string;
          id?: string;
          numbers?: number[];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draw_entries_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draw_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      draw_winners: {
        Row: {
          created_at: string;
          draw_id: string;
          id: string;
          match_tier: DrawMatchTier;
          payout_status: PayoutStatus;
          prize_amount_inr: number;
          proof_url: string | null;
          updated_at: string;
          user_id: string;
          verification_status: VerificationStatus;
        };
        Insert: {
          created_at?: string;
          draw_id: string;
          id?: string;
          match_tier: DrawMatchTier;
          payout_status?: PayoutStatus;
          prize_amount_inr: number;
          proof_url?: string | null;
          updated_at?: string;
          user_id: string;
          verification_status?: VerificationStatus;
        };
        Update: {
          created_at?: string;
          draw_id?: string;
          id?: string;
          match_tier?: DrawMatchTier;
          payout_status?: PayoutStatus;
          prize_amount_inr?: number;
          proof_url?: string | null;
          updated_at?: string;
          user_id?: string;
          verification_status?: VerificationStatus;
        };
        Relationships: [
          {
            foreignKeyName: "draw_winners_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draw_winners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      draws: {
        Row: {
          created_at: string;
          draw_mode: DrawMode;
          executed_at: string | null;
          id: string;
          jackpot_rollover_inr: number;
          month_key: string;
          prize_pool_total_inr: number;
          published: boolean;
          published_at: string | null;
          updated_at: string;
          winning_numbers: number[];
        };
        Insert: {
          created_at?: string;
          draw_mode: DrawMode;
          executed_at?: string | null;
          id?: string;
          jackpot_rollover_inr?: number;
          month_key: string;
          prize_pool_total_inr?: number;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string;
          winning_numbers: number[];
        };
        Update: {
          created_at?: string;
          draw_mode?: DrawMode;
          executed_at?: string | null;
          id?: string;
          jackpot_rollover_inr?: number;
          month_key?: string;
          prize_pool_total_inr?: number;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string;
          winning_numbers?: number[];
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          charity_percent: number;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          role: AppRole;
          selected_charity_id: string | null;
          updated_at: string;
        };
        Insert: {
          charity_percent?: number;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          role?: AppRole;
          selected_charity_id?: string | null;
          updated_at?: string;
        };
        Update: {
          charity_percent?: number;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          role?: AppRole;
          selected_charity_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_selected_charity_id_fkey";
            columns: ["selected_charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
        ];
      };
      score_entries: {
        Row: {
          created_at: string;
          id: string;
          played_on: string;
          stableford_score: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          played_on: string;
          stableford_score: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          played_on?: string;
          stableford_score?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "score_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          amount_inr: number;
          billing_cycle_months: number;
          charity_contribution_inr: number;
          created_at: string;
          gateway: string;
          gateway_reference: string | null;
          id: string;
          plan_code: string;
          renewal_date: string | null;
          started_at: string | null;
          status: SubscriptionStatus;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_inr: number;
          billing_cycle_months: number;
          charity_contribution_inr?: number;
          created_at?: string;
          gateway: string;
          gateway_reference?: string | null;
          id?: string;
          plan_code: string;
          renewal_date?: string | null;
          started_at?: string | null;
          status?: SubscriptionStatus;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_inr?: number;
          billing_cycle_months?: number;
          charity_contribution_inr?: number;
          created_at?: string;
          gateway?: string;
          gateway_reference?: string | null;
          id?: string;
          plan_code?: string;
          renewal_date?: string | null;
          started_at?: string | null;
          status?: SubscriptionStatus;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      draw_mode: DrawMode;
      draw_match_tier: DrawMatchTier;
      payout_status: PayoutStatus;
      subscription_status: SubscriptionStatus;
      verification_status: VerificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
