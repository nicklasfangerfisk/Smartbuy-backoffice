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
      order_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_data: Json
          event_type: string
          id: string
          order_uuid: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_data: Json
          event_type: string
          id?: string
          order_uuid: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          order_uuid?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_uuid_fkey"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "Orders"
            referencedColumns: ["uuid"]
          },
        ]
      }
      OrderItems: {
        Row: {
          "Created at": string
          discount: number | null
          order_uuid: string | null
          price: number
          price_currency: string
          price_exchrate: number
          "Product ID": number | null
          product_uuid: string | null
          quantity: number
          unitprice: number | null
          unitprice_currency: string
          unitprice_exchrate: number
          uuid: string
        }
        Insert: {
          "Created at"?: string
          discount?: number | null
          order_uuid?: string | null
          price?: number
          price_currency?: string
          price_exchrate?: number
          "Product ID"?: number | null
          product_uuid?: string | null
          quantity?: number
          unitprice?: number | null
          unitprice_currency?: string
          unitprice_exchrate?: number
          uuid?: string
        }
        Update: {
          "Created at"?: string
          discount?: number | null
          order_uuid?: string | null
          price?: number
          price_currency?: string
          price_exchrate?: number
          "Product ID"?: number | null
          product_uuid?: string | null
          quantity?: number
          unitprice?: number | null
          unitprice_currency?: string
          unitprice_exchrate?: number
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "Order items_Product ID_fkey"
            columns: ["Product ID"]
            isOneToOne: false
            referencedRelation: "Products"
            referencedColumns: ["ProductID"]
          },
          {
            foreignKeyName: "orderitems_order_uuid_fkey"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "Orders"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "orderitems_product_uuid_fkey"
            columns: ["product_uuid"]
            isOneToOne: false
            referencedRelation: "Products"
            referencedColumns: ["uuid"]
          },
        ]
      }
      Orders: {
        Row: {
          "Created at": string
          "Created by": string | null
          "Created by name": string | null
          customer_email: string | null
          customer_name: string | null
          date: string | null
          discount: number
          notes: string | null
          "Order reference": string | null
          order_items_count: number | null
          order_number: number
          order_number_display: string | null
          order_total: number | null
          order_total_currency: string
          order_total_exchrate: number
          Origin: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          storefront_id: string | null
          uuid: string
        }
        Insert: {
          "Created at"?: string
          "Created by"?: string | null
          "Created by name"?: string | null
          customer_email?: string | null
          customer_name?: string | null
          date?: string | null
          discount?: number
          notes?: string | null
          "Order reference"?: string | null
          order_items_count?: number | null
          order_number?: never
          order_number_display?: string | null
          order_total?: number | null
          order_total_currency?: string
          order_total_exchrate?: number
          Origin?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          storefront_id?: string | null
          uuid?: string
        }
        Update: {
          "Created at"?: string
          "Created by"?: string | null
          "Created by name"?: string | null
          customer_email?: string | null
          customer_name?: string | null
          date?: string | null
          discount?: number
          notes?: string | null
          "Order reference"?: string | null
          order_items_count?: number | null
          order_number?: never
          order_number_display?: string | null
          order_total?: number | null
          order_total_currency?: string
          order_total_exchrate?: number
          Origin?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          storefront_id?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "Orders_storefront_id_fkey"
            columns: ["storefront_id"]
            isOneToOne: false
            referencedRelation: "storefronts"
            referencedColumns: ["id"]
          },
        ]
      }
      Products: {
        Row: {
          CostPrice: number | null
          costprice_currency: string
          costprice_exchrate: number
          CreatedAt: string
          image_url: string | null
          max_stock: number | null
          min_stock: number | null
          ProductID: number | null
          ProductName: string | null
          ProductType: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount: number | null
          SalesPrice: number | null
          salesprice_currency: string
          salesprice_exchrate: number
          uuid: string
        }
        Insert: {
          CostPrice?: number | null
          costprice_currency?: string
          costprice_exchrate?: number
          CreatedAt?: string
          image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount?: number | null
          SalesPrice?: number | null
          salesprice_currency?: string
          salesprice_exchrate?: number
          uuid?: string
        }
        Update: {
          CostPrice?: number | null
          costprice_currency?: string
          costprice_exchrate?: number
          CreatedAt?: string
          image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount?: number | null
          SalesPrice?: number | null
          salesprice_currency?: string
          salesprice_exchrate?: number
          uuid?: string
        }
        Relationships: []
      }
      purchaseorderitems: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          total: number | null
          unit_price: number
          unit_price_currency: string
          unit_price_exchrate: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total?: number | null
          unit_price: number
          unit_price_currency?: string
          unit_price_exchrate?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total?: number | null
          unit_price?: number
          unit_price_currency?: string
          unit_price_exchrate?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchaseorderitems_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Products"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "purchaseorderitems_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "PurchaseOrders"
            referencedColumns: ["id"]
          },
        ]
      }
      PurchaseOrders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          supplier_id: string | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_date: string
          order_number: string
          status: string
          supplier_id?: string | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          supplier_id?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "PurchaseOrders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "Suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_campaigns: {
        Row: {
          CampaignNumber: string | null
          created_at: string
          created_by: string | null
          id: string
          message: string
          name: string
          recipients: string[] | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          CampaignNumber?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          name: string
          recipients?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          CampaignNumber?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          name?: string
          recipients?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          date: string
          id: string
          movement_type: string
          product_id: string
          quantity: number
          reason: string | null
          referenceuuid: string | null
        }
        Insert: {
          date?: string
          id?: string
          movement_type: string
          product_id: string
          quantity: number
          reason?: string | null
          referenceuuid?: string | null
        }
        Update: {
          date?: string
          id?: string
          movement_type?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          referenceuuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Products"
            referencedColumns: ["uuid"]
          },
        ]
      }
      storefronts: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      Suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          email: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      testresults: {
        Row: {
          failed_tests: number
          id: number
          passed_tests: number
          results: Json
          skipped_tests: number
          timestamp: string | null
          total_tests: number
        }
        Insert: {
          failed_tests: number
          id?: number
          passed_tests: number
          results: Json
          skipped_tests: number
          timestamp?: string | null
          total_tests: number
        }
        Update: {
          failed_tests?: number
          id?: number
          passed_tests?: number
          results?: Json
          skipped_tests?: number
          timestamp?: string | null
          total_tests?: number
        }
        Relationships: []
      }
      ticketactivities: {
        Row: {
          activity_type: string
          direction: string | null
          id: string
          message: string | null
          meta: Json | null
          sender_id: string | null
          sender_name: string | null
          ticket_id: string
          timestamp: string | null
        }
        Insert: {
          activity_type: string
          direction?: string | null
          id?: string
          message?: string | null
          meta?: Json | null
          sender_id?: string | null
          sender_name?: string | null
          ticket_id: string
          timestamp?: string | null
        }
        Update: {
          activity_type?: string
          direction?: string | null
          id?: string
          message?: string | null
          meta?: Json | null
          sender_id?: string | null
          sender_name?: string | null
          ticket_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticketactivities_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketactivities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string | null
          id: string
          requester_id: string | null
          requester_name: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requester_id?: string | null
          requester_name?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requester_id?: string | null
          requester_name?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          phone_number: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_order_event: {
        Args: {
          p_order_uuid: string
          p_event_type: string
          p_event_data: Json
          p_title: string
          p_description?: string
          p_created_by?: string
        }
        Returns: string
      }
      is_employee: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      track_material_movements: {
        Args: {
          movement_type: string
          product_id: string
          quantity: number
          reason?: string
        }
        Returns: undefined
      }
      update_order_rollups: {
        Args: { order_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      order_status:
        | "Draft"
        | "Paid"
        | "Refunded"
        | "Cancelled"
        | "Confirmed"
        | "Packed"
        | "Delivery"
        | "Complete"
        | "Returned"
      ProductCategory: "Beer" | "Wine" | "Bread" | "Soda" | "Champagne"
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
      order_status: [
        "Draft",
        "Paid",
        "Refunded",
        "Cancelled",
        "Confirmed",
        "Packed",
        "Delivery",
        "Complete",
        "Returned",
      ],
      ProductCategory: ["Beer", "Wine", "Bread", "Soda", "Champagne"],
    },
  },
} as const
