import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CourseRequest {
  name: string;
  code: string;
  level_id: string;
  num_lectures?: number;
  num_td?: number;
  num_tp?: number;
  id?: string;
}

export interface CourseResponse {
  id: string;
  name: string;
  code: string;
  level_id: string;
  num_lectures: number;
  num_td: number;
  num_tp: number;
}

export const getCourses = async (): Promise<CourseResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, { headers: getAuthHeaders() });
    const data: ApiResponse<CourseResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch courses error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch courses error:", error);
    return null;
  }
};

export const createCourse = async (course: CourseRequest): Promise<CourseResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(course),
    });
    const data: ApiResponse<CourseResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create course error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create course error:", error);
    return null;
  }
};

export const updateCourse = async (id: string, course: CourseRequest): Promise<CourseResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(course),
    });
    const data: ApiResponse<CourseResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update course error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update course error:", error);
    return null;
  }
};