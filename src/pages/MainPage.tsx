const MainPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg text-center">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Our App 👋
        </h1>

        <p className="text-gray-600 mb-6">
          This is the main page of your application. Start exploring features and building something amazing 🚀
        </p>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Get Started
        </button>

      </div>

    </div>
  );
};

export default MainPage;