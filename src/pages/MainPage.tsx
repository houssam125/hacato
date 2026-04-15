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

/* ─────────────────────────── KEYFRAMES INJECTION ─────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

  .mp-fade-up {
    opacity: 0;
    transform: translateY(18px);
    animation: mpFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes mpFadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
  .mp-delay-1 { animation-delay: 0.08s; }
  .mp-delay-2 { animation-delay: 0.18s; }
  .mp-delay-3 { animation-delay: 0.28s; }
  .mp-delay-4 { animation-delay: 0.38s; }

  @keyframes mpShimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .mp-shimmer {
    background: linear-gradient(90deg, #e8e4d6 25%, #f5f1e8 50%, #e8e4d6 75%);
    background-size: 600px 100%;
    animation: mpShimmer 1.4s infinite linear;
    border-radius: 8px;
  }

  .mp-cell-hover {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .mp-cell-hover:hover {
    transform: translateY(-2px) scale(1.015);
    box-shadow: 0 6px 20px rgba(0,0,0,0.10);
    z-index: 10;
    position: relative;
  }

  .mp-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C9922F' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px !important;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mp-select:focus {
    outline: none;
    border-color: #C9922F !important;
    box-shadow: 0 0 0 3px rgba(201,146,47,0.15);
  }
  .mp-select:disabled { opacity: 0.45; cursor: not-allowed; }

  .mp-btn {
    transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
  }
  .mp-btn:hover  { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
  .mp-btn:active { transform: translateY(0px); box-shadow: none; }

  @keyframes mpPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  .mp-pulse { animation: mpPulse 1.5s ease infinite; }

  .mp-row-in {
    opacity: 0;
    animation: mpFadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .mp-header-line {
    width: 0;
    animation: mpLineGrow 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes mpLineGrow {
    to { width: 64px; }
  }
`;

/* ─────────────────────────── HELPERS ─────────────────────────── */
const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Lecture: { bg: "#EBF3FF", border: "#93C3FD", text: "#1E3A6E", badge: "#DBEAFE" },
  TD:      { bg: "#EDFAF4", border: "#6EDBA8", text: "#14503A", badge: "#D1FAE5" },
  TP:      { bg: "#F5F0FF", border: "#C4A8F5", text: "#3B1F72", badge: "#EDE9FE" },
};
const DEFAULT_TYPE = { bg: "#F5F3EE", border: "#D1C9B8", text: "#4A3F2E", badge: "#EDE8DC" };

const typeStyle = (type: string) => TYPE_STYLES[type] ?? DEFAULT_TYPE;

/* ─────────────────────────── ICONS (inline SVG) ─────────────────────────── */
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M3 17V5a2 2 0 012-2h10a2 2 0 012 2v12M3 17h14M8 17v-4h4v4" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconStack = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M2 5l8-3 8 3-8 3-8-3zm0 5l8 3 8-3M2 15l8 3 8-3" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="8" cy="7" r="3" stroke="#C9922F" strokeWidth="1.5"/>
    <path d="M2 17c0-3 2.7-5 6-5s6 2 6 5" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 4a3 3 0 010 6M16 17c0-2-1-3.5-3-4.5" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconPDF = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path d="M5 4a2 2 0 012-2h6l4 4v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M13 2v4h4M7 12h2c.8 0 1.5-.7 1.5-1.5S9.8 9 9 9H7v6m6-6v2m0 0c.8 0 1.5.7 1.5 1.5S13.8 15 13 15m0-4h1.5M7 9v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconCSV = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path d="M5 4a2 2 0 012-2h6l4 4v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 11.5c0-.8-.6-1.5-1.5-1.5H7v4h.5m1.5-4c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5m3-4l1.5 4m0-4 1.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCal = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2" stroke="#C9922F" strokeWidth="1.5"/>
    <path d="M2 8h16M7 2v2m6-2v2" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="12" r="1" fill="#C9922F"/><circle cx="10" cy="12" r="1" fill="#C9922F"/>
    <circle cx="13" cy="12" r="1" fill="#C9922F"/>
  </svg>
);

