import { AdminSocketProvider } from "@/Context/AdminSocketContext/AdminSocketProvider";

import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100" dir="ltr">

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-semibold text-gray-700 text-sm">Admin Panel</span>
        </div>
        <div className="w-10" /> {/* spacer for centering */}
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
      >

        {/* Logo + close on mobile */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="font-semibold text-gray-700">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition md:hidden"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto mt-14 md:mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </AdminSocketProvider>

    </div>
  );
};

export default Dashboard;