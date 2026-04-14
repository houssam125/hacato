import { verifyToken } from "@/API/Verifyauthentication";
import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";


const navItems = [
  { label: "إدارة الحسابات",  path: "ManagementAccounts" },
  { label: "إدارة المنتجات", path: "ManagementProducts" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = await verifyToken(token);

      if (!payload) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (payload.role !== "admin") {
        navigate("/");
        return;
      }

      setChecking(false);

    };

    checkToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // لا تعرض شيئاً أثناء التحقق
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-gray-400">جارٍ التحقق...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">

      <aside className="w-60 bg-white border-l border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition text-right"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default Dashboard;