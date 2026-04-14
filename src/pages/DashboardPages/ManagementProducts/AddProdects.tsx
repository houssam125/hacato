import { useState } from "react";

import PopupContainer from "@/Components/ui/PopupContainer";
import { usePopup } from "@/hooks/usePopup";
import FileInput from "@/Components/ui/FileInput";
import { addProduct } from "@/API/Addproduct";

const AddProducts = () => {
  const { popups, show, dismiss } = usePopup();

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg]                 = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!img) {
      show("يرجى اختيار صورة", "warning");
      return;
    }

    setLoading(true);
    const success = await addProduct({ title, description, img });
    setLoading(false);

    if (!success) {
      show("فشل إضافة المقال، حاول مجدداً", "error");
      return;
    }

    show("تم إضافة المقال بنجاح", "success");
    setTitle("");
    setDescription("");
    setImg(null);       // ← يمسح الـ preview تلقائياً عبر useEffect في FileInput
  };

  return (
    <div dir="rtl">
      <PopupContainer popups={popups} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">إضافة مقال</h1>
        <p className="text-sm text-gray-500 mt-1">أضف مقالاً جديداً من هنا.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              العنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="عنوان المقال"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="وصف المقال"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400 transition resize-none"
            />
          </div>

          {/* Image — استخدام FileInput */}
          <FileInput
            label="صورة المقال"
            name="img"
            value={img}
            onChange={(file) => setImg(file)}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? "جارٍ الإضافة..." : "إضافة المقال"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProducts;