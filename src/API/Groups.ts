import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface GroupRequest {
  name: string;
  level_id: string;
  headcount: number;
  id?: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  level_id: string;
  headcount: number;
}

export const getGroups = async (): Promise<GroupResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/groups`, { headers: getAuthHeaders() });
    const data: ApiResponse<GroupResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch groups error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch groups error:", error);
    return null;
  }
};

export const createGroup = async (group: GroupRequest): Promise<GroupResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(group),
    });
    const data: ApiResponse<GroupResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create group error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create group error:", error);
    return null;
  }
};

export const updateGroup = async (id: string, group: GroupRequest): Promise<GroupResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(group),
    });
    const data: ApiResponse<GroupResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update group error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update group error:", error);
    return null;
  }
};