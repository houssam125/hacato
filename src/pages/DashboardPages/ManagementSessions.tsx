import { useEffect, useState } from "react";
import { getSessions, createSession, updateSession, type SessionRequest, type SessionResponse, type SessionType } from "@/API/Sessions";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const sessionTypes: SessionType[] = ["Lecture", "TD", "TP"];

const ManagementSessions = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(null);
  const [formData, setFormData] = useState<SessionRequest>({ course_id: "", type: "Lecture", teacher_id: "", group_id: "", room_id: "", timeslot_id: "" });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadSessions = async () => {
      const result = await getSessions();
      if (result) {
        setSessions(result);
      } else {
        show("Failed to load sessions", "error");
      }
      setLoading(false);
    };

    loadSessions();
  }, []);

  const handleAddSession = async () => {
    if (!formData.course_id || !formData.type || !formData.teacher_id || !formData.group_id) {
      show("Please fill the required fields", "warning");
      return;
    }

    const result = await createSession({
      ...formData,
      room_id: formData.room_id || null,
      timeslot_id: formData.timeslot_id || null,
    });

    if (result) {
      setSessions((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ course_id: "", type: "Lecture", teacher_id: "", group_id: "", room_id: "", timeslot_id: "" });
      show("Session added successfully", "success");
    } else {
      show("Failed to add session", "error");
    }
  };

  const handleEditSession = async () => {
    if (!editingSession || !formData.course_id || !formData.type || !formData.teacher_id || !formData.group_id) {
      show("Please fill the required fields", "warning");
      return;
    }

    const result = await updateSession(editingSession.id, {
      ...formData,
      room_id: formData.room_id || null,
      timeslot_id: formData.timeslot_id || null,
    });

    if (result) {
      setSessions((prev) => prev.map((item) => (item.id === editingSession.id ? result : item)));
      setShowEditForm(false);
      setEditingSession(null);
      setFormData({ course_id: "", type: "Lecture", teacher_id: "", group_id: "", room_id: "", timeslot_id: "" });
      show("Session updated successfully", "success");
    } else {
      show("Failed to update session", "error");
    }
  };

  const openEditForm = (session: SessionResponse) => {
    setEditingSession(session);
    setFormData({ course_id: session.course_id, type: session.type, teacher_id: session.teacher_id, group_id: session.group_id, room_id: session.room_id ?? "", timeslot_id: session.timeslot_id ?? "" });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ course_id: "", type: "Lecture", teacher_id: "", group_id: "", room_id: "", timeslot_id: "" });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingSession(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading sessions..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Session Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, create, and update sessions.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add New Session
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.course_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.teacher_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.group_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(session)} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Session" : "Add New Session"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                <input
                  type="text"
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sessionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                <input
                  type="text"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter teacher ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
                <input
                  type="text"
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room ID (optional)</label>
                <input
                  type="text"
                  value={formData.room_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeslot ID (optional)</label>
                <input
                  type="text"
                  value={formData.timeslot_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, timeslot_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter timeslot ID"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditSession : handleAddSession} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementSessions;
