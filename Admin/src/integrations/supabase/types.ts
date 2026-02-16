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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_text: string
          city: string | null
          created_at: string
          district: string | null
          id: string
          is_default: boolean | null
          label: string
          pin: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_text: string
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          pin?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_text?: string
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          pin?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          admin_id: string | null
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          admin_id?: string | null
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          admin_id?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          admin_id: string
          assigned_at: string
          assigned_by: string | null
          id: string
          role_id: string
        }
        Insert: {
          admin_id: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id: string
        }
        Update: {
          admin_id?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_2fa_enabled: boolean | null
          last_login: string | null
          last_login_ip: string | null
          metadata: Json | null
          name: string
          permissions: Json | null
          phone: string
          profile_photo: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_2fa_enabled?: boolean | null
          last_login?: string | null
          last_login_ip?: string | null
          metadata?: Json | null
          name: string
          permissions?: Json | null
          phone: string
          profile_photo?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_2fa_enabled?: boolean | null
          last_login?: string | null
          last_login_ip?: string | null
          metadata?: Json | null
          name?: string
          permissions?: Json | null
          phone?: string
          profile_photo?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_metrics: {
        Row: {
          calculated_at: string
          dimensions: Json | null
          id: string
          metadata: Json | null
          metric_category: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          time_period: string
        }
        Insert: {
          calculated_at?: string
          dimensions?: Json | null
          id?: string
          metadata?: Json | null
          metric_category: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          time_period: string
        }
        Update: {
          calculated_at?: string
          dimensions?: Json | null
          id?: string
          metadata?: Json | null
          metric_category?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          time_period?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          action_label: string | null
          action_url: string | null
          announcement_type: string
          body: string
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          priority: string | null
          start_date: string
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          announcement_type: string
          body: string
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          priority?: string | null
          start_date: string
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          announcement_type?: string
          body?: string
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          priority?: string | null
          start_date?: string
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      app_versions: {
        Row: {
          app_type: string
          created_at: string
          download_url: string | null
          id: string
          is_active: boolean | null
          is_force_update: boolean | null
          min_supported_version: string | null
          platform: string
          release_notes: string | null
          released_at: string
          released_by: string | null
          version_code: number
          version_number: string
        }
        Insert: {
          app_type: string
          created_at?: string
          download_url?: string | null
          id?: string
          is_active?: boolean | null
          is_force_update?: boolean | null
          min_supported_version?: string | null
          platform: string
          release_notes?: string | null
          released_at?: string
          released_by?: string | null
          version_code: number
          version_number: string
        }
        Update: {
          app_type?: string
          created_at?: string
          download_url?: string | null
          id?: string
          is_active?: boolean | null
          is_force_update?: boolean | null
          min_supported_version?: string | null
          platform?: string
          release_notes?: string | null
          released_at?: string
          released_by?: string | null
          version_code?: number
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_versions_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      banned_entities: {
        Row: {
          ban_expires_at: string | null
          ban_type: string
          banned_by: string
          created_at: string
          entity_id: string
          entity_type: string
          evidence_urls: string[] | null
          id: string
          is_active: boolean | null
          lift_reason: string | null
          lifted_at: string | null
          lifted_by: string | null
          metadata: Json | null
          reason: string
          updated_at: string
        }
        Insert: {
          ban_expires_at?: string | null
          ban_type: string
          banned_by: string
          created_at?: string
          entity_id: string
          entity_type: string
          evidence_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          metadata?: Json | null
          reason: string
          updated_at?: string
        }
        Update: {
          ban_expires_at?: string | null
          ban_type?: string
          banned_by?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          evidence_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          metadata?: Json | null
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_entities_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banned_entities_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          booking_status: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category_id: string
          category_name: string
          completed_at: string | null
          created_at: string
          duration_hours: number
          id: string
          job_address_id: string | null
          job_details: Json
          notes: string | null
          payment_status: string
          price: number
          service_date: string
          start_time: string
          started_at: string | null
          tip: number | null
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          booking_status?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id: string
          category_name: string
          completed_at?: string | null
          created_at?: string
          duration_hours: number
          id?: string
          job_address_id?: string | null
          job_details?: Json
          notes?: string | null
          payment_status?: string
          price: number
          service_date: string
          start_time: string
          started_at?: string | null
          tip?: number | null
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          booking_status?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string
          category_name?: string
          completed_at?: string | null
          created_at?: string
          duration_hours?: number
          id?: string
          job_address_id?: string | null
          job_details?: Json
          notes?: string | null
          payment_status?: string
          price?: number
          service_date?: string
          start_time?: string
          started_at?: string | null
          tip?: number | null
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_job_address_id_fkey"
            columns: ["job_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          base_rate: number | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          base_rate?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          base_rate?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_fields: {
        Row: {
          category_id: string
          config: Json | null
          created_at: string
          display_order: number | null
          field_label: string
          field_type: string
          id: string
          is_required: boolean | null
        }
        Insert: {
          category_id: string
          config?: Json | null
          created_at?: string
          display_order?: number | null
          field_label: string
          field_type: string
          id?: string
          is_required?: boolean | null
        }
        Update: {
          category_id?: string
          config?: Json | null
          created_at?: string
          display_order?: number | null
          field_label?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "category_fields_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_message_at: string | null
          user_id: string
          worker_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          user_id: string
          worker_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_statistics: {
        Row: {
          active_users: number | null
          active_workers: number | null
          average_booking_value: number | null
          average_rating: number | null
          cancelled_bookings: number | null
          completed_bookings: number | null
          created_at: string
          date: string
          id: string
          metadata: Json | null
          new_users: number | null
          new_workers: number | null
          pending_bookings: number | null
          platform_revenue: number | null
          total_bookings: number | null
          total_revenue: number | null
          total_reviews: number | null
          updated_at: string
          worker_earnings: number | null
        }
        Insert: {
          active_users?: number | null
          active_workers?: number | null
          average_booking_value?: number | null
          average_rating?: number | null
          cancelled_bookings?: number | null
          completed_bookings?: number | null
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          new_users?: number | null
          new_workers?: number | null
          pending_bookings?: number | null
          platform_revenue?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          updated_at?: string
          worker_earnings?: number | null
        }
        Update: {
          active_users?: number | null
          active_workers?: number | null
          average_booking_value?: number | null
          average_rating?: number | null
          cancelled_bookings?: number | null
          completed_bookings?: number | null
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          new_users?: number | null
          new_workers?: number | null
          pending_bookings?: number | null
          platform_revenue?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          updated_at?: string
          worker_earnings?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_metadata: Json | null
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message_text: string | null
          read_at: string | null
          receiver_id: string
          receiver_type: string
          sender_id: string
          sender_type: string
          thread_id: string
        }
        Insert: {
          attachment_metadata?: Json | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string | null
          read_at?: string | null
          receiver_id: string
          receiver_type: string
          sender_id: string
          sender_type: string
          thread_id: string
        }
        Update: {
          attachment_metadata?: Json | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string | null
          read_at?: string | null
          receiver_id?: string
          receiver_type?: string
          sender_id?: string
          sender_type?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_disputes: {
        Row: {
          admin_notes: string | null
          amount_disputed: number
          assigned_to: string | null
          booking_id: string
          created_at: string
          description: string
          dispute_type: string
          evidence_urls: string[] | null
          id: string
          metadata: Json | null
          payment_id: string
          raised_by: string
          raised_by_type: string
          refund_amount: number | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_disputed: number
          assigned_to?: string | null
          booking_id: string
          created_at?: string
          description: string
          dispute_type: string
          evidence_urls?: string[] | null
          id?: string
          metadata?: Json | null
          payment_id: string
          raised_by: string
          raised_by_type: string
          refund_amount?: number | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_disputed?: number
          assigned_to?: string | null
          booking_id?: string
          created_at?: string
          description?: string
          dispute_type?: string
          evidence_urls?: string[] | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          raised_by?: string
          raised_by_type?: string
          refund_amount?: number | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_disputes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          metadata: Json | null
          payment_method: string
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          status: string
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          payment_method: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fees: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          effective_from: string
          effective_until: string | null
          fee_type: string
          flat_fee: number | null
          id: string
          is_active: boolean | null
          max_fee: number | null
          min_fee: number | null
          percentage_fee: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from: string
          effective_until?: string | null
          fee_type: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          percentage_fee?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          percentage_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_fees_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_fees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_featured: boolean | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_usage: {
        Row: {
          booking_id: string
          created_at: string
          discount_amount: number
          id: string
          promo_code: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          discount_amount: number
          id?: string
          promo_code: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          promo_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_fkey"
            columns: ["promo_code"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_categories: string[] | null
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          is_active: boolean | null
          max_discount_amount: number | null
          max_usage: number | null
          max_usage_per_user: number | null
          metadata: Json | null
          min_booking_amount: number | null
          updated_at: string
          usage_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          code: string
          created_at?: string
          description: string
          discount_type: string
          discount_value: number
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_usage?: number | null
          max_usage_per_user?: number | null
          metadata?: Json | null
          min_booking_amount?: number | null
          updated_at?: string
          usage_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_usage?: number | null
          max_usage_per_user?: number | null
          metadata?: Json | null
          min_booking_amount?: number | null
          updated_at?: string
          usage_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          booking_id: string | null
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          metadata: Json | null
          priority: string | null
          report_type: string
          reported_id: string
          reported_type: string
          reporter_id: string
          reporter_type: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          report_type: string
          reported_id: string
          reported_type: string
          reporter_id: string
          reporter_type: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          report_type?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          reporter_type?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_notes: string | null
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          is_flagged: boolean | null
          is_public: boolean | null
          rating: number
          updated_at: string
          user_id: string
          worker_id: string
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_public?: boolean | null
          rating: number
          updated_at?: string
          user_id: string
          worker_id: string
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_public?: boolean | null
          rating?: number
          updated_at?: string
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          permissions: Json
          role_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          permissions?: Json
          role_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          permissions?: Json
          role_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          is_editable: boolean | null
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          is_editable?: boolean | null
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          is_editable?: boolean | null
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_logs: {
        Row: {
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          event_category: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          event_category: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          event_category?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      user_device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_used: string | null
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          last_active: string | null
          metadata: Json | null
          name: string
          phone: string
          profile_photo: string | null
          public_bio: string | null
          status: string
          updated_at: string
          wallet_balance: number | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_active?: string | null
          metadata?: Json | null
          name: string
          phone: string
          profile_photo?: string | null
          public_bio?: string | null
          status?: string
          updated_at?: string
          wallet_balance?: number | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_active?: string | null
          metadata?: Json | null
          name?: string
          phone?: string
          profile_photo?: string | null
          public_bio?: string | null
          status?: string
          updated_at?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          admin_notes: string | null
          back_image_url: string | null
          created_at: string
          document_number: string | null
          document_type: string
          document_url: string
          expiry_date: string | null
          front_image_url: string | null
          id: string
          metadata: Json | null
          rejection_reason: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          admin_notes?: string | null
          back_image_url?: string | null
          created_at?: string
          document_number?: string | null
          document_type: string
          document_url: string
          expiry_date?: string | null
          front_image_url?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          admin_notes?: string | null
          back_image_url?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          front_image_url?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          documents_submitted: Json
          id: string
          metadata: Json | null
          rejection_reason: string | null
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          documents_submitted?: Json
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          request_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          documents_submitted?: Json
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_availability_exceptions: {
        Row: {
          created_at: string
          end_time: string | null
          exception_date: string
          id: string
          is_available: boolean
          reason: string | null
          start_time: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          exception_date: string
          id?: string
          is_available: boolean
          reason?: string | null
          start_time?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          exception_date?: string
          id?: string
          is_available?: boolean
          reason?: string | null
          start_time?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_availability_exceptions_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          branch_name: string | null
          created_at: string
          id: string
          ifsc_code: string
          is_primary: boolean | null
          is_verified: boolean | null
          updated_at: string
          verified_at: string | null
          worker_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          branch_name?: string | null
          created_at?: string
          id?: string
          ifsc_code: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          verified_at?: string | null
          worker_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          branch_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          verified_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_bank_accounts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          reason: string | null
          worker_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
          worker_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_blocked_users_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          rate_override: number | null
          worker_id: string
          years_experience: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          rate_override?: number | null
          worker_id: string
          years_experience?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          rate_override?: number | null
          worker_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_categories_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_certifications: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          certification_name: string
          created_at: string
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          issuing_organization: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_organization: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_organization?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_certifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_used: string | null
          platform: string
          token: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          platform: string
          token: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          platform?: string
          token?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_device_tokens_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_earnings: {
        Row: {
          booking_id: string
          created_at: string
          gross_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          payment_id: string | null
          payout_date: string | null
          payout_reference: string | null
          payout_status: string
          platform_fee: number | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          gross_amount: number
          id?: string
          metadata?: Json | null
          net_amount: number
          payment_id?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string
          platform_fee?: number | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          gross_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          payment_id?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string
          platform_fee?: number | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_earnings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_earnings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          worker_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          worker_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_notifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_payout_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account_id: string
          created_at: string
          id: string
          metadata: Json | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          transaction_reference: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_payout_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "worker_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_payout_requests_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_working_areas: {
        Row: {
          area_name: string
          city: string
          created_at: string
          district: string | null
          id: string
          is_primary: boolean | null
          pin_codes: string[] | null
          radius_km: number | null
          worker_id: string
        }
        Insert: {
          area_name: string
          city: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean | null
          pin_codes?: string[] | null
          radius_km?: number | null
          worker_id: string
        }
        Update: {
          area_name?: string
          city?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean | null
          pin_codes?: string[] | null
          radius_km?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_working_areas_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          auth_user_id: string | null
          average_rating: number | null
          bio: string | null
          created_at: string
          day_rate: number | null
          email: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_active: string | null
          metadata: Json | null
          name: string
          phone: string
          profile_photo: string | null
          rating_count: number | null
          skills: string[] | null
          status: string
          total_jobs_completed: number | null
          updated_at: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          day_rate?: number | null
          email?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          metadata?: Json | null
          name: string
          phone: string
          profile_photo?: string | null
          rating_count?: number | null
          skills?: string[] | null
          status?: string
          total_jobs_completed?: number | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          day_rate?: number | null
          email?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          metadata?: Json | null
          name?: string
          phone?: string
          profile_photo?: string | null
          rating_count?: number | null
          skills?: string[] | null
          status?: string
          total_jobs_completed?: number | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
