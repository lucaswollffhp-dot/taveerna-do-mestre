/**
 * Tipos do banco de dados Supabase.
 *
 * Escritos manualmente a partir das migrations em `supabase/migrations`.
 * Depois de conectar um projeto Supabase real, estes tipos podem ser
 * regenerados com:
 *   supabase gen types typescript --project-id <id> > lib/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CampaignStatus = "active" | "paused" | "completed";
export type MemberRole = "master" | "player" | "spectator";
export type SessionStatus = "planned" | "played" | "cancelled";
export type FactionRelationship = "ally" | "neutral" | "hostile" | "unknown";
export type DiscoveryStatus =
  | "undiscovered"
  | "discovered"
  | "visited"
  | "explored";
export type NpcType = "ally" | "neutral" | "antagonist" | "villain" | "unknown";
export type RevelationStatus =
  | "unknown"
  | "spotted"
  | "known"
  | "investigated";
export type QuestType = "main" | "secondary" | "personal" | "levelup";
export type QuestStatus =
  | "available"
  | "active"
  | "completed"
  | "failed"
  | "abandoned";
export type ItemStatus = "active" | "sold" | "destroyed" | "given" | "lost";
export type EncounterStatus = "active" | "ended";
export type TokenRefType = "character" | "npc" | "custom";

export interface QuestObjective {
  text: string;
  completed: boolean;
  // Index signature torna o tipo compatível com a coluna Json (jsonb).
  [key: string]: Json | undefined;
}

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          system: string;
          setting: string | null;
          tone: string | null;
          status: CampaignStatus;
          master_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          system?: string;
          setting?: string | null;
          tone?: string | null;
          status?: CampaignStatus;
          master_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
        Relationships: [];
      };
      campaign_members: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          role: MemberRole;
          character_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          user_id: string;
          role: MemberRole;
          character_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["campaign_members"]["Insert"]
        >;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          campaign_id: string;
          number: number;
          title: string;
          session_date: string | null;
          status: SessionStatus;
          master_notes: string | null;
          public_summary: string | null;
          xp_awarded: number;
          decisions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          number: number;
          title: string;
          session_date?: string | null;
          status?: SessionStatus;
          master_notes?: string | null;
          public_summary?: string | null;
          xp_awarded?: number;
          decisions?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      factions: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          type: string | null;
          alignment: string | null;
          objectives: string | null;
          player_relationship: FactionRelationship;
          secrets: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          type?: string | null;
          alignment?: string | null;
          objectives?: string | null;
          player_relationship?: FactionRelationship;
          secrets?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["factions"]["Insert"]>;
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          type: string | null;
          region: string | null;
          public_description: string | null;
          master_notes: string | null;
          discovery_status: DiscoveryStatus;
          parent_location_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          type?: string | null;
          region?: string | null;
          public_description?: string | null;
          master_notes?: string | null;
          discovery_status?: DiscoveryStatus;
          parent_location_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
        Relationships: [];
      };
      npcs: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          aliases: string[] | null;
          type: NpcType;
          faction_id: string | null;
          location_id: string | null;
          physical_description: string | null;
          history: string | null;
          motivations: string | null;
          secrets: string | null;
          master_notes: string | null;
          revelation_status: RevelationStatus;
          token_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          aliases?: string[] | null;
          type?: NpcType;
          faction_id?: string | null;
          location_id?: string | null;
          physical_description?: string | null;
          history?: string | null;
          motivations?: string | null;
          secrets?: string | null;
          master_notes?: string | null;
          revelation_status?: RevelationStatus;
          token_image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["npcs"]["Insert"]>;
        Relationships: [];
      };
      characters: {
        Row: {
          id: string;
          campaign_id: string;
          player_id: string | null;
          name: string;
          race: string | null;
          class: string | null;
          level: number;
          hp_current: number;
          hp_max: number;
          ac: number;
          xp_current: number;
          attributes: Json;
          conditions: Json;
          inventory: Json;
          gold: number;
          background: string | null;
          secrets: string | null;
          token_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          player_id?: string | null;
          name: string;
          race?: string | null;
          class?: string | null;
          level?: number;
          hp_current?: number;
          hp_max?: number;
          ac?: number;
          xp_current?: number;
          attributes?: Json;
          conditions?: Json;
          inventory?: Json;
          gold?: number;
          background?: string | null;
          secrets?: string | null;
          token_image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["characters"]["Insert"]>;
        Relationships: [];
      };
      quests: {
        Row: {
          id: string;
          campaign_id: string;
          title: string;
          description: string | null;
          type: QuestType;
          status: QuestStatus;
          contractor_id: string | null;
          location_id: string | null;
          objectives: Json;
          reward_gold: number;
          reward_xp: number;
          reward_items: string | null;
          reward_other: string | null;
          is_visible_to_players: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          title: string;
          description?: string | null;
          type?: QuestType;
          status?: QuestStatus;
          contractor_id?: string | null;
          location_id?: string | null;
          objectives?: Json;
          reward_gold?: number;
          reward_xp?: number;
          reward_items?: string | null;
          reward_other?: string | null;
          is_visible_to_players?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quests"]["Insert"]>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          type: string | null;
          value_gp: number;
          weight_kg: number;
          magical_properties: string | null;
          holder_id: string | null;
          origin_session_id: string | null;
          status: ItemStatus;
          is_special: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          type?: string | null;
          value_gp?: number;
          weight_kg?: number;
          magical_properties?: string | null;
          holder_id?: string | null;
          origin_session_id?: string | null;
          status?: ItemStatus;
          is_special?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["items"]["Insert"]>;
        Relationships: [];
      };
      entity_relations: {
        Row: {
          id: string;
          campaign_id: string;
          entity_a_type: string;
          entity_a_id: string;
          entity_b_type: string;
          entity_b_id: string;
          relation_type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          entity_a_type: string;
          entity_a_id: string;
          entity_b_type: string;
          entity_b_id: string;
          relation_type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["entity_relations"]["Insert"]
        >;
        Relationships: [];
      };
      npc_appearances: {
        Row: {
          id: string;
          npc_id: string;
          session_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          npc_id: string;
          session_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["npc_appearances"]["Insert"]
        >;
        Relationships: [];
      };
      encounters: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          status: EncounterStatus;
          round: number;
          turn_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name?: string;
          status?: EncounterStatus;
          round?: number;
          turn_index?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["encounters"]["Insert"]>;
        Relationships: [];
      };
      combatants: {
        Row: {
          id: string;
          encounter_id: string;
          campaign_id: string;
          character_id: string | null;
          name: string;
          initiative: number;
          hp_current: number;
          hp_max: number;
          ac: number;
          is_pc: boolean;
          conditions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          encounter_id: string;
          campaign_id: string;
          character_id?: string | null;
          name: string;
          initiative?: number;
          hp_current?: number;
          hp_max?: number;
          ac?: number;
          is_pc?: boolean;
          conditions?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["combatants"]["Insert"]>;
        Relationships: [];
      };
      scenes: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          map_image_url: string | null;
          grid_size: number;
          grid_enabled: boolean;
          is_active: boolean;
          fog_enabled: boolean;
          fog_revealed: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name?: string;
          map_image_url?: string | null;
          grid_size?: number;
          grid_enabled?: boolean;
          is_active?: boolean;
          fog_enabled?: boolean;
          fog_revealed?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scenes"]["Insert"]>;
        Relationships: [];
      };
      tokens: {
        Row: {
          id: string;
          scene_id: string;
          campaign_id: string;
          name: string;
          image_url: string | null;
          color: string;
          x: number;
          y: number;
          size: number;
          rotation: number;
          ref_type: TokenRefType;
          ref_id: string | null;
          controlled_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          campaign_id: string;
          name?: string;
          image_url?: string | null;
          color?: string;
          x?: number;
          y?: number;
          size?: number;
          rotation?: number;
          ref_type?: TokenRefType;
          ref_id?: string | null;
          controlled_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tokens"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// Atalhos convenientes
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignMember =
  Database["public"]["Tables"]["campaign_members"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Faction = Database["public"]["Tables"]["factions"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Npc = Database["public"]["Tables"]["npcs"]["Row"];
export type Character = Database["public"]["Tables"]["characters"]["Row"];
export type Quest = Database["public"]["Tables"]["quests"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type Encounter = Database["public"]["Tables"]["encounters"]["Row"];
export type Combatant = Database["public"]["Tables"]["combatants"]["Row"];
export type Scene = Database["public"]["Tables"]["scenes"]["Row"];
export type Token = Database["public"]["Tables"]["tokens"]["Row"];
