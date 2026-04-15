import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getSessions, type SessionResponse } from "@/API/Sessions";
import { getTimeSlots, type TimeSlotResponse } from "@/API/TimeSlots";
import { getCourses, type CourseResponse } from "@/API/Courses";
import { getTeachers, type TeacherResponse } from "@/API/Teachers";
import { getRooms, type RoomResponse } from "@/API/Rooms";
import { getGroups, type GroupResponse } from "@/API/Groups";

const STORAGE_KEY = "timetable_data";

interface TimetableStorageData {
  sessions: SessionResponse[];
  timeslots: TimeSlotResponse[];
  courses: CourseResponse[];
  teachers: TeacherResponse[];
  rooms: RoomResponse[];
  groups: GroupResponse[];
  savedAt: string;
}

const ManagementTimeSlots: React.FC = () => {
  const timetableRef = useRef<HTMLTableElement>(null);
  const [timeslots, setTimeslots] = useState<TimeSlotResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected group filter — empty string means "All groups"
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  // Selected teacher filter — empty string means "All teachers"
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  // ================= PERSIST TO LOCALSTORAGE =================
  const saveToLocalStorage = useCallback(
    (data: Omit<TimetableStorageData, "savedAt">) => {
      try {
        const payload: TimetableStorageData = { ...data, savedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn("⚠️ Could not save timetable data to localStorage:", e);
      }
    },
    []
  );

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

      const ts = tsData || [];
      const sess = sessData || [];
      const crs = courseData || [];
      const tch = teacherData || [];
      const rm = roomData || [];
      const grp = groupData || [];

      setTimeslots(ts);
      setSessions(sess);
      setCourses(crs);
      setTeachers(tch);
      setRooms(rm);
      setGroups(grp);

      // Persist to localStorage as JSON source
      saveToLocalStorage({
        sessions: sess,
        timeslots: ts,
        courses: crs,
        teachers: tch,
        rooms: rm,
        groups: grp,
      });

      setLoading(false);
    };

    fetchData();
  }, [saveToLocalStorage]);

  // ================= FILTERED SESSIONS =================
  const filteredSessions = useMemo(() => {
    let result = sessions;
    if (selectedGroupId) {
      result = result.filter((s) => String(s.group_id) === String(selectedGroupId));
    }
    if (selectedTeacherId) {
      result = result.filter((s) => String(s.teacher_id) === String(selectedTeacherId));
    }
    return result;
  }, [sessions, selectedGroupId, selectedTeacherId]);

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

  // ================= CSV DOWNLOAD =================
  const downloadCSV = useCallback(() => {
    const headers = ["Slot Index", "Day", "Start Time", "End Time", "Type", "Course", "Teacher", "Room", "Group"];

    const rows = filteredSessions.map((session) => {
      const slot = timeslotMap[session.timeslot_id || ""];
      return [
        slot?.slot_index ?? "",
        slot?.day ?? "",
        slot?.start_time ?? "",
        slot?.end_time ?? "",
        session.type,
        courseMap[session.course_id]?.name || "",
        teacherMap[session.teacher_id]?.name || "",
        roomMap[session.room_id || ""]?.code || "",
        groupMap[session.group_id]?.name || session.group_id,
      ];
    });

    // Sort by slot_index then day
    rows.sort((a, b) => Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1])));

    const escape = (val: unknown) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const groupName = selectedGroupId ? groupMap[selectedGroupId]?.name || "group" : "all_groups";
    const teacherName = selectedTeacherId ? teacherMap[selectedTeacherId]?.name || "teacher" : "all_teachers";
    link.download = `timetable_${groupName}_${teacherName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredSessions, timeslotMap, courseMap, teacherMap, roomMap, groupMap, selectedGroupId, selectedTeacherId]);

  // ================= JSON DOWNLOAD =================
  const downloadJSON = useCallback(() => {
    const jsonData = filteredSessions.map((session) => {
      const slot = timeslotMap[session.timeslot_id || ""];
      return {
        slot_index: slot?.slot_index ?? null,
        day: slot?.day ?? null,
        start_time: slot?.start_time ?? null,
        end_time: slot?.end_time ?? null,
        type: session.type,
        course: courseMap[session.course_id]?.name || null,
        teacher: teacherMap[session.teacher_id]?.name || null,
        teacher_id: session.teacher_id,
        room: roomMap[session.room_id || ""]?.code || null,
        group: groupMap[session.group_id]?.name || session.group_id,
        group_id: session.group_id,
      };
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const groupName = selectedGroupId ? groupMap[selectedGroupId]?.name || "group" : "all_groups";
    const teacherName = selectedTeacherId ? teacherMap[selectedTeacherId]?.name || "teacher" : "all_teachers";
    link.download = `timetable_${groupName}_${teacherName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredSessions, timeslotMap, courseMap, teacherMap, roomMap, groupMap, selectedGroupId, selectedTeacherId]);

  // ================= PDF DOWNLOAD =================
  const downloadPDF = useCallback(async () => {
    if (!timetableRef.current) return;
    const groupName = selectedGroupId ? groupMap[selectedGroupId]?.name || "group" : "all_groups";
    const teacherName = selectedTeacherId ? teacherMap[selectedTeacherId]?.name || "teacher" : "all_teachers";
    
    const canvas = await html2canvas(timetableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Timetable — ${groupName} — ${teacherName}`, pdfWidth / 2, 15, { align: "center" });

    // Fit the table image into the PDF page
    const marginTop = 22;
    const availableWidth = pdfWidth - 20;
    const availableHeight = pdfHeight - marginTop - 10;
    const imgRatio = canvas.width / canvas.height;
    let imgW = availableWidth;
    let imgH = imgW / imgRatio;
    if (imgH > availableHeight) {
      imgH = availableHeight;
      imgW = imgH * imgRatio;
    }
    const xOffset = (pdfWidth - imgW) / 2;
    pdf.addImage(imgData, "PNG", xOffset, marginTop, imgW, imgH);
    pdf.save(`timetable_${groupName}_${teacherName}.pdf`);
  }, [groupMap, selectedGroupId, selectedTeacherId, teacherMap]);

  if (loading)
    return <div className="p-4 text-center">Loading Timetable...</div>;

  // ================= UI =================
  return (
    <div className="overflow-x-auto p-2 sm:p-4">
      {/* FILTERS + DOWNLOADS */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Group filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Group:</label>
            <select
              id="filter-group"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Teacher:</label>
            <select
              id="filter-teacher"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} (ID: {teacher.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            📄 PDF
          </button>
          <button
            onClick={downloadJSON}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            📋 JSON
          </button>
          <button
            onClick={downloadCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            📥 CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table ref={timetableRef} className="min-w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 sm:p-3 text-xs sm:text-sm">Time / Day</th>
              {days.map((day) => (
                <th key={day} className="border p-2 sm:p-3 text-xs sm:text-sm">
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
                  <td className="border p-1.5 sm:p-2 text-center bg-gray-50 text-[10px] sm:text-xs">
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
                        className="border p-1 sm:p-2 h-20 sm:h-24 w-28 sm:w-40 align-top"
                      >
                        {cellSessions.length > 0 ? (
                          <div className="flex flex-col gap-1 h-full">
                            {cellSessions.map((session) => (
                              <div
                                key={session.id}
                                className={`p-1.5 sm:p-2 rounded border flex flex-col justify-between text-[9px] sm:text-xs ${getTypeColor(
                                  session.type
                                )}`}
                                title={`${courseMap[session.course_id]?.name} - ${
                                  teacherMap[session.teacher_id]?.name
                                } - Group: ${groupMap[session.group_id]?.name || session.group_id}`}
                              >
                                <div>
                                  <span className="font-bold text-[8px] sm:text-[10px]">
                                    [{session.type}]
                                  </span>

                                  <div className="font-semibold mt-0.5 sm:mt-1">
                                    {courseMap[session.course_id]?.name || "No Course"}
                                  </div>
                                </div>

                                <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t text-[8px] sm:text-[10px]">
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
                          <div className="h-full flex items-center justify-center text-gray-300 text-[9px] sm:text-xs">
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
      </div>

      {/* LEGEND */}
      <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs">
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