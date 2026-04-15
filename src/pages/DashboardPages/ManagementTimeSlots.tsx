import React, { useEffect, useMemo, useState } from "react";
import { getSessions, type SessionResponse } from "@/API/Sessions";
import { getTimeSlots, type TimeSlotResponse } from "@/API/TimeSlots";
import { getCourses, type CourseResponse } from "@/API/Courses";
import { getTeachers, type TeacherResponse } from "@/API/Teachers";
import { getRooms, type RoomResponse } from "@/API/Rooms";
import { getGroups, type GroupResponse } from "@/API/Groups";

const ManagementTimeSlots: React.FC = () => {
  const [timeslots, setTimeslots] = useState<TimeSlotResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected group filter — empty string means "All groups"
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [tsData, sessData, courseData, teacherData, roomData, groupData] =
        await Promise.all([
          getTimeSlots(),
          getSessions(),
          getCourses(),
          getTeachers(),
          getRooms(),
          getGroups(),
        ]);

      if (tsData) setTimeslots(tsData);
      if (sessData) setSessions(sessData);
      if (courseData) setCourses(courseData);
      if (teacherData) setTeachers(teacherData);
      if (roomData) setRooms(roomData);
      if (groupData) setGroups(groupData);

      setLoading(false);
    };

    fetchData();
  }, []);

  // ================= FILTERED SESSIONS =================
  const filteredSessions = useMemo(() => {
    if (!selectedGroupId) return sessions; // Show all when no group selected
    return sessions.filter((s) => String(s.group_id) === String(selectedGroupId));
  }, [sessions, selectedGroupId]);

  // ================= MAPS (🔥 PERFORMANCE) =================
  const courseMap = useMemo(
    () => Object.fromEntries(courses.map((c) => [c.id, c])),
    [courses]
  );

  const teacherMap = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t])),
    [teachers]
  );

  const roomMap = useMemo(
    () => Object.fromEntries(rooms.map((r) => [r.id, r])),
    [rooms]
  );

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g])),
    [groups]
  );

  const timeslotMap = useMemo(
    () => Object.fromEntries(timeslots.map((t) => [t.id, t])),
    [timeslots]
  );

  // ================= SESSION GRID =================
  const sessionGrid = useMemo(() => {
    const grid: Record<string, SessionResponse[]> = {};

    filteredSessions.forEach((session) => {
      const slot = timeslotMap[session.timeslot_id || ""];
      if (!slot) return;

      const key = `${slot.day}-${slot.slot_index}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(session);
    });

    return grid;
  }, [filteredSessions, timeslotMap]);

  // ================= DAYS & SLOTS =================
  const days = useMemo(
    () => Array.from(new Set(timeslots.map((t) => t.day))),
    [timeslots]
  );

  const slotIndices = useMemo(
    () =>
      Array.from(new Set(timeslots.map((t) => t.slot_index))).sort(
        (a, b) => a - b
      ),
    [timeslots]
  );

  // ================= HELPERS =================
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "TD":
        return "bg-green-100 border-green-300 text-green-800";
      case "TP":
        return "bg-purple-100 border-purple-300 text-purple-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  if (loading)
    return <div className="p-4 text-center">Loading Timetable...</div>;

  // ================= UI =================
  return (
    <div className="overflow-x-auto p-4">
      {/* GROUP FILTER */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by Group:</label>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-3 text-sm">Time / Day</th>
            {days.map((day) => (
              <th key={day} className="border p-3 text-sm">
                {day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {slotIndices.map((index) => {
            const rowTime = timeslots.find(
              (t) => t.slot_index === index
            );

            return (
              <tr key={index}>
                {/* TIME COLUMN */}
                <td className="border p-2 text-center bg-gray-50 text-xs">
                  <div className="font-bold">Slot {index}</div>
                  <div className="text-gray-500">
                    {rowTime?.start_time} - {rowTime?.end_time}
                  </div>
                </td>

                {/* DAYS */}
                {days.map((day) => {
                  const cellSessions =
                    sessionGrid[`${day}-${index}`] || [];

                  return (
                    <td
                      key={`${day}-${index}`}
                      className="border p-2 h-24 w-40 align-top"
                    >
                      {cellSessions.length > 0 ? (
                        <div className="flex flex-col gap-1 h-full">
                          {cellSessions.map((session) => (
                            <div
                              key={session.id}
                              className={`p-2 rounded border flex flex-col justify-between text-xs ${getTypeColor(
                                session.type
                              )}`}
                              title={`${courseMap[session.course_id]?.name} - ${
                                teacherMap[session.teacher_id]?.name
                              } - Group: ${groupMap[session.group_id]?.name || session.group_id}`}
                            >
                              <div>
                                <span className="font-bold text-[10px]">
                                  [{session.type}]
                                </span>

                                <div className="font-semibold mt-1">
                                  {courseMap[session.course_id]?.name || "No Course"}
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t text-[10px]">
                                <div>
                                  👤{" "}
                                  {teacherMap[session.teacher_id]?.name || "No Teacher"}
                                </div>
                                <div>
                                  📍 Room:{" "}
                                  {roomMap[session.room_id || ""]?.code || "N/A"}
                                </div>
                                {!selectedGroupId && (
                                  <div>
                                    👥 {groupMap[session.group_id]?.name || session.group_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                          Empty
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* LEGEND */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-100 border rounded"></span> Lecture
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 border rounded"></span> TD
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-purple-100 border rounded"></span> TP
        </div>
      </div>
    </div>
  );
};

export default ManagementTimeSlots;