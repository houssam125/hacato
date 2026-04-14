

import "./App.css";


import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Toaster } from "react-hot-toast";



import  MainPage  from "./pages/MainPage.tsx";
import  Dashboard  from "./pages/Dashboard.tsx";
import Login from "./pages/Login.tsx";
import ManagementAccounts from "./pages/DashboardPages/ManagementAccounts.tsx";
import ManagementProducts from "./pages/DashboardPages/ManagementProducts.tsx";
import AddProducts from "./pages/DashboardPages/ManagementProducts/AddProdects.tsx";
import DeleteProducts from "./pages/DashboardPages/ManagementProducts/DeleteProdects.tsx";
import UpdateProduct from "./pages/DashboardPages/ManagementProducts/UpdateProduct.tsx";
import { usePopup } from "./hooks/usePopup.ts";
import PopupContainer from "./Components/ui/PopupContainer.tsx";















// ====================== App الرئيسي ======================

function App() {


   const { popups , dismiss } = usePopup();


  return (
    <>
     
    <Router>
         {/* <LodingPage /> */}
        <Toaster position="top-right" reverseOrder={false} />
         <PopupContainer popups={popups} onDismiss={dismiss} />

          

          
    
        <Routes>

          {/* === الصفحات العامة === */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />

        
     

          {/* === صفحات الادمن === */}
          <Route path="/dashboard" element={<Dashboard />}>

         


            <Route path="ManagementAccounts" element={<ManagementAccounts  />} />

            <Route path="ManagementProducts" element={<ManagementProducts  />}>

                  <Route index element={<AddProducts />} />

                  <Route path="DeleteProducts" element={<DeleteProducts />} />

                  <Route path="UpdateProduct" element={<UpdateProduct   />} />
                      
            </Route>

        

          </Route>

        </Routes>
    
    </Router>
    

    </>
  );
}

export default App;
