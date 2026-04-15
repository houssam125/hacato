import { useEffect, useState } from "react";
import { getDepartments, createDepartment, updateDepartment, type DepartmentRequest, type DepartmentResponse } from "@/API/Departments";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const ManagementDepartments = () => {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [formData, setFormData] = useState<DepartmentRequest>({ name: "", code: "" });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadDepartments = async () => {
      const result = await getDepartments();
      if (Array.isArray(result)) { // Ensure the result is an array before setting state to avoid .map() crashes
        setDepartments(result);
      } else {
        show("Failed to load departments", "error");
      }
      setLoading(false);
    };

    loadDepartments();
  }, []);

  const handleAddDepartment = async () => {
    if (!formData.name || !formData.code) {
      show("Please fill all fields", "warning");
      return;
    }

    const result = await createDepartment(formData);
    if (result) {
      setDepartments((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", code: "" });
      show("Department added successfully", "success");
    } else {
      show("Failed to add department", "error");
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment || !formData.name || !formData.code) {
      show("Please fill all fields", "warning");
      return;
    }

    const result = await updateDepartment(editingDepartment.id, formData);
    if (result) {
      setDepartments((prev) => prev.map((item) => (item.id === editingDepartment.id ? result : item)));
      setShowEditForm(false);
      setEditingDepartment(null);
      setFormData({ name: "", code: "" });
      show("Department updated successfully", "success");
    } else {
      show("Failed to update department", "error");
    }
  };

  const openEditForm = (department: DepartmentResponse) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, code: department.code });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", code: "" });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingDepartment(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading departments..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-3 sm:p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Department Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, create, and update departments.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add New Department
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{department.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(department)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Department" : "Add New Department"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department code"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={showEditForm ? handleEditDepartment : handleAddDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDepartments;
