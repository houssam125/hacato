

import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponseJWT } from "@/types/API_Form";





export interface LoginAPIResponse {
  username: string;
  email: string;
  role: string;
  id: number;
}



export interface LoginRequestPayload {
    email: string;
    password: string;
}


export const login = async ( payload: LoginRequestPayload ): Promise<LoginAPIResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("🔍 Login response:", response);

    if (!response.ok) {
      return null;
    }

    const data: ApiResponseJWT<LoginAPIResponse> = await response.json();

    if (!data.success || !data.token) {
      return null;
    }

    // Save token only
    localStorage.setItem("token", data.token);

    return data.data;
  } catch (error) {
    console.error("❌ Login error:", error);
    return null;
  }
};

