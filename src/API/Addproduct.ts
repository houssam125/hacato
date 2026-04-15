// API/Products.ts
import API_BASE_URL from "@/API_BASE_URL";
import type { ApiResponse } from "@/types/API_Form";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  // Note: For multipart/form-data, we don't set Content-Type manually
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface ArticlesResponse {
  title: string;
  description: string;
  img: File;
}

export interface ArticlesRequest {
  id: number;
  title: string;
  img: string;
  description: string;
  author_id: number;
  created_at:string;
}

// ============ FormData Builder ============

const buildArticlesFormData = (product: ArticlesResponse | ArticlesRequest): FormData => {
  const formData = new FormData();
  formData.append("title",  product.title);
  formData.append("description", product.description);
  if (product.img instanceof File) {
    formData.append("img", product.img);
  } else {
    formData.append("img", product.img);
  }
  return formData;
};

// ============ Add Articles  ============

export const addProduct = async (product: ArticlesResponse): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: buildArticlesFormData(product),
    });
    const data: ApiResponse<any> = await res.json();
    if (data.success) return true;
    console.error("❌ Add product error:", data.message);
    return false;
  } catch (error) {
    console.error("❌ Add product error:", error);
    return false;
  }
};

// ============ Update Product ============

export const updateProduct = async (product: ArticlesRequest): Promise<boolean> => {
  try {
    const formData = buildArticlesFormData(product);
    formData.append("id", product.id.toString());

    const res = await fetch(`${API_BASE_URL}/products/update`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });
    const data: ApiResponse<any> = await res.json();
    return data.success;
  } catch (error) {
    console.error("❌ Update product error:", error);
    return false;
  }
};

// ============ Delete Product ============

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/delete/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    const data: ApiResponse<any> = await res.json();
    return data.success;
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return false;
  }
};