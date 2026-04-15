import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface TeacherRequest {
  name: string;
  email: string;
  max_hours?: number;
  specializations?: string[];
  unavailable_slots?: string[];
  id?: string;
}

export interface TeacherResponse {
  id: string;
  name: string;
  email: string;
  max_hours: number;
  specializations: string[];
  unavailable_slots: string[];
}

export const getTeachers = async (): Promise<TeacherResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/teachers`, { headers: getAuthHeaders() });
    const data: ApiResponse<TeacherResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch teachers error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch teachers error:", error);
    return null;
  }
};

export const createTeacher = async (teacher: TeacherRequest): Promise<TeacherResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/teachers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacher),
    });
    const data: ApiResponse<TeacherResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create teacher error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create teacher error:", error);
    return null;
  }
};

export const updateTeacher = async (id: string, teacher: TeacherRequest): Promise<TeacherResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacher),
    });
    const data: ApiResponse<TeacherResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update teacher error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update teacher error:", error);
    return null;
  }
};