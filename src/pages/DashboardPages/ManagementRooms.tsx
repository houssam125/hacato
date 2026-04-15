import { useEffect, useState } from "react";
import { getRooms, createRoom, updateRoom, type RoomRequest, type RoomResponse, type RoomType } from "@/API/Rooms";
import { usePopup } from "@/hooks/usePopup";
import PopupContainer from "@/Components/ui/PopupContainer";
import { Lodeing } from "@/Components/ui/Loding";

const roomTypes: RoomType[] = ["Amphitheatre", "Classroom", "Lab"];

const ManagementRooms = () => {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
  const [formData, setFormData] = useState<RoomRequest>({ code: "", building_id: "", type: "Classroom", capacity: 1, name: "" });
  const { popups, show, dismiss } = usePopup();

  useEffect(() => {
    const loadRooms = async () => {
      const result = await getRooms();
      if (result) {
        setRooms(result);
      } else {
        show("Failed to load rooms", "error");
      }
      setLoading(false);
    };

    loadRooms();
  }, []);

  const handleAddRoom = async () => {
    if (!formData.code || !formData.building_id || !formData.type || formData.capacity <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await createRoom(formData);
    if (result) {
      setRooms((prev) => [...prev, result]);
      setShowAddForm(false);
      setFormData({ code: "", building_id: "", type: "Classroom", capacity: 1, name: "" });
      show("Room added successfully", "success");
    } else {
      show("Failed to add room", "error");
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom || !formData.code || !formData.building_id || !formData.type || formData.capacity <= 0) {
      show("Please fill all fields correctly", "warning");
      return;
    }

    const result = await updateRoom(editingRoom.id, formData);
    if (result) {
      setRooms((prev) => prev.map((item) => (item.id === editingRoom.id ? result : item)));
      setShowEditForm(false);
      setEditingRoom(null);
      setFormData({ code: "", building_id: "", type: "Classroom", capacity: 1, name: "" });
      show("Room updated successfully", "success");
    } else {
      show("Failed to update room", "error");
    }
  };

  const openEditForm = (room: RoomResponse) => {
    setEditingRoom(room);
    setFormData({ code: room.code, building_id: room.building_id, type: room.type, capacity: room.capacity, name: room.name ?? "" });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({ code: "", building_id: "", type: "Classroom", capacity: 1, name: "" });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingRoom(null);
  };

  if (loading) {
    return <Lodeing textLodeing="Loading rooms..." />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Room Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, create, and update rooms.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add New Room
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.building_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditForm(room)} className="text-blue-600 hover:text-blue-900">
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
            <h2 className="text-xl font-bold mb-4">{showEditForm ? "Edit Room" : "Add New Room"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building ID</label>
                <input
                  type="text"
                  value={formData.building_id}
                  onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter building ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={formData.name ?? ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room name"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={showEditForm ? handleEditRoom : handleAddRoom} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {showEditForm ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementRooms;