/* ─────────────────────────── SHIMMER ROW ─────────────────────────── */
const ShimmerRow = ({ cols }: { cols: number }) => (
  <tr>
    <td style={{ padding: "8px", border: "1px solid #E5DFD3" }}>
      <div className="mp-shimmer" style={{ height: 16, width: 60, marginBottom: 4 }} />
      <div className="mp-shimmer" style={{ height: 12, width: 80 }} />
    </td>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: "8px", border: "1px solid #E5DFD3", height: 96, verticalAlign: "top" }}>
        <div className="mp-shimmer" style={{ height: "100%", borderRadius: 8 }} />
      </td>
    ))}
  </tr>
);

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
const MainPage = () => {
  const navigate = useNavigate();
  const timetableRef = useRef<HTMLTableElement>(null);

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [timeslots, setTimeslots] = useState<TimeSlotResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const [loadingSelectors, setLoadingSelectors] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [deptData, levelData, groupData] = await Promise.all([getDepartments(), getLevels(), getGroups()]);
      if (deptData) setDepartments(deptData);
      if (levelData) setLevels(levelData);
      if (groupData) setGroups(groupData);
      setLoadingSelectors(false);
    };
    load();
  }, []);

  const filteredLevels = useMemo(
    () => (selectedDeptId ? levels.filter((l) => String(l.department_id) === selectedDeptId) : []),
    [levels, selectedDeptId]
  );
  const filteredGroups = useMemo(
    () => (selectedLevelId ? groups.filter((g) => String(g.level_id) === selectedLevelId) : []),
    [groups, selectedLevelId]
  );

  const handleDeptChange = (val: string) => {
    setSelectedDeptId(val); setSelectedLevelId(""); setSelectedGroupId(""); setSessions([]);
  };
  const handleLevelChange = (val: string) => {
    setSelectedLevelId(val); setSelectedGroupId(""); setSessions([]);
  };
  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    if (!groupId) { setSessions([]); setTimeslots([]); return; }
    setLoadingTimetable(true);
    const [timetableData, courseData, teacherData, roomData] = await Promise.all([
      getTimeSlotsByGroupAndLevel(groupId, selectedLevelId),
      courses.length ? Promise.resolve(courses) : getCourses(),
      teachers.length ? Promise.resolve(teachers) : getTeachers(),
      rooms.length ? Promise.resolve(rooms) : getRooms(),
    ]);
    if (timetableData) { setTimeslots(timetableData.timeslots); setSessions(timetableData.sessions as SessionResponse[]); }
    else { setTimeslots([]); setSessions([]); }
    if (Array.isArray(courseData)) setCourses(courseData);
    if (Array.isArray(teacherData)) setTeachers(teacherData);
    if (Array.isArray(roomData)) setRooms(roomData);
    setLoadingTimetable(false);
  };

  const courseMap  = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])),   [courses]);
  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t) => [t.id, t])),  [teachers]);
  const roomMap    = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])),     [rooms]);
  const timeslotMap= useMemo(() => Object.fromEntries(timeslots.map((t) => [t.id, t])), [timeslots]);

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

  /* ── CSV ── */
  const downloadCSV = useCallback(() => {
    const headers = ["Slot Index","Day","Start Time","End Time","Type","Course","Teacher","Room"];
    const rows = sessions.map((session) => {
      const slot = timeslotMap[session.timeslot_id || ""];
      return [slot?.slot_index ?? "", slot?.day ?? "", slot?.start_time ?? "", slot?.end_time ?? "",
        session.type, courseMap[session.course_id]?.name || "", teacherMap[session.teacher_id]?.name || "",
        roomMap[session.room_id || ""]?.code || ""];
    });
    rows.sort((a, b) => Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1])));
    const escape = (val: unknown) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csv = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timetable_${groups.find((g) => g.id === selectedGroupId)?.name ?? "export"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions, timeslotMap, courseMap, teacherMap, roomMap, groups, selectedGroupId]);

  /* ── PDF ── */
  const downloadPDF = useCallback(async () => {
    if (!timetableRef.current) return;
    const groupName = groups.find((g) => g.id === selectedGroupId)?.name ?? "timetable";
    const canvas = await html2canvas(timetableRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
    pdf.text(`Schedule — ${groupName}`, W / 2, 14, { align: "center" });
    const margin = 22, aw = W - 20, ah = H - margin - 10;
    const ratio = canvas.width / canvas.height;
    let iw = aw, ih = iw / ratio;
    if (ih > ah) { ih = ah; iw = ih * ratio; }
    pdf.addImage(imgData, "PNG", (W - iw) / 2, margin, iw, ih);
    pdf.save(`timetable_${groupName}.pdf`);
  }, [groups, selectedGroupId]);

  const selectedGroupName = groups.find((g) => g.id === selectedGroupId)?.name ?? "";

  /* ══════════════ RENDER ══════════════ */
  return (
    <div dir="ltr" style={{ minHeight: "100vh", background: "#F7F4EE", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{STYLES}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: "linear-gradient(135deg, #0B1526 0%, #122040 100%)",
        borderBottom: "1px solid rgba(201,146,47,0.25)",
        padding: "0",
      }}>
        {/* Gold top bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #C9922F 0%, #F0C060 50%, #C9922F 100%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "linear-gradient(135deg, #C9922F, #F0C060)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(201,146,47,0.4)",
              flexShrink: 0,
            }}>
              <IconCal />
            </div>
            <div>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 22, fontWeight: 700, color: "#F7F4EE", lineHeight: 1.1, letterSpacing: 0.3 }}>
                University  <span style={{ color: "#C9922F" }}>Laghouat</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(247,244,238,0.45)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>
                Academic Timetable
              </div>
            </div>
          </div>

          {/* Nav */}
          <button
            className="mp-btn"
            onClick={() => navigate("/login")}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,146,47,0.55)",
              color: "#C9922F",
              padding: "8px 22px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: 0.3,
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" }}>

        {/* ── HERO ── */}
        <div className="mp-fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 42, fontWeight: 700, color: "#0B1526", lineHeight: 1.15, marginBottom: 8 }}>
            View Your Schedule
          </div>
          <div className="mp-header-line" style={{
            height: 3,
            background: "linear-gradient(90deg, #C9922F, #F0C060)",
            borderRadius: 2,
            margin: "10px auto 16px",
          }} />
          <p style={{ color: "#7A6E5E", fontSize: 15, margin: 0 }}>
            Select your department, level, and group to instantly view the timetable.
          </p>
        </div>

        {/* ── SELECTORS ── */}
        <div
          className="mp-fade-up mp-delay-1"
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E5DFD3",
            boxShadow: "0 2px 24px rgba(11,21,38,0.06)",
            padding: "28px 28px 24px",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ width: 4, height: 20, background: "#C9922F", borderRadius: 2 }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: "#0B1526", letterSpacing: 0.2 }}>Filter by Group</span>
          </div>

          {loadingSelectors ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i}>
                  <div className="mp-shimmer" style={{ height: 14, width: 80, marginBottom: 10 }} />
                  <div className="mp-shimmer" style={{ height: 44, borderRadius: 10 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {/* Department */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#7A6E5E", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  <IconBuilding /> Department
                </label>
                <select
                  className="mp-select"
                  value={selectedDeptId}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", border: "1px solid #D8D0C4",
                    borderRadius: 10, fontSize: 14, background: "#FAFAF6", color: "#0B1526",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              {/* Level */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#7A6E5E", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  <IconStack /> Level
                </label>
                <select
                  className="mp-select"
                  value={selectedLevelId}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  disabled={!selectedDeptId}
                  style={{
                    width: "100%", padding: "11px 14px", border: "1px solid #D8D0C4",
                    borderRadius: 10, fontSize: 14, background: "#FAFAF6", color: "#0B1526",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <option value="">— Select Level —</option>
                  {filteredLevels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              {/* Group */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#7A6E5E", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  <IconUsers /> Group
                </label>
                <select
                  className="mp-select"
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  disabled={!selectedLevelId}
                  style={{
                    width: "100%", padding: "11px 14px", border: "1px solid #D8D0C4",
                    borderRadius: 10, fontSize: 14, background: "#FAFAF6", color: "#0B1526",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <option value="">— Select Group —</option>
                  {filteredGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── TIMETABLE SECTION ── */}
        {loadingTimetable && (
          <div className="mp-fade-up mp-delay-2" style={{
            background: "#FFFFFF", borderRadius: 16, border: "1px solid #E5DFD3",
            boxShadow: "0 2px 24px rgba(11,21,38,0.06)", padding: "28px",
          }}>
            {/* skeleton header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="mp-shimmer" style={{ height: 22, width: 220 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div className="mp-shimmer" style={{ height: 36, width: 130 }} />
                <div className="mp-shimmer" style={{ height: 36, width: 130 }} />
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Time", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", border: "1px solid #E5DFD3", background: "#F7F4EE" }}>
                        <div className="mp-shimmer" style={{ height: 14, width: 60, margin: "0 auto" }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4].map(i => <ShimmerRow key={i} cols={5} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loadingTimetable && selectedGroupId && sessions.length > 0 && (
          <div
            className="mp-fade-up mp-delay-2"
            style={{
              background: "#FFFFFF", borderRadius: 16, border: "1px solid #E5DFD3",
              boxShadow: "0 2px 24px rgba(11,21,38,0.06)", padding: "28px",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 22, fontWeight: 700, color: "#0B1526" }}>
                  {selectedGroupName} — Weekly Schedule
                </div>
                <div style={{ fontSize: 12, color: "#9A8E7E", marginTop: 2 }}>
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""} · {days.length} day{days.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="mp-btn"
                  onClick={downloadPDF}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", background: "#0B1526",
                    color: "#F7F4EE", border: "none", borderRadius: 9,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <IconPDF /> PDF
                </button>
                <button
                  className="mp-btn"
                  onClick={downloadCSV}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", background: "#C9922F",
                    color: "#fff", border: "none", borderRadius: 9,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <IconCSV /> CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                ref={timetableRef}
                style={{ minWidth: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: 110 }} />
                  {days.map((d) => <col key={d} style={{ width: 160 }} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{
                      padding: "10px 12px", border: "1px solid #E5DFD3",
                      background: "#F0EDE5", fontSize: 11, fontWeight: 700,
                      color: "#7A6E5E", textTransform: "uppercase", letterSpacing: 0.8,
                    }}>
                      Time Slot
                    </th>
                    {days.map((day) => (
                      <th key={day} style={{
                        padding: "10px 14px", border: "1px solid #E5DFD3",
                        background: "#F0EDE5", fontSize: 12, fontWeight: 700,
                        color: "#0B1526", letterSpacing: 0.3, textAlign: "center",
                      }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slotIndices.map((index, rowIdx) => {
                    const rowTime = timeslots.find((t) => t.slot_index === index);
                    return (
                      <tr
                        key={index}
                        className="mp-row-in"
                        style={{ animationDelay: `${0.05 * rowIdx}s` }}
                      >
                        {/* Time cell */}
                        <td style={{
                          padding: "10px 12px", border: "1px solid #E5DFD3",
                          background: "#F7F4EE", textAlign: "center", verticalAlign: "middle",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#0B1526", marginBottom: 3 }}>
                            Slot {index}
                          </div>
                          <div style={{ fontSize: 10, color: "#9A8E7E", whiteSpace: "nowrap" }}>
                            {rowTime?.start_time} – {rowTime?.end_time}
                          </div>
                        </td>

                        {/* Session cells */}
                        {days.map((day) => {
                          const session = sessionGrid[`${day}-${index}`];
                          const ts = session ? typeStyle(session.type) : null;
                          return (
                            <td key={`${day}-${index}`} style={{ border: "1px solid #E5DFD3", padding: 6, height: 100, verticalAlign: "top" }}>
                              {session && ts ? (
                                <div
                                  className="mp-cell-hover"
                                  style={{
                                    background: ts.bg,
                                    border: `1px solid ${ts.border}`,
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    cursor: "default",
                                  }}
                                >
                                  {/* Badge + course name */}
                                  <div>
                                    <span style={{
                                      display: "inline-block",
                                      fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                                      textTransform: "uppercase",
                                      color: ts.text, background: ts.badge,
                                      padding: "2px 7px", borderRadius: 4,
                                      marginBottom: 5,
                                    }}>
                                      {session.type}
                                    </span>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: ts.text, lineHeight: 1.35 }}>
                                      {courseMap[session.course_id]?.name || "—"}
                                    </div>
                                  </div>

                                  {/* Teacher + Room */}
                                  <div style={{
                                    marginTop: 8, paddingTop: 6,
                                    borderTop: `1px solid ${ts.border}`,
                                    fontSize: 10, color: ts.text, opacity: 0.8,
                                    display: "flex", flexDirection: "column", gap: 2,
                                  }}>
                                    <span>👤 {teacherMap[session.teacher_id]?.name || "—"}</span>
                                    <span style={{ fontWeight: 600 }}>📍 {roomMap[session.room_id || ""]?.code || "N/A"}</span>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  height: "100%", borderRadius: 8,
                                  background: "rgba(247,244,238,0.5)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 10, color: "#C9C0B0", fontStyle: "italic",
                                }}>
                                  —
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
            <div style={{ marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
              {Object.entries(TYPE_STYLES).map(([type, style]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: style.bg, border: `1.5px solid ${style.border}`,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#4A3F2E" }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE: no sessions ── */}
        {!loadingTimetable && selectedGroupId && sessions.length === 0 && (
          <div className="mp-fade-up mp-delay-2" style={{
            background: "#FFFFFF", borderRadius: 16, border: "1px solid #E5DFD3",
            padding: "60px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>🗓</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 22, color: "#0B1526", marginBottom: 6 }}>No sessions found</div>
            <p style={{ color: "#9A8E7E", fontSize: 14, margin: 0 }}>No timetable data is available for the selected group.</p>
          </div>
        )}

        {/* ── EMPTY STATE: nothing selected ── */}
        {!selectedGroupId && !loadingSelectors && (
          <div className="mp-fade-up mp-delay-3" style={{
            background: "#FFFFFF", borderRadius: 16, border: "1.5px dashed #D8D0C4",
            padding: "60px 24px", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, margin: "0 auto 16px",
              borderRadius: "50%", background: "#F0EDE5",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#C9922F" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#C9922F" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 22, color: "#0B1526", marginBottom: 6 }}>
              Ready to view your schedule?
            </div>
            <p style={{ color: "#9A8E7E", fontSize: 14, margin: 0 }}>
              Use the filters above to select your department, level, and group.
            </p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #E5DFD3",
        background: "#FAFAF6",
        padding: "18px 24px",
        textAlign: "center",
        fontSize: 12,
        color: "#AFA89A",
      }}>
        © {new Date().getFullYear()} Elameed Online · Academic Timetable System
      </footer>
    </div>
  );
};

export default MainPage;