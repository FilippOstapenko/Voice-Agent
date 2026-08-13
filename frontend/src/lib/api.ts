const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface ConversationListItem {
  id: string;
  channel: "phone" | "whatsapp" | "chat" | "voice";
  contact: string;
  preview: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  channel: "phone" | "whatsapp" | "chat" | "voice";
  contact: string;
  summary: string;
  createdAt: string;
  transcript: { from: "caller" | "ai"; text: string }[];
  actions: { type: string; detail: string }[];
}

export interface AgentData {
  prompt: string;
  knowledge: string;
}

export interface BillingData {
  plan: "START" | "COMPLEET" | "PRO";
  status: string;
  pricePerMonth: number;
  usage: { label: string; used: number; quota: number }[];
}

export interface OrganizationData {
  id: string;
  name: string;
  website: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status} op ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  organization: () => request<OrganizationData>("/api/organization"),
  conversations: () => request<ConversationListItem[]>("/api/conversations"),
  conversation: (id: string) => request<ConversationDetail>(`/api/conversations/${id}`),
  agent: () => request<AgentData>("/api/agent"),
  saveAgent: (data: Partial<AgentData>) =>
    request<AgentData>("/api/agent", { method: "PATCH", body: JSON.stringify(data) }),
  generateKnowledge: (website: string) =>
    request<AgentData>("/api/agent/generate-knowledge", {
      method: "POST",
      body: JSON.stringify({ website }),
    }),
  billing: () => request<BillingData>("/api/billing"),
};

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "gisteren";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export const channelLabel: Record<ConversationListItem["channel"], string> = {
  phone: "Telefoon",
  whatsapp: "WhatsApp",
  chat: "Chat",
  voice: "Voice-demo",
};
