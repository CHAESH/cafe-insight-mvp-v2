export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_cost_tips: {
        Row: {
          action_items: Json | null
          ai_model: string | null
          calculation_id: string
          comparison_to_average: number | null
          confidence_level: string
          cost_saving_tip: string
          created_at: string | null
          expected_monthly_saving: number | null
          expires_at: string | null
          generation_cost_usd: number | null
          id: string
          margin_analysis: string
          prompt_version: string | null
        }
        Insert: {
          action_items?: Json | null
          ai_model?: string | null
          calculation_id: string
          comparison_to_average?: number | null
          confidence_level: string
          cost_saving_tip: string
          created_at?: string | null
          expected_monthly_saving?: number | null
          expires_at?: string | null
          generation_cost_usd?: number | null
          id?: string
          margin_analysis: string
          prompt_version?: string | null
        }
        Update: {
          action_items?: Json | null
          ai_model?: string | null
          calculation_id?: string
          comparison_to_average?: number | null
          confidence_level?: string
          cost_saving_tip?: string
          created_at?: string | null
          expected_monthly_saving?: number | null
          expires_at?: string | null
          generation_cost_usd?: number | null
          id?: string
          margin_analysis?: string
          prompt_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_cost_tips_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: true
            referencedRelation: "calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tip_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_helpful: boolean
          tip_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_helpful: boolean
          tip_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          tip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tip_feedback_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "ai_cost_tips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tip_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          error_type: string | null
          from_cache: boolean | null
          id: string
          request_type: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_id: string
          user_subscription_status: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          error_type?: string | null
          from_cache?: boolean | null
          id?: string
          request_type?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id: string
          user_subscription_status?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          error_type?: string | null
          from_cache?: boolean | null
          id?: string
          request_type?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string
          user_subscription_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_ingredients: {
        Row: {
          calculation_id: string
          created_at: string | null
          custom_ingredient_name: string | null
          id: string
          ingredient_id: string | null
          price_unit: string
          quantity: number
          supplier: string | null
          total_cost: number
          unit: string
          unit_price: number
        }
        Insert: {
          calculation_id: string
          created_at?: string | null
          custom_ingredient_name?: string | null
          id?: string
          ingredient_id?: string | null
          price_unit: string
          quantity: number
          supplier?: string | null
          total_cost: number
          unit: string
          unit_price: number
        }
        Update: {
          calculation_id?: string
          created_at?: string | null
          custom_ingredient_name?: string | null
          id?: string
          ingredient_id?: string | null
          price_unit?: string
          quantity?: number
          supplier?: string | null
          total_cost?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "calculation_ingredients_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculation_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      calculations: {
        Row: {
          created_at: string | null
          has_ai_tips: boolean | null
          id: string
          is_template: boolean | null
          menu_category: string | null
          menu_complexity: string | null
          menu_name: string
          metadata: Json | null
          notes: string | null
          profit_margin: number
          season: string | null
          selling_price: number
          serving_size: string | null
          total_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_ai_tips?: boolean | null
          id?: string
          is_template?: boolean | null
          menu_category?: string | null
          menu_complexity?: string | null
          menu_name: string
          metadata?: Json | null
          notes?: string | null
          profit_margin: number
          season?: string | null
          selling_price: number
          serving_size?: string | null
          total_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_ai_tips?: boolean | null
          id?: string
          is_template?: boolean | null
          menu_category?: string | null
          menu_complexity?: string | null
          menu_name?: string
          metadata?: Json | null
          notes?: string | null
          profit_margin?: number
          season?: string | null
          selling_price?: number
          serving_size?: string | null
          total_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          barcode: string | null
          category: string
          created_at: string | null
          default_unit: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          barcode?: string | null
          category: string
          created_at?: string | null
          default_unit: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          barcode?: string | null
          category?: string
          created_at?: string | null
          default_unit?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          paid_at: string | null
          status: string
          subscription_id: string
          toss_order_id: string | null
          toss_payment_key: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          status: string
          subscription_id: string
          toss_order_id?: string | null
          toss_payment_key?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          subscription_id?: string
          toss_order_id?: string | null
          toss_payment_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_submissions: {
        Row: {
          id: string
          ingredient_id: string
          is_organic: boolean | null
          is_verified: boolean | null
          price: number
          purchase_quantity: number | null
          quality_grade: string | null
          region: string
          submitted_at: string | null
          supplier: string | null
          unit: string
          user_id: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          is_organic?: boolean | null
          is_verified?: boolean | null
          price: number
          purchase_quantity?: number | null
          quality_grade?: string | null
          region: string
          submitted_at?: string | null
          supplier?: string | null
          unit: string
          user_id: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          is_organic?: boolean | null
          is_verified?: boolean | null
          price?: number
          purchase_quantity?: number | null
          quality_grade?: string | null
          region?: string
          submitted_at?: string | null
          supplier?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_submissions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_monthly_limit: number | null
          billing_cycle: string
          created_at: string | null
          currency: string | null
          features: Json
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          ai_monthly_limit?: number | null
          billing_cycle: string
          created_at?: string | null
          currency?: string | null
          features: Json
          id: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          ai_monthly_limit?: number | null
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          payment_method_id: string | null
          plan_id: string
          status: string
          toss_billing_key: string | null
          toss_customer_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          payment_method_id?: string | null
          plan_id: string
          status: string
          toss_billing_key?: string | null
          toss_customer_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          payment_method_id?: string | null
          plan_id?: string
          status?: string
          toss_billing_key?: string | null
          toss_customer_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ai_calls_this_month: number | null
          ai_limit_reset_date: string | null
          business_type: string | null
          cafe_name: string
          created_at: string | null
          email: string
          id: string
          monthly_ai_limit: number | null
          onboarding_completed: boolean | null
          phone: string | null
          region: string
          subscription_ends_at: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_calls_this_month?: number | null
          ai_limit_reset_date?: string | null
          business_type?: string | null
          cafe_name: string
          created_at?: string | null
          email: string
          id?: string
          monthly_ai_limit?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          region: string
          subscription_ends_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_calls_this_month?: number | null
          ai_limit_reset_date?: string | null
          business_type?: string | null
          cafe_name?: string
          created_at?: string | null
          email?: string
          id?: string
          monthly_ai_limit?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          region?: string
          subscription_ends_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_season: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
