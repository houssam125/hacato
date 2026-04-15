import { Outlet } from "react-router-dom";

const ManagementAccounts = () => {
  return (
    <div className="min-h-full flex flex-col bg-gray-100 p-6" dir="ltr">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Account Management
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage users, roles, and account permissions from this section.
        </p>
      </div>

      {/* Content Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-hidden">

        <main className="h-full overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default ManagementAccounts;