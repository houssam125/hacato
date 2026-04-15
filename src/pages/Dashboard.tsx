import { AdminSocketProvider } from "@/Context/AdminSocketContext/AdminSocketProvider";

import { Outlet, NavLink, useNavigate } from "react-router-dom";

const navItems = [
 
  { label: "Building Management", path: "ManagementBuilding" },
  { label: "Departments", path: "ManagementDepartments" },
  { label: "Levels", path: "ManagementLevels" },
  { label: "Rooms", path: "ManagementRooms" },
  { label: "Teachers", path: "ManagementTeachers" },
  { label: "Groups", path: "ManagementGroups" },
  { label: "Courses", path: "ManagementCourses" },
  { label: "TimeSlots", path: "ManagementTimeSlots" },
  { label: "Sessions", path: "ManagementSessions" }
];

const Dashboard = () => {
  const navigate = useNavigate();
 

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100" dir="ltr">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="font-semibold text-gray-700">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg text-sm transition font-medium
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <AdminSocketProvider>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </AdminSocketProvider>

    </div>
  );
};

export default Dashboard;