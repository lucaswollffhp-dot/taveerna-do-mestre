/**
 * Rótulos (PT-BR) e tons visuais para os enums do banco.
 * Centralizado para manter consistência entre listagens, formulários
 * e a visão do jogador.
 */
import type {
  CampaignStatus,
  DiscoveryStatus,
  FactionRelationship,
  ItemStatus,
  MemberRole,
  NpcType,
  QuestStatus,
  QuestType,
  RevelationStatus,
  SessionStatus,
} from "@/lib/types/database.types";

type BadgeTone =
  | "default"
  | "ally"
  | "neutral"
  | "antagonist"
  | "villain"
  | "success"
  | "warning"
  | "danger"
  | "accent";

interface EnumMeta<T extends string> {
  labels: Record<T, string>;
  tones: Record<T, BadgeTone>;
}

export const campaignStatus: EnumMeta<CampaignStatus> = {
  labels: { active: "Ativa", paused: "Pausada", completed: "Concluída" },
  tones: { active: "success", paused: "warning", completed: "default" },
};

export const memberRole: EnumMeta<MemberRole> = {
  labels: { master: "Mestre", player: "Jogador", spectator: "Espectador" },
  tones: { master: "accent", player: "default", spectator: "neutral" },
};

export const sessionStatus: EnumMeta<SessionStatus> = {
  labels: { planned: "Planejada", played: "Jogada", cancelled: "Cancelada" },
  tones: { planned: "warning", played: "success", cancelled: "danger" },
};

export const npcType: EnumMeta<NpcType> = {
  labels: {
    ally: "Aliado",
    neutral: "Neutro",
    antagonist: "Antagonista",
    villain: "Vilão",
    unknown: "Desconhecido",
  },
  tones: {
    ally: "ally",
    neutral: "neutral",
    antagonist: "antagonist",
    villain: "villain",
    unknown: "default",
  },
};

export const revelationStatus: EnumMeta<RevelationStatus> = {
  labels: {
    unknown: "Oculto",
    spotted: "Avistado",
    known: "Conhecido",
    investigated: "Investigado",
  },
  tones: {
    unknown: "default",
    spotted: "warning",
    known: "success",
    investigated: "accent",
  },
};

export const discoveryStatus: EnumMeta<DiscoveryStatus> = {
  labels: {
    undiscovered: "Não descoberto",
    discovered: "Descoberto",
    visited: "Visitado",
    explored: "Explorado",
  },
  tones: {
    undiscovered: "default",
    discovered: "warning",
    visited: "success",
    explored: "accent",
  },
};

export const factionRelationship: EnumMeta<FactionRelationship> = {
  labels: {
    ally: "Aliada",
    neutral: "Neutra",
    hostile: "Hostil",
    unknown: "Desconhecida",
  },
  tones: {
    ally: "ally",
    neutral: "neutral",
    hostile: "villain",
    unknown: "default",
  },
};

export const questType: EnumMeta<QuestType> = {
  labels: {
    main: "Principal",
    secondary: "Secundária",
    personal: "Pessoal",
    levelup: "Progressão",
  },
  tones: {
    main: "accent",
    secondary: "default",
    personal: "neutral",
    levelup: "warning",
  },
};

export const questStatus: EnumMeta<QuestStatus> = {
  labels: {
    available: "Disponível",
    active: "Em andamento",
    completed: "Concluída",
    failed: "Fracassada",
    abandoned: "Abandonada",
  },
  tones: {
    available: "warning",
    active: "success",
    completed: "accent",
    failed: "danger",
    abandoned: "default",
  },
};

export const itemStatus: EnumMeta<ItemStatus> = {
  labels: {
    active: "Em posse",
    sold: "Vendido",
    destroyed: "Destruído",
    given: "Cedido",
    lost: "Perdido",
  },
  tones: {
    active: "success",
    sold: "warning",
    destroyed: "danger",
    given: "default",
    lost: "neutral",
  },
};

/** Converte um EnumMeta em opções para <select>. */
export function toOptions<T extends string>(meta: EnumMeta<T>) {
  return (Object.keys(meta.labels) as T[]).map((value) => ({
    value,
    label: meta.labels[value],
  }));
}
