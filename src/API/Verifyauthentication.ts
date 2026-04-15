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
      console.warn("❌ Invalid token:", result.message);
      return null;
    }

    // The server result contains only role
    // If you want the full payload, modify the server
    return result.data as ITokenPayload;
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return null;
  }
};

