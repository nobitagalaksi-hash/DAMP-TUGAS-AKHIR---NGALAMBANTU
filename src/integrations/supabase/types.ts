export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          post_id: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          post_id?: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          post_id?: string | null;
          recipient_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          related_post_id: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          related_post_id?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          related_post_id?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_related_post_id_fkey";
            columns: ["related_post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_offers: {
        Row: {
          availability: string | null;
          created_at: string;
          helper_id: string;
          id: string;
          message: string | null;
          offered_amount: number | null;
          post_id: string;
          status: Database["public"]["Enums"]["offer_status"];
          updated_at: string;
        };
        Insert: {
          availability?: string | null;
          created_at?: string;
          helper_id: string;
          id?: string;
          message?: string | null;
          offered_amount?: number | null;
          post_id: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Update: {
          availability?: string | null;
          created_at?: string;
          helper_id?: string;
          id?: string;
          message?: string | null;
          offered_amount?: number | null;
          post_id?: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_offers_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          alamat: string | null;
          category: Database["public"]["Enums"]["post_category"];
          created_at: string;
          description: string | null;
          flexibility: Database["public"]["Enums"]["flexibility"];
          id: string;
          imbalan_amount: number;
          imbalan_type: Database["public"]["Enums"]["imbalan_type"];
          is_urgent: boolean;
          jumlah_orang: number;
          kecamatan: Database["public"]["Enums"]["kecamatan"] | null;
          needed_date: string | null;
          needed_time: string | null;
          paid_at: string | null;
          payment_method: string | null;
          payment_proof_url: string | null;
          photo_url: string | null;
          status: Database["public"]["Enums"]["post_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          alamat?: string | null;
          category: Database["public"]["Enums"]["post_category"];
          created_at?: string;
          description?: string | null;
          flexibility?: Database["public"]["Enums"]["flexibility"];
          id?: string;
          imbalan_amount?: number;
          imbalan_type?: Database["public"]["Enums"]["imbalan_type"];
          is_urgent?: boolean;
          jumlah_orang?: number;
          kecamatan?: Database["public"]["Enums"]["kecamatan"] | null;
          needed_date?: string | null;
          needed_time?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_proof_url?: string | null;
          photo_url?: string | null;
          status?: Database["public"]["Enums"]["post_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          alamat?: string | null;
          category?: Database["public"]["Enums"]["post_category"];
          created_at?: string;
          description?: string | null;
          flexibility?: Database["public"]["Enums"]["flexibility"];
          id?: string;
          imbalan_amount?: number;
          imbalan_type?: Database["public"]["Enums"]["imbalan_type"];
          is_urgent?: boolean;
          jumlah_orang?: number;
          kecamatan?: Database["public"]["Enums"]["kecamatan"] | null;
          needed_date?: string | null;
          needed_time?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_proof_url?: string | null;
          photo_url?: string | null;
          status?: Database["public"]["Enums"]["post_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          followers_count: number;
          full_name: string | null;
          id: string;
          is_top_helper: boolean;
          is_verified: boolean;
          notif_peminat: boolean;
          notif_pesan: boolean;
          notif_promo: boolean;
          notif_selesai: boolean;
          phone: string | null;
          role: string | null;
          skills: string[];
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          followers_count?: number;
          full_name?: string | null;
          id: string;
          is_top_helper?: boolean;
          is_verified?: boolean;
          notif_peminat?: boolean;
          notif_pesan?: boolean;
          notif_promo?: boolean;
          notif_selesai?: boolean;
          phone?: string | null;
          role?: string | null;
          skills?: string[];
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          followers_count?: number;
          full_name?: string | null;
          id?: string;
          is_top_helper?: boolean;
          is_verified?: boolean;
          notif_peminat?: boolean;
          notif_pesan?: boolean;
          notif_promo?: boolean;
          notif_selesai?: boolean;
          phone?: string | null;
          role?: string | null;
          skills?: string[];
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          comment: string | null;
          created_at: string;
          helper_id: string;
          id: string;
          post_id: string;
          reviewer_id: string;
          stars: number;
          tags: string[];
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          helper_id: string;
          id?: string;
          post_id: string;
          reviewer_id: string;
          stars: number;
          tags?: string[];
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          helper_id?: string;
          id?: string;
          post_id?: string;
          reviewer_id?: string;
          stars?: number;
          tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "ratings_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_posts: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      flexibility: "tepat" | "toleransi" | "fleksibel";
      imbalan_type: "per_orang" | "per_tugas" | "nego";
      kecamatan: "Lowokwaru" | "Klojen" | "Blimbing" | "Sukun" | "Kedungkandang";
      offer_status: "pending" | "accepted" | "rejected" | "cancelled";
      post_category:
        | "kurir_antar"
        | "pindahan_angkat"
        | "titip_beli"
        | "reparasi_servis"
        | "print_admin"
        | "kesehatan_darurat"
        | "les_belajar"
        | "hewan_peliharaan";
      post_status: "open" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
  public: {
    Enums: {
      flexibility: ["tepat", "toleransi", "fleksibel"],
      imbalan_type: ["per_orang", "per_tugas", "nego"],
      kecamatan: ["Lowokwaru", "Klojen", "Blimbing", "Sukun", "Kedungkandang"],
      offer_status: ["pending", "accepted", "rejected", "cancelled"],
      post_category: [
        "kurir_antar",
        "pindahan_angkat",
        "titip_beli",
        "reparasi_servis",
        "print_admin",
        "kesehatan_darurat",
        "les_belajar",
        "hewan_peliharaan",
      ],
      post_status: ["open", "in_progress", "completed", "cancelled"],
    },
  },
} as const;
