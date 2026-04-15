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

// Fetch timeslots specific to a group & level by cross-referencing sessions
export interface GroupTimetableData {
  timeslots: TimeSlotResponse[];
  sessions: { id: string; course_id: string; type: string; teacher_id: string; group_id: string; room_id?: string | null; timeslot_id?: string | null }[];
}

export const getTimeSlotsByGroupAndLevel = async (
  groupId: string,
  _levelId: string
): Promise<GroupTimetableData | null> => {
  try {
    // Fetch sessions and timeslots in parallel
    const [sessRes, tsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/sessions`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE_URL}/timeslots`, { headers: getAuthHeaders() }),
    ]);

    const sessData = await sessRes.json();
    const tsData = await tsRes.json();

    if (!sessData.success || !tsData.success) {
      console.error("❌ Fetch group timetable error");
      return null;
    }

    // Filter sessions by group_id
    const groupSessions = sessData.data.filter(
      (s: { group_id: string }) => String(s.group_id) === String(groupId)
    );

    // Get the timeslot IDs used by these sessions
    const usedTimeslotIds = new Set(
      groupSessions.map((s: { timeslot_id?: string | null }) => s.timeslot_id).filter(Boolean)
    );

    // Filter timeslots to only the ones used by this group
    const relevantTimeslots = tsData.data.filter(
      (t: TimeSlotResponse) => usedTimeslotIds.has(t.id)
    );

    return {
      timeslots: relevantTimeslots,
      sessions: groupSessions,
    };
  } catch (error) {
    console.error("❌ Fetch group timetable error:", error);
    return null;
  }
};