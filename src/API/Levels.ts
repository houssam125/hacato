import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface LevelRequest {
  name: string;
  department_id: string;
  id?: string;
}

export interface LevelResponse {
  id: string;
  name: string;
  department_id: string;
}

export const getLevels = async (): Promise<LevelResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/levels`, { headers: getAuthHeaders() });
    const data: ApiResponse<LevelResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch levels error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch levels error:", error);
    return null;
  }
};

export const createLevel = async (level: LevelRequest): Promise<LevelResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/levels`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(level),
    });
    const data: ApiResponse<LevelResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create level error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create level error:", error);
    return null;
  }
};

export const updateLevel = async (id: string, level: LevelRequest): Promise<LevelResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/levels/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(level),
    });
    const data: ApiResponse<LevelResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update level error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update level error:", error);
    return null;
  }
};