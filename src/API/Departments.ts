import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface DepartmentRequest {
  name: string;
  code: string;
  id?: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
}

export const getDepartments = async (): Promise<DepartmentResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
    const data: ApiResponse<DepartmentResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch departments error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch departments error:", error);
    return null;
  }
};

export const createDepartment = async (department: DepartmentRequest): Promise<DepartmentResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(department),
    });
    const data: ApiResponse<DepartmentResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create department error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create department error:", error);
    return null;
  }
};

export const updateDepartment = async (id: string, department: DepartmentRequest): Promise<DepartmentResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(department),
    });
    const data: ApiResponse<DepartmentResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update department error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update department error:", error);
    return null;
  }
};