export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  message?: string;
  data: T;
  error?: string;
}

export interface ApiResponseJWT<T> {
  success: boolean;
  count?: number;
  token: string;
  message?: string;
  data: T;
  error?: string;
}