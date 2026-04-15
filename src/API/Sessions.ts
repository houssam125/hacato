import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export type SessionType = "Lecture" | "TD" | "TP";

export interface SessionRequest {
  course_id: string;
  type: SessionType;
  teacher_id: string;
  group_id: string;
  room_id?: string | null;
  timeslot_id?: string | null;
  id?: string;
}

export interface SessionResponse {
  id: string;
  course_id: string;
  type: SessionType;
  teacher_id: string;
  group_id: string;
  room_id?: string | null;
  timeslot_id?: string | null;
}

export const getSessions = async (): Promise<SessionResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions`, { headers: getAuthHeaders() });
    const data: ApiResponse<SessionResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch sessions error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch sessions error:", error);
    return null;
  }
};

export const getSessionsByGroup = async (groupId: string): Promise<SessionResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions`, { headers: getAuthHeaders() });
    const data: ApiResponse<SessionResponse[]> = await res.json();
    if (data.success) {
      return data.data.filter((s) => String(s.group_id) === String(groupId));
    }
    console.error("❌ Fetch sessions by group error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch sessions by group error:", error);
    return null;
  }
};

export const createSession = async (session: SessionRequest): Promise<SessionResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(session),
    });
    const data: ApiResponse<SessionResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create session error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create session error:", error);
    return null;
  }
};

export const updateSession = async (id: string, session: SessionRequest): Promise<SessionResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(session),
    });
    const data: ApiResponse<SessionResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update session error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update session error:", error);
    return null;
  }
};