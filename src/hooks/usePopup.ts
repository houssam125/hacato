// hooks/usePopup.ts
import { useState, useCallback } from "react";
import type { PopupMessage, PopupType } from "@/types/popup";

export const usePopup = () => {
  const [popups, setPopups] = useState<PopupMessage[]>([]);

  const show = useCallback((message: string, type: PopupType = "info") => {
    const id = Date.now();
    setPopups((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { popups, show, dismiss };
};