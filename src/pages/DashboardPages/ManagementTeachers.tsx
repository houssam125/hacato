import { useEffect, useState } from "react";
import { getTeachers, createTeacher, updateTeacher, type TeacherRequest, type TeacherResponse } from "@/API/Teachers";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const ManagementTeachers = () => {
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherResponse | null>(null);
  const [formData, setFormData] = useState<TeacherRequest>({ name: "", email: "", max_hours: 9, specializations: [], unavailable_slots: [] });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadTeachers = async () => {
      const result = await getTeachers();
      if (result) {
        setTeachers(result);
      } else {
        show("Failed to load teachers", "error");
      }
      setLoading(false);
    };

    loadTeachers();
  }, []);

  const handleAddTeacher = async () => {
    if (!formData.name || !formData.email) {
      show("Please fill name and email", "warning");
      return;
    }

    const payload = {
      ...formData,
      specializations: formData.specializations ?? [],
      unavailable_slots: formData.unavailable_slots ?? [],
    };

    const result = await createTeacher(payload);
    if (result) {
      setTeachers((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", email: "", max_hours: 9, specializations: [], unavailable_slots: [] });
      show("Teacher added successfully", "success");
    } else {
      show("Failed to add teacher", "error");
    }
  };

  const handleEditTeacher = async () => {
    if (!editingTeacher || !formData.name || !formData.email) {
      show("Please fill name and email", "warning");
      return;
    }

    const payload = {
      ...formData,
      specializations: formData.specializations ?? [],
      unavailable_slots: formData.unavailable_slots ?? [],
    };

    const result = await updateTeacher(editingTeacher.id, payload);
    if (result) {
      setTeachers((prev) => prev.map((item) => (item.id === editingTeacher.id ? result : item)));
      setShowEditForm(false);
      setEditingTeacher(null);
      setFormData({ name: "", email: "", max_hours: 9, specializations: [], unavailable_slots: [] });
      show("Teacher updated successfully", "success");
    } else {
      show("Failed to update teacher", "error");
    }
  };

  const openEditForm = (teacher: TeacherResponse) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher.name, email: teacher.email, max_hours: teacher.max_hours, specializations: teacher.specializations ?? [], unavailable_slots: teacher.unavailable_slots ?? [] });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", max_hours: 9, specializations: [], unavailable_slots: [] });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingTeacher(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading teachers..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-3 sm:p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Teacher Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, create, and update teachers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add New Teacher
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.max_hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(teacher)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Teacher" : "Add New Teacher"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter teacher name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter teacher email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours</label>
                <input
                  type="number"
                  value={formData.max_hours ?? 9}
                  onChange={(e) => setFormData({ ...formData, max_hours: parseFloat(e.target.value) || 9 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={(formData.specializations ?? []).join(", ")}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: Math, Physics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unavailable Slots (comma separated)</label>
                <input
                  type="text"
                  value={(formData.unavailable_slots ?? []).join(", ")}
                  onChange={(e) => setFormData({ ...formData, unavailable_slots: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: Monday-9, Friday-11"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditTeacher : handleAddTeacher} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementTeachers;
