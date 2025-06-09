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
          ProductID: number | null
          ProductName: string | null
          ProductType: Database["public"]["Enums"]["ProductCategory"] | null
          SalesPrice: number | null
          uuid: string
        }
        Insert: {
          CostPrice?: number | null
          CreatedAt?: string
          image_url?: string | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          SalesPrice?: number | null
          uuid?: string
        }
        Update: {
          CostPrice?: number | null
          CreatedAt?: string
          image_url?: string | null
          ProductID?: number | null
          ProductName?: string | null
          ProductType?: Database["public"]["Enums"]["ProductCategory"] | null
          SalesPrice?: number | null
          uuid?: string
        }
        Relationships: []
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
