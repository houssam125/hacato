import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
 
  return {
    "Content-Type": "application/json",
   
  };
};

export type RoomType = "Amphitheatre" | "Classroom" | "Lab";

export interface RoomRequest {
  code: string;
  building_id: string;
  type: RoomType;
  capacity: number;
  name?: string | null;
  id?: string;
}

export interface RoomResponse {
  id: string;
  code: string;
  name: string | null;
  building_id: string;
  type: RoomType;
  capacity: number;
}

export const getRooms = async (): Promise<RoomResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms`, { headers: getAuthHeaders() });
    const data: ApiResponse<RoomResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch rooms error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch rooms error:", error);
    return null;
  }
};

export const createRoom = async (room: RoomRequest): Promise<RoomResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    const data: ApiResponse<RoomResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create room error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create room error:", error);
    return null;
  }
};

export const updateRoom = async (id: string, room: RoomRequest): Promise<RoomResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    const data: ApiResponse<RoomResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update room error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update room error:", error);
    return null;
  }
};