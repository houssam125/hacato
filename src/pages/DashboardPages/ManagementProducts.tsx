import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { label: "Add Product", path: "" },
  { label: "Delete Product", path: "DeleteProducts" },
  { label: "Update Product", path: "UpdateProduct" },
];

const ManagementProducts = () => {
  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Product Management
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create, update, and manage your products from this panel.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 mb-6">
        <div className="flex gap-2 overflow-x-auto">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ""}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition
                ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <Outlet />
      </div>

    </div>
  );
};

export default ManagementProducts;