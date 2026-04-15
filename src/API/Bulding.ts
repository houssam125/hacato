import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";


const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface BuildingRequest {
  name: string;
  location: string;
  number_of_rooms: number;
}

export interface BuildingResponse {
  id: string | number;
  name: string;
  location: string;
  number_of_rooms: number;
}

export const createBuilding = async (building: BuildingRequest): Promise<BuildingResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(building),
    });
    const data: ApiResponse<BuildingResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Building creation error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Building creation error:", error);
    return null;
  }
};

export const getBuildings = async (): Promise<BuildingResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings`, { headers: getAuthHeaders() });
    const data: ApiResponse<BuildingResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch buildings error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch buildings error:", error);
    return null;
  }
};

export const getBuildingById = async (id: string | number): Promise<BuildingResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings/${id}`, { headers: getAuthHeaders() });
    const data: ApiResponse<BuildingResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch building error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch building error:", error);
    return null;
  }
};

export const updateBuilding = async (id: string | number, building: BuildingRequest): Promise<BuildingResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(building),
    });
    const data: ApiResponse<BuildingResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update building error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update building error:", error);
    return null;
  }
};

export const deleteBuilding = async (id: string | number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data: ApiResponse<BuildingResponse> = await res.json();
    if (data.success) return true;
    console.error("❌ Delete building error:", data.message);
    return false;
  } catch (error) {
    console.error("❌ Delete building error:", error);
    return false;
  }
};