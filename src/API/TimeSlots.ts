import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface TimeSlotRequest {
  day: string;
  start_time: string;
  end_time: string;
  slot_index: number;
  id?: string;
}

export interface TimeSlotResponse {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  slot_index: number;
}

export const getTimeSlots = async (): Promise<TimeSlotResponse[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/timeslots`, { headers: getAuthHeaders() });
    const data: ApiResponse<TimeSlotResponse[]> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Fetch timeslots error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Fetch timeslots error:", error);
    return null;
  }
};

export const createTimeSlot = async (timeSlot: TimeSlotRequest): Promise<TimeSlotResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/timeslots`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(timeSlot),
    });
    const data: ApiResponse<TimeSlotResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Create timeslot error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Create timeslot error:", error);
    return null;
  }
};

export const updateTimeSlot = async (id: string, timeSlot: TimeSlotRequest): Promise<TimeSlotResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/timeslots/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(timeSlot),
    });
    const data: ApiResponse<TimeSlotResponse> = await res.json();
    if (data.success) return data.data;
    console.error("❌ Update timeslot error:", data.message);
    return null;
  } catch (error) {
    console.error("❌ Update timeslot error:", error);
    return null;
  }
};