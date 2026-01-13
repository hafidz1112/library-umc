export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to Library System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your books and resources efficiently
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/about"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Learn More
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
