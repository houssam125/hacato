import { useState, useEffect } from "react";
import { usePopup } from "@/hooks/usePopup";
import { getBuildings, createBuilding, updateBuilding, deleteBuilding, type BuildingRequest, type BuildingResponse } from "@/API/Bulding";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const Building = () => {
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingResponse | null>(null);
  const [formData, setFormData] = useState<BuildingRequest>({
    name: "",
    location: "",
    number_of_rooms: 0,
  });

  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadBuildings = async () => {
      const result = await getBuildings();
      if (result) {
        setBuildings(result);
      } else {
        show("Failed to load buildings", "error");
      }
      setLoading(false);
    };
    loadBuildings();
  }, []);

  const handleAddBuilding = async () => {
    if (!formData.name || !formData.location || formData.number_of_rooms <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await createBuilding(formData);
    if (result) {
      setBuildings((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ name: "", location: "", number_of_rooms: 0 });
      show("Building added successfully", "success");
    } else {
      show("Failed to add building", "error");
    }
  };

  const handleEditBuilding = async () => {
    if (!editingBuilding || !formData.name || !formData.location || formData.number_of_rooms <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await updateBuilding(editingBuilding.id, formData);
    if (result) {
      setBuildings((prev) => prev.map((b) => (b.id === editingBuilding.id ? result : b)));
      setShowEditForm(false);
      setEditingBuilding(null);
      setFormData({ name: "", location: "", number_of_rooms: 0 });
      show("Building updated successfully", "success");
    } else {
      show("Failed to update building", "error");
    }
  };

  const handleDeleteBuilding = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this building?")) {
      const success = await deleteBuilding(id);
      if (success) {
        setBuildings((prev) => prev.filter((b) => b.id !== id));
        show("Building deleted successfully", "success");
      } else {
        show("Failed to delete building", "error");
      }
    }
  };
  const openEditForm = (building: BuildingResponse) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      location: building.location,
      number_of_rooms: building.number_of_rooms,
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", location: "", number_of_rooms: 0 });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingBuilding(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading buildings..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Building Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, and manage buildings from this panel.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add New Building
        </button>
      </div>

      {/* Buildings List */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buildings.map((building) => (
                <tr key={building.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{building.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{building.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{building.number_of_rooms}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(building)} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteBuilding(building.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {buildings.length === 0 && (
          <div className="text-center py-8 text-gray-500">No buildings yet.</div>
        )}
      </div>

      {/* Add Building Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Building</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter building name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                <input
                  type="number"
                  value={formData.number_of_rooms}
                  onChange={(e) => setFormData({ ...formData, number_of_rooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of rooms"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddBuilding} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Building Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Building</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter building name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                <input
                  type="number"
                  value={formData.number_of_rooms}
                  onChange={(e) => setFormData({ ...formData, number_of_rooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of rooms"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEditBuilding} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Building;