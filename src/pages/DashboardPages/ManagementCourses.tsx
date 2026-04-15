import React, { useEffect, useState } from "react";
import { getCourses, createCourse, updateCourse, type CourseRequest, type CourseResponse } from "@/API/Courses";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const ManagementCourses = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [formData, setFormData] = useState<CourseRequest>({ name: "", code: "", level_id: "", num_lectures: 1, num_td: 1, num_tp: 0 });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadCourses = async () => {
      const result = await getCourses();
      if (result) {
        setCourses(result);
      } else {
        show("Failed to load courses", "error");
      }
      setLoading(false);
    };

    loadCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!formData.name || !formData.code || !formData.level_id) {
      show("Please fill all required fields", "warning");
      return;
    }

    const payload = { ...formData, num_lectures: formData.num_lectures ?? 1, num_td: formData.num_td ?? 1, num_tp: formData.num_tp ?? 0 };
    const result = await createCourse(payload);
    if (result) {
      setCourses((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", code: "", level_id: "", num_lectures: 1, num_td: 1, num_tp: 0 });
      show("Course added successfully", "success");
    } else {
      show("Failed to add course", "error");
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !formData.name || !formData.code || !formData.level_id) {
      show("Please fill all required fields", "warning");
      return;
    }

    const payload = { ...formData, num_lectures: formData.num_lectures ?? 1, num_td: formData.num_td ?? 1, num_tp: formData.num_tp ?? 0 };
    const result = await updateCourse(editingCourse.id, payload);
    if (result) {
      setCourses((prev) => prev.map((item) => (item.id === editingCourse.id ? result : item)));
      setShowEditForm(false);
      setEditingCourse(null);
      setFormData({ name: "", code: "", level_id: "", num_lectures: 1, num_td: 1, num_tp: 0 });
      show("Course updated successfully", "success");
    } else {
      show("Failed to update course", "error");
    }
  };

  const openEditForm = (course: CourseResponse) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code, level_id: course.level_id, num_lectures: course.num_lectures, num_td: course.num_td, num_tp: course.num_tp });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", level_id: "", num_lectures: 1, num_td: 1, num_tp: 0 });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingCourse(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading courses..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-3 sm:p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Course Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, create, and update courses.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add New Course
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lectures</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.level_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.num_lectures}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(course)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Course" : "Add New Course"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level ID</label>
                <input
                  type="text"
                  value={formData.level_id}
                  onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter level ID"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lectures</label>
                  <input
                    type="number"
                    value={formData.num_lectures ?? 1}
                    onChange={(e) => setFormData({ ...formData, num_lectures: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TD Sessions</label>
                  <input
                    type="number"
                    value={formData.num_td ?? 1}
                    onChange={(e) => setFormData({ ...formData, num_td: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TP Sessions</label>
                  <input
                    type="number"
                    value={formData.num_tp ?? 0}
                    onChange={(e) => setFormData({ ...formData, num_tp: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditCourse : handleAddCourse} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementCourses;
