export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      jest_results: {
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
      OrderItems: {
        Row: {
          "Created at": string
          discount: number | null
          order_uuid: string | null
          price: number
          "Product ID": number | null
          product_uuid: string | null
          quantity: number
          unitprice: number | null
          uuid: string
        }
        Insert: {
          "Created at"?: string
          discount?: number | null
          order_uuid?: string | null
          price?: number
          "Product ID"?: number | null
          product_uuid?: string | null
          quantity?: number
          unitprice?: number | null
          uuid?: string
        }
        Update: {
          "Created at"?: string
          discount?: number | null
          order_uuid?: string | null
          price?: number
          "Product ID"?: number | null
          product_uuid?: string | null
          quantity?: number
          unitprice?: number | null
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
          "Order reference": string | null
          order_items_count: number | null
          order_number: number
          order_number_display: string | null
          order_total: number | null
          Origin: string | null
          status: Database["public"]["Enums"]["order_status"] | null
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
          "Order reference"?: string | null
          order_items_count?: number | null
          order_number?: never
          order_number_display?: string | null
          order_total?: number | null
          Origin?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
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
          "Order reference"?: string | null
          order_items_count?: number | null
          order_number?: never
          order_number_display?: string | null
          order_total?: number | null
          Origin?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          uuid?: string
        }
        Relationships: []
      }
      Products: {
        Row: {
          CostPrice: number | null
          CreatedAt: string
          image_url: string | null
          max_stock: number | null
          min_stock: number | null
          ProductID: number | null
          ProductName: string | null
          ProductType: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount: number | null
          SalesPrice: number | null
          uuid: string
        }
        Insert: {
          CostPrice?: number | null
          CreatedAt?: string
          image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount?: number | null
          SalesPrice?: number | null
          uuid?: string
        }
        Update: {
          CostPrice?: number | null
          CreatedAt?: string
          image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          reorder_amount?: number | null
          SalesPrice?: number | null
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
          movement_type: "incoming" | "outgoing" | "adjustment"
          product_id: string
          quantity: number // Can be negative for adjustments (signed integer)
          reason: string | null
        }
        Insert: {
          date?: string
          id?: string
          movement_type: "incoming" | "outgoing" | "adjustment"
          product_id: string
          quantity: number // Can be negative for adjustments (signed integer)
          reason?: string | null
        }
        Update: {
          date?: string
          id?: string
          movement_type?: "incoming" | "outgoing" | "adjustment"
          product_id?: string
          quantity?: number // Can be negative for adjustments (signed integer)
          reason?: string | null
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
          id: string
          last_login: string | null
          name: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          last_login?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      order_status: "Draft" | "Paid" | "Refunded" | "Cancelled"
      ProductCategory: "Beer" | "Wine" | "Bread" | "Soda" | "Champagne"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["Draft", "Paid", "Refunded", "Cancelled"],
      ProductCategory: ["Beer", "Wine", "Bread", "Soda", "Champagne"],
    },
  },
} as const

// Type definitions for improved Manual Stock Adjustment feature
export type StockMovementType = "incoming" | "outgoing" | "adjustment";

// Helper type for stock movements with product information (for joins)
export type StockMovementWithProduct = Database['public']['Tables']['stock_movements']['Row'] & {
  Products?: {
    ProductName: string | null;
    ProductID: number | null;
    uuid: string;
  } | null;
};

// Stock movement quantity rules:
// - 'incoming': always positive (stock received)
// - 'outgoing': always positive (stock shipped, stored as positive but calculated as negative)
// - 'adjustment': can be positive (increase) or negative (decrease) - SIGNED QUANTITY
export type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert'] & {
  // Ensures type safety for manual adjustments
  quantity: number; // For adjustments: positive = increase, negative = decrease
};
