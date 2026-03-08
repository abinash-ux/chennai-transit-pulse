export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_routing_suggestions: {
        Row: {
          affected_buses: string[] | null
          created_at: string
          id: string
          implemented_at: string | null
          implemented_by: string | null
          is_implemented: boolean
          priority: string
          reason: string
          route_id: string | null
          suggested_action: string
          suggestion_type: string
        }
        Insert: {
          affected_buses?: string[] | null
          created_at?: string
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          is_implemented?: boolean
          priority: string
          reason: string
          route_id?: string | null
          suggested_action: string
          suggestion_type: string
        }
        Update: {
          affected_buses?: string[] | null
          created_at?: string
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          is_implemented?: boolean
          priority?: string
          reason?: string
          route_id?: string | null
          suggested_action?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_routing_suggestions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_location_history: {
        Row: {
          bus_id: string
          id: string
          latitude: number
          longitude: number
          recorded_at: string
        }
        Insert: {
          bus_id: string
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
        }
        Update: {
          bus_id?: string
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_location_history_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          bus_number: string
          conductor_id: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          current_occupancy: number
          driver_id: string | null
          id: string
          last_stop: string | null
          next_stop: string | null
          route_id: string | null
          status: string
          total_seats: number
          updated_at: string
        }
        Insert: {
          bus_number: string
          conductor_id?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          current_occupancy?: number
          driver_id?: string | null
          id?: string
          last_stop?: string | null
          next_stop?: string | null
          route_id?: string | null
          status?: string
          total_seats?: number
          updated_at?: string
        }
        Update: {
          bus_number?: string
          conductor_id?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          current_occupancy?: number
          driver_id?: string | null
          id?: string
          last_stop?: string | null
          next_stop?: string | null
          route_id?: string | null
          status?: string
          total_seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_response: string | null
          bus_id: string | null
          bus_number: string | null
          complaint_type: Database["public"]["Enums"]["complaint_type"]
          created_at: string
          description: string
          id: string
          reported_by: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Insert: {
          admin_response?: string | null
          bus_id?: string | null
          bus_number?: string | null
          complaint_type: Database["public"]["Enums"]["complaint_type"]
          created_at?: string
          description: string
          id?: string
          reported_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
        }
        Update: {
          admin_response?: string | null
          bus_id?: string | null
          bus_number?: string | null
          complaint_type?: Database["public"]["Enums"]["complaint_type"]
          created_at?: string
          description?: string
          id?: string
          reported_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
        }
        Relationships: [
          {
            foreignKeyName: "complaints_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      fines: {
        Row: {
          amount: number
          created_at: string
          deadline: string
          id: string
          issued_by: string
          notes: string | null
          paid_at: string | null
          passenger_id: string
          status: Database["public"]["Enums"]["fine_status"]
          violation_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          deadline: string
          id?: string
          issued_by: string
          notes?: string | null
          paid_at?: string | null
          passenger_id: string
          status?: Database["public"]["Enums"]["fine_status"]
          violation_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          deadline?: string
          id?: string
          issued_by?: string
          notes?: string | null
          paid_at?: string | null
          passenger_id?: string
          status?: Database["public"]["Enums"]["fine_status"]
          violation_type?: string
        }
        Relationships: []
      }
      monthly_passes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          pass_code: string
          pass_type: string
          price: number
          route_id: string | null
          user_id: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          pass_code: string
          pass_type: string
          price: number
          route_id?: string | null
          user_id: string
          valid_from: string
          valid_until: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          pass_code?: string
          pass_type?: string
          price?: number
          route_id?: string | null
          user_id?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_passes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reroute_requests: {
        Row: {
          admin_notes: string | null
          bus_id: string | null
          bus_number: string
          created_at: string
          description: string
          id: string
          proof_image_url: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          route_id: string | null
          status: Database["public"]["Enums"]["reroute_status"]
        }
        Insert: {
          admin_notes?: string | null
          bus_id?: string | null
          bus_number: string
          created_at?: string
          description: string
          id?: string
          proof_image_url?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["reroute_status"]
        }
        Update: {
          admin_notes?: string | null
          bus_id?: string | null
          bus_number?: string
          created_at?: string
          description?: string
          id?: string
          proof_image_url?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["reroute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reroute_requests_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reroute_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_records: {
        Row: {
          bus_id: string | null
          cash_revenue: number
          conductor_id: string | null
          created_at: string
          date: string
          digital_revenue: number
          id: string
          pass_count: number
          ticket_count: number
        }
        Insert: {
          bus_id?: string | null
          cash_revenue?: number
          conductor_id?: string | null
          created_at?: string
          date: string
          digital_revenue?: number
          id?: string
          pass_count?: number
          ticket_count?: number
        }
        Update: {
          bus_id?: string | null
          cash_revenue?: number
          conductor_id?: string | null
          created_at?: string
          date?: string
          digital_revenue?: number
          id?: string
          pass_count?: number
          ticket_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_records_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          base_fare: number
          created_at: string
          distance_km: number | null
          end_stop: string
          estimated_time_mins: number | null
          fare_per_km: number
          id: string
          is_active: boolean
          route_name: string
          route_number: string
          start_stop: string
          stops: Json
          updated_at: string
        }
        Insert: {
          base_fare?: number
          created_at?: string
          distance_km?: number | null
          end_stop: string
          estimated_time_mins?: number | null
          fare_per_km?: number
          id?: string
          is_active?: boolean
          route_name: string
          route_number: string
          start_stop: string
          stops?: Json
          updated_at?: string
        }
        Update: {
          base_fare?: number
          created_at?: string
          distance_km?: number | null
          end_stop?: string
          estimated_time_mins?: number | null
          fare_per_km?: number
          id?: string
          is_active?: boolean
          route_name?: string
          route_number?: string
          start_stop?: string
          stops?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          bus_id: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          reported_by: string
          reporter_role: Database["public"]["Enums"]["app_role"]
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          sos_type: Database["public"]["Enums"]["sos_type"]
          status: Database["public"]["Enums"]["sos_status"]
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          bus_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reported_by: string
          reporter_role: Database["public"]["Enums"]["app_role"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sos_type: Database["public"]["Enums"]["sos_type"]
          status?: Database["public"]["Enums"]["sos_status"]
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          bus_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reported_by?: string
          reporter_role?: Database["public"]["Enums"]["app_role"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sos_type?: Database["public"]["Enums"]["sos_type"]
          status?: Database["public"]["Enums"]["sos_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          stop_code: string | null
          stop_name: string
          zone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          stop_code?: string | null
          stop_name: string
          zone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          stop_code?: string | null
          stop_name?: string
          zone?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          bus_id: string | null
          expires_at: string
          fare: number
          from_stop: string
          id: string
          issued_at: string
          issued_by: string | null
          passenger_id: string
          payment_method: string
          qr_data: string | null
          route_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          to_stop: string
          used_at: string | null
        }
        Insert: {
          bus_id?: string | null
          expires_at: string
          fare: number
          from_stop: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          passenger_id: string
          payment_method: string
          qr_data?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          to_stop: string
          used_at?: string | null
        }
        Update: {
          bus_id?: string | null
          expires_at?: string
          fare?: number
          from_stop?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          passenger_id?: string
          payment_method?: string
          qr_data?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code?: string
          to_stop?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "passenger" | "driver" | "conductor" | "inspector" | "admin"
      complaint_status: "pending" | "under_review" | "resolved" | "rejected"
      complaint_type:
        | "bus_didnt_stop"
        | "rude_conductor"
        | "rude_driver"
        | "cleanliness"
        | "overcrowding"
        | "other"
      fine_status: "pending" | "paid" | "overdue"
      reroute_status: "pending" | "under_review" | "approved" | "rejected"
      sos_status: "active" | "acknowledged" | "resolved"
      sos_type: "mechanical" | "accident" | "security" | "medical" | "other"
      ticket_status: "active" | "used" | "expired" | "cancelled"
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
    Enums: {
      app_role: ["passenger", "driver", "conductor", "inspector", "admin"],
      complaint_status: ["pending", "under_review", "resolved", "rejected"],
      complaint_type: [
        "bus_didnt_stop",
        "rude_conductor",
        "rude_driver",
        "cleanliness",
        "overcrowding",
        "other",
      ],
      fine_status: ["pending", "paid", "overdue"],
      reroute_status: ["pending", "under_review", "approved", "rejected"],
      sos_status: ["active", "acknowledged", "resolved"],
      sos_type: ["mechanical", "accident", "security", "medical", "other"],
      ticket_status: ["active", "used", "expired", "cancelled"],
    },
  },
} as const
