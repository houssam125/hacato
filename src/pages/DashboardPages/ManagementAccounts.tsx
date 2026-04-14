import { Outlet } from "react-router-dom"


const ManagementAccounts = () =>{
    return(
        <div className="ManagementAccounts">
            <h1>إدارة الحسابات</h1>
            <p>هذه صفحة إدارة الحسابات الخاصة بك.</p>


           <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
            <Outlet />
          </main>
        </div>

    )
}


export default ManagementAccounts ;