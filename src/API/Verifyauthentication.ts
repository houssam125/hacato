import API_BASE_URL from "@/API_BASE_URL";
import type { ITokenPayload } from "@/types/authentication";



export const verifyToken = async (token: string): Promise<ITokenPayload | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.warn("❌ Token غير صالح:", result.message);
      return null;
    }

    // النتيجة من السيرفر تحتوي على role فقط
    // لو أردت ترجع الـ payload كامل عدّل السيرفر
    return result.data as ITokenPayload;
  } catch (error) {
    console.error("❌ خطأ أثناء التحقق من التوكن:", error);
    return null;
  }
};

