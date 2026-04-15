import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainPage from "./pages/MainPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Login from "./pages/Login.tsx";
import ManagementAccounts from "./pages/DashboardPages/ManagementAccounts.tsx";
import ManagementProducts from "./pages/DashboardPages/ManagementProducts.tsx";
import AddProducts from "./pages/DashboardPages/ManagementProducts/AddProdects.tsx";
import DeleteProducts from "./pages/DashboardPages/ManagementProducts/DeleteProdects.tsx";
import UpdateProduct from "./pages/DashboardPages/ManagementProducts/UpdateProduct.tsx";
import ManagementDepartments from "./pages/DashboardPages/ManagementDepartments.tsx";
import ManagementLevels from "./pages/DashboardPages/ManagementLevels.tsx";
import ManagementRooms from "./pages/DashboardPages/ManagementRooms.tsx";
import ManagementTeachers from "./pages/DashboardPages/ManagementTeachers.tsx";
import ManagementGroups from "./pages/DashboardPages/ManagementGroups.tsx";
import ManagementCourses from "./pages/DashboardPages/ManagementCourses.tsx";
import ManagementTimeSlots from "./pages/DashboardPages/ManagementTimeSlots.tsx";
import ManagementSessions from "./pages/DashboardPages/ManagementSessions.tsx";
import Building from "./pages/DashboardPages/MangmetBuilding/Building.tsx";
import Teacher from "./pages/Teacher.tsx";

import { usePopup } from "./hooks/usePopup.ts";
import PopupContainer from "./Components/ui/PopupContainer.tsx";

// ✅ Import 404 page
import Error404 from "./pages/Error404";

const  App =() => {
  const { popups, dismiss } = usePopup();

  return (
    <>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <PopupContainer popups={popups} onDismiss={dismiss} />

        <Routes>
          {/* === Public pages === */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />

          {/* === Admin pages === */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="ManagementAccounts" element={<ManagementAccounts />} />

            <Route path="ManagementProducts" element={<ManagementProducts />}>
              <Route index element={<AddProducts />} />
              <Route path="DeleteProducts" element={<DeleteProducts />} />
              <Route path="UpdateProduct" element={<UpdateProduct />} />
            </Route>
            <Route path="ManagementBuilding" element={<Building />} />
            <Route path="ManagementDepartments" element={<ManagementDepartments />} />
            <Route path="ManagementLevels" element={<ManagementLevels />} />
            <Route path="ManagementRooms" element={<ManagementRooms />} />
            <Route path="ManagementTeachers" element={<ManagementTeachers />} />
            <Route path="ManagementGroups" element={<ManagementGroups />} />
            <Route path="ManagementCourses" element={<ManagementCourses />} />
            <Route path="ManagementTimeSlots" element={<ManagementTimeSlots />} />
            <Route path="ManagementSessions" element={<ManagementSessions />} />
          </Route>

          {/* === Teacher pages === */}
          <Route path="/teacher" element={<Teacher />}>
            <Route path="ManagementTimeSlots" element={<ManagementTimeSlots />} />
          </Route>

          {/* ✅ 404 must be last */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;