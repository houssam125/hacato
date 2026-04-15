import { useEffect, useState } from "react";
import { getLevels, createLevel, updateLevel, type LevelRequest, type LevelResponse } from "@/API/Levels";
import { getDepartments, type DepartmentResponse } from "@/API/Departments"; // Import Department API
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding"; // Assuming Lodeing is a typo for Loading

const ManagementLevels = () => {
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]); // State for departments
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelResponse | null>(null);
  const [formData, setFormData] = useState<LevelRequest>({ name: "", department_id: "" });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [levelsResult, departmentsResult] = await Promise.all([
        getLevels(),
        getDepartments(),
      ]);

      if (levelsResult) {
        setLevels(levelsResult);
      } else {
        show("Failed to load levels", "error");
      }

      if (departmentsResult) {
        setDepartments(departmentsResult);
      } else {
        show("Failed to load departments", "error");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddLevel = async () => {
    if (!formData.name || !formData.department_id) {
      show("Please fill all fields", "warning");
      return;
    }

    const result = await createLevel(formData);
    if (result) {
      setLevels((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", department_id: "" });
      show("Level added successfully", "success");
    } else {
      show("Failed to add level", "error");
    }
  };

  const handleEditLevel = async () => {
    if (!editingLevel || !formData.name || !formData.department_id) {
      show("Please fill all fields", "warning");
      return;
    }

    const result = await updateLevel(editingLevel.id, formData);
    if (result) {
      setLevels((prev) => prev.map((item) => (item.id === editingLevel.id ? result : item)));
      setShowEditForm(false);
      setEditingLevel(null);
      setFormData({ name: "", department_id: "" });
      show("Level updated successfully", "success");
    } else {
      show("Failed to update level", "error");
    }
  };

  const openEditForm = (level: LevelResponse) => {
    setEditingLevel(level);
    setFormData({ name: level.name, department_id: level.department_id });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", department_id: "" });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingLevel(null);
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dep) => dep.id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  if (loading) {
    return <Lodeing textLodeing="Loading levels..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-3 sm:p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Level Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, create, and update levels.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add New Level
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDepartmentName(level.department_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(level)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Level" : "Add New Level"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter level name"
                />
              </div>
              {/* Department selection dropdown */}
              <div>
                <label htmlFor="department-select" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  id="department-select"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select a Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditLevel : handleAddLevel} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementLevels;
