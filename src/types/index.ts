export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type TicketPriority = 1 | 2 | 3 | 4 | 5;
export type TicketType = "BILLING" | "TECHNICAL" | "PLAN_CHANGE" | "CANCELLATION" | "GENERAL";

export interface ZipProvider {
  brand: string;
  tech: string;
  dl: number;
  ul: number;
  ll: boolean;
  svc: string;
}

export interface TicketProviders {
  zip: string;
  city: string;
  state: string;
  list: ZipProvider[];
  total: number;
}

export interface Ticket {
  id: string;
  userId: string;
  agentId?: string;
  type: TicketType;
  subject: string;
  zip?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  agent?: { id: string; name: string; email: string };
  user?: { name: string; email: string };
  messages?: TicketMessage[];
  providers?: TicketProviders;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export type AgentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: AgentStatus;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
