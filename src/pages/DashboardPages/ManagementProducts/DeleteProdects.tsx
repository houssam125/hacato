const DeleteProducts = () => {
  return (
    <div className="min-h-full bg-gray-100 p-6" dir="ltr">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Delete Products
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Remove products permanently from your system.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500">
          No products selected yet.
        </p>
      </div>

    </div>
  );
};

export default DeleteProducts;