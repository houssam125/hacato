import { useEffect, useState } from "react";
import { getGroups, createGroup, updateGroup, type GroupRequest, type GroupResponse } from "@/API/Groups";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const ManagementGroups = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponse | null>(null);
  const [formData, setFormData] = useState<GroupRequest>({ name: "", level_id: "", headcount: 1 });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadGroups = async () => {
      const result = await getGroups();
      if (result) {
        setGroups(result);
      } else {
        show("Failed to load groups", "error");
      }
      setLoading(false);
    };

    loadGroups();
  }, []);

  const handleAddGroup = async () => {
    if (!formData.name || !formData.level_id || formData.headcount <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await createGroup(formData);
    if (result) {
      setGroups((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", level_id: "", headcount: 1 });
      show("Group added successfully", "success");
    } else {
      show("Failed to add group", "error");
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !formData.name || !formData.level_id || formData.headcount <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await updateGroup(editingGroup.id, formData);
    if (result) {
      setGroups((prev) => prev.map((item) => (item.id === editingGroup.id ? result : item)));
      setShowEditForm(false);
      setEditingGroup(null);
      setFormData({ name: "", level_id: "", headcount: 1 });
      show("Group updated successfully", "success");
    } else {
      show("Failed to update group", "error");
    }
  };

  const openEditForm = (group: GroupResponse) => {
    setEditingGroup(group);
    setFormData({ name: group.name, level_id: group.level_id, headcount: group.headcount });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", level_id: "", headcount: 1 });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingGroup(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading groups..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Group Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, create, and update groups.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add New Group
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headcount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.level_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.headcount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(group)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Group" : "Add New Group"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headcount</label>
                <input
                  type="number"
                  value={formData.headcount}
                  onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditGroup : handleAddGroup} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementGroups;
