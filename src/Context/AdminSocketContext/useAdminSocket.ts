import { useContext } from "react";
import { AdminSocketContext } from "./AdminSocketContext";

export const useAdminSocket = () => {
  const context = useContext(AdminSocketContext);

  if (!context) {
    throw new Error("useAdminSocket must be used inside AdminSocketProvider");
  }

  return context;
};