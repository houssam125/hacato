const UpdateProduct = () => {
  return (
    <div className="min-h-full bg-gray-100 p-6" dir="ltr">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Update Product
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Edit and update existing product details.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500">
          Select a product to start editing.
        </p>
      </div>

    </div>
  );
};

export default UpdateProduct;