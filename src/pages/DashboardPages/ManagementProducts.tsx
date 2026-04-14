import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { label: "إضافة منتج",  path: "" },         // index route → AddProducts
  { label: "حذف منتج",   path: "DeleteProducts" },
  { label: "تعديل منتج", path: "UpdateProduct" },
];

const ManagementProducts = () => {
  return (
    <div className="ManagementProducts" dir="rtl">

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">إدارة المنتجات</h1>
        <p className="text-sm text-gray-500 mt-1">هذه صفحة إدارة المنتجات الخاصة بك.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ""}
            className={({ isActive }) =>
              `px-4 py-2 text-sm transition border-b-2 -mb-px ${
                isActive
                  ? "border-blue-600 text-blue-700 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />

    </div>
  );
};

export default ManagementProducts;