import { useState } from "react";
import PopupContainer from "@/Components/ui/PopupContainer";
import { usePopup } from "@/hooks/usePopup";
import FileInput from "@/Components/ui/FileInput";
import { addProduct } from "@/API/Addproduct";

const AddProducts = () => {
  const { popups, show, dismiss } = usePopup();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!img) {
      show("Please select an image", "warning");
      return;
    }

    setLoading(true);
    const success = await addProduct({ title, description, img });
    setLoading(false);

    if (!success) {
      show("Failed to add product. Please try again.", "error");
      return;
    }

    show("Product added successfully!", "success");

    setTitle("");
    setDescription("");
    setImg(null);
  };

  return (
    <div className="min-h-full bg-gray-100 p-6" dir="ltr">

      <PopupContainer popups={popups} onDismiss={dismiss} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Add New Product
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a new product by filling the form below.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter product title"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Enter product description"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition resize-none"
            />
          </div>

          {/* Image */}
          <FileInput
            label="Product Image"
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
            {loading ? "Creating..." : "Add Product"}
          </button>

        </form>
      </div>

    </div>
  );
};

export default AddProducts;