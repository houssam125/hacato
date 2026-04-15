import { useEffect, useState } from "react";
import { AdminSocketContext } from "./AdminSocketContext";

import API_BASE_URL from "@/API_BASE_URL";
import type { AdminSocketMessage, Lead } from "@/types/WebSocket";



const getWebSocketURL = (): string => {
  return API_BASE_URL
    .replace("https://", "wss://")
    .replace("http://", "ws://")
    .concat("/ws/admin");
};

export const AdminSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<AdminSocketMessage<Lead>[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Don't connect if no token
    if (!token) {
      console.warn("No token — skipping WebSocket connection");
      return;
    }

    const url = getWebSocketURL();
    let isClosed = false;

    const socket = new WebSocket(url, ["jwt", token]);  // ✅ "jwt" matches your backend

    socket.onopen = () => {
      console.log(`✅ WebSocket connected: ${url}`);
    };


    socket.onmessage = (event) => {
      if (isClosed) return;

      const message = JSON.parse(event.data);

      if (message.type === "new_lead") {
        const lead: AdminSocketMessage<Lead> = message.data;
        setLeads((prev) => [lead, ...prev]);
      }
    };

    socket.onerror = (err) => {


      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    // ✅ Cleanup on unmount
    return () => {
      isClosed = true;
      socket.close();
    };
  }, []);

  return (
    <AdminSocketContext.Provider value={{ leads }}>
      {children}
    </AdminSocketContext.Provider>
  );
};