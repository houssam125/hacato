import React, { useEffect, useState } from "react";
import { getSessions, type SessionResponse } from "@/API/Sessions";
import { getTimeSlots, type TimeSlotResponse } from "@/API/TimeSlots";
import { getCourses, type CourseResponse } from "@/API/Courses";
import { getTeachers, type TeacherResponse } from "@/API/Teachers";
import { getRooms, type RoomResponse } from "@/API/Rooms";

interface GroupTimetableProps {
  groupId: string;
}

const GroupTimetable: React.FC<GroupTimetableProps> = ({ groupId }) => {
  const [timeslots, setTimeslots] = useState<TimeSlotResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tsData, sessData, courseData, teacherData, roomData] = await Promise.all([
        getTimeSlots(),
        getSessions(),
        getCourses(),
        getTeachers(),
        getRooms(),
      ]);

      if (tsData) setTimeslots(tsData);
      if (sessData) setSessions(sessData.filter((s) => s.group_id === groupId));
      if (courseData) setCourses(courseData);
      if (teacherData) setTeachers(teacherData);
      if (roomData) setRooms(roomData);
      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  if (loading) return <div className="p-4 text-center">Loading Timetable...</div>;

  // Organize unique days and sorted slot indices
  const days = Array.from(new Set(timeslots.map((t) => t.day)));
  const slotIndices = Array.from(new Set(timeslots.map((t) => t.slot_index))).sort((a, b) => a - b);

  // Helper to find session for a specific day and slot index
  const getSessionAt = (day: string, slotIndex: number) => {
    const slot = timeslots.find((t) => t.day === day && t.slot_index === slotIndex);
    if (!slot) return null;
    return sessions.find((s) => s.timeslot_id === slot.id);
  };

  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || "Unknown Course";
  const getTeacherName = (id: string) => teachers.find((t) => t.id === id)?.name || "Unknown Teacher";
  const getRoomCode = (id?: string | null) => rooms.find((r) => r.id === id)?.code || "N/A";

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 border-blue-300 text-blue-800";
      case "TD": return "bg-green-100 border-green-300 text-green-800";
      case "TP": return "bg-purple-100 border-purple-300 text-purple-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-600">Time / Day</th>
            {days.map((day) => (
              <th key={day} className="border border-gray-300 p-3 text-sm font-semibold text-gray-600">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slotIndices.map((index) => {
            // Get time range for the row header from any slot with this index
            const rowTime = timeslots.find((t) => t.slot_index === index);
            
            return (
              <tr key={index}>
                <td className="border border-gray-300 p-2 text-center bg-gray-50 font-medium text-xs">
                  <div className="font-bold">Slot {index}</div>
                  <div className="text-gray-500 whitespace-nowrap">
                    {rowTime?.start_time} - {rowTime?.end_time}
                  </div>
                </td>
                {days.map((day) => {
                  const session = getSessionAt(day, index);
                  return (
                    <td key={`${day}-${index}`} className="border border-gray-300 p-2 h-24 w-40 align-top">
                      {session ? (
                        <div className={`p-2 rounded border h-full flex flex-col justify-between text-xs transition-colors hover:opacity-90 ${getTypeColor(session.type)}`}>
                          <div>
                            <span className="font-bold uppercase text-[10px] block mb-1">
                              [{session.type}]
                            </span>
                            <div className="font-semibold leading-tight mb-1">
                              {getCourseName(session.course_id)}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-black/10 flex flex-col gap-0.5 opacity-80">
                            <div className="flex items-center italic">
                              👤 {getTeacherName(session.teacher_id)}
                            </div>
                            <div className="flex items-center font-medium">
                              📍 Room: {getRoomCode(session.room_id)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full w-full bg-gray-50/30 rounded flex items-center justify-center italic text-gray-300 text-[10px]">
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
      
      <div className="mt-4 flex gap-4 text-xs font-medium">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span> Lecture
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span> TD
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span> TP
        </div>
      </div>
    </div>
  );
};

export default GroupTimetable;