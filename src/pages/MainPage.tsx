import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments, type DepartmentResponse } from "@/API/Departments";
import { getLevels, type LevelResponse } from "@/API/Levels";
import { getGroups, type GroupResponse } from "@/API/Groups";
import { type SessionResponse } from "@/API/Sessions";
import { getTimeSlotsByGroupAndLevel, type TimeSlotResponse } from "@/API/TimeSlots";
import { getCourses, type CourseResponse } from "@/API/Courses";
import { getTeachers, type TeacherResponse } from "@/API/Teachers";
import { getRooms, type RoomResponse } from "@/API/Rooms";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const MainPage = () => {
  const navigate = useNavigate();
  const timetableRef = useRef<HTMLTableElement>(null);

  // ================= SELECTOR STATE =================
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // ================= TIMETABLE STATE =================
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [timeslots, setTimeslots] = useState<TimeSlotResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const [loadingSelectors, setLoadingSelectors] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // ================= FETCH SELECTORS =================
  useEffect(() => {
    const load = async () => {
      const [deptData, levelData, groupData] = await Promise.all([
        getDepartments(),
        getLevels(),
        getGroups(),
      ]);
      if (deptData) setDepartments(deptData);
      if (levelData) setLevels(levelData);
      if (groupData) setGroups(groupData);
      setLoadingSelectors(false);
    };
    load();
  }, []);

  // ================= CASCADING FILTERS =================
  const filteredLevels = useMemo(
    () => (selectedDeptId ? levels.filter((l) => String(l.department_id) === selectedDeptId) : []),
    [levels, selectedDeptId]
  );

  const filteredGroups = useMemo(
    () => (selectedLevelId ? groups.filter((g) => String(g.level_id) === selectedLevelId) : []),
    [groups, selectedLevelId]
  );

  // Reset downstream when upstream changes
  const handleDeptChange = (val: string) => {
    setSelectedDeptId(val);
    setSelectedLevelId("");
    setSelectedGroupId("");
    setSessions([]);
  };

  const handleLevelChange = (val: string) => {
    setSelectedLevelId(val);
    setSelectedGroupId("");
    setSessions([]);
  };

  // ================= FETCH TIMETABLE =================
  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    if (!groupId) {
      setSessions([]);
      setTimeslots([]);
      return;
    }

    setLoadingTimetable(true);

    // Fetch timeslots + sessions specific to this group & level
    const [timetableData, courseData, teacherData, roomData] = await Promise.all([
      getTimeSlotsByGroupAndLevel(groupId, selectedLevelId),
      courses.length ? Promise.resolve(courses) : getCourses(),
      teachers.length ? Promise.resolve(teachers) : getTeachers(),
      rooms.length ? Promise.resolve(rooms) : getRooms(),
    ]);

    if (timetableData) {
      setTimeslots(timetableData.timeslots);
      setSessions(timetableData.sessions as SessionResponse[]);
    } else {
      setTimeslots([]);
      setSessions([]);
    }
    if (Array.isArray(courseData)) setCourses(courseData);
    if (Array.isArray(teacherData)) setTeachers(teacherData);
    if (Array.isArray(roomData)) setRooms(roomData);

    setLoadingTimetable(false);
  };

  // ================= MAPS =================
  const courseMap = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);
  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t) => [t.id, t])), [teachers]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);
  const timeslotMap = useMemo(() => Object.fromEntries(timeslots.map((t) => [t.id, t])), [timeslots]);

  const days = useMemo(() => Array.from(new Set(timeslots.map((t) => t.day))), [timeslots]);
  const slotIndices = useMemo(
    () => Array.from(new Set(timeslots.map((t) => t.slot_index))).sort((a, b) => a - b),
    [timeslots]
  );

  const sessionGrid = useMemo(() => {
    const grid: Record<string, SessionResponse> = {};
    sessions.forEach((session) => {
      const slot = timeslotMap[session.timeslot_id || ""];
      if (!slot) return;
      grid[`${slot.day}-${slot.slot_index}`] = session;
    });
    return grid;
  }, [sessions, timeslotMap]);

  // ================= CSV DOWNLOAD =================
  const downloadCSV = useCallback(() => {
    const headers = ["Slot Index", "Day", "Start Time", "End Time", "Type", "Course", "Teacher", "Room"];
    const rows = sessions.map((session) => {
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
      ];
    });
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
    const groupName = groups.find((g) => g.id === selectedGroupId)?.name || "timetable";
    link.download = `timetable_${groupName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions, timeslotMap, courseMap, teacherMap, roomMap, groups, selectedGroupId]);

  // ================= PDF DOWNLOAD =================
  const downloadPDF = useCallback(async () => {
    if (!timetableRef.current) return;
    const groupName = groups.find((g) => g.id === selectedGroupId)?.name || "timetable";
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
    pdf.text(`Timetable — ${groupName}`, pdfWidth / 2, 15, { align: "center" });

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
    pdf.save(`timetable_${groupName}.pdf`);
  }, [groups, selectedGroupId]);

  // ================= HELPERS =================
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 border-blue-300 text-blue-800";
      case "TD": return "bg-green-100 border-green-300 text-green-800";
      case "TP": return "bg-purple-100 border-purple-300 text-purple-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Timetable Viewer</h1>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Login
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* WELCOME */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome 👋</h2>
          <p className="text-gray-500">Select your department, level, and group to view the timetable.</p>
        </div>

        {/* SELECTORS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          {loadingSelectors ? (
            <div className="text-center text-gray-400 py-4">Loading options...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                <select
                  value={selectedLevelId}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  disabled={!selectedDeptId}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Select Level --</option>
                  {filteredLevels.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  disabled={!selectedLevelId}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Select Group --</option>
                  {filteredGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* TIMETABLE */}
        {loadingTimetable && (
          <div className="text-center py-12 text-gray-400">Loading timetable...</div>
        )}

        {!loadingTimetable && selectedGroupId && sessions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* Download button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Timetable — {groups.find((g) => g.id === selectedGroupId)?.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  📥 Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table ref={timetableRef} className="min-w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
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
                          const session = sessionGrid[`${day}-${index}`];
                          return (
                            <td key={`${day}-${index}`} className="border border-gray-300 p-2 h-24 w-40 align-top">
                              {session ? (
                                <div
                                  className={`p-2 rounded border h-full flex flex-col justify-between text-xs transition-colors hover:opacity-90 ${getTypeColor(session.type)}`}
                                >
                                  <div>
                                    <span className="font-bold uppercase text-[10px] block mb-1">
                                      [{session.type}]
                                    </span>
                                    <div className="font-semibold leading-tight mb-1">
                                      {courseMap[session.course_id]?.name || "No Course"}
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-black/10 flex flex-col gap-0.5 opacity-80">
                                    <div className="flex items-center italic">
                                      👤 {teacherMap[session.teacher_id]?.name || "No Teacher"}
                                    </div>
                                    <div className="flex items-center font-medium">
                                      📍 Room: {roomMap[session.room_id || ""]?.code || "N/A"}
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
            </div>

            {/* Legend */}
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
        )}

        {!loadingTimetable && selectedGroupId && sessions.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No sessions found for this group.</p>
          </div>
        )}

        {!selectedGroupId && !loadingSelectors && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">Select a department, level, and group above to view the timetable.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;