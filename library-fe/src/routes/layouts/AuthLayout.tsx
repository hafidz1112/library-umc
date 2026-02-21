import { Outlet, Link } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full">
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="flex flex-col items-center">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Library System
            </h1>
            <p className="text-gray-600">Manage your knowledge, effortlessly</p>
          </div>

          {/* Auth Form Container - This is where Login/auth/register will render */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
