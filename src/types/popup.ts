// types/popup.ts
export type PopupType = "success" | "error" | "warning" | "info";

export interface PopupMessage {
  id: number;
  type: PopupType;
  message: string;
}