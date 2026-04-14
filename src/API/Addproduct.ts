// API/Products.ts

import { dashboardApi } from "@/lib/APItoken";


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
    const response = await dashboardApi.post("/articles", buildArticlesFormData(product), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("❌ خطأ في إضافة المنتج:", error);
    return false;
  }
};

// ============ Update Product ============

export const updateProduct = async (product: ArticlesRequest): Promise<boolean> => {
  try {
    const formData = buildArticlesFormData(product);
    formData.append("id", product.id.toString());

    const response = await dashboardApi.put("/products/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.status === 200;
  } catch (error) {
    console.error("❌ خطأ في تعديل المنتج:", error);
    return false;
  }
};

// ============ Delete Product ============

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const response = await dashboardApi.delete(`/products/delete/${id}`);
    return response.status === 200;
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error);
    return false;
  }
};