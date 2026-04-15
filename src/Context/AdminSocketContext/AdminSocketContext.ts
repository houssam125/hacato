
import type { AdminSocketMessage, Lead } from "@/types/WebSocket";
import { createContext } from "react";

export interface AdminSocketContextType {
  leads: AdminSocketMessage<Lead>[]; // ✅ SubmitLead should be wrapped in []
}

export const AdminSocketContext = createContext<AdminSocketContextType | null>(null);