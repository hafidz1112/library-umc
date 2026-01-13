import { Link } from "react-router";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          About Library System
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 leading-relaxed mb-4">
            Our library management system helps you organize, track, and manage
            your book collection with ease.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Built with modern technologies including React, TypeScript, and Vite
            for the best performance and developer experience.
          </p>
        </div>
      </div>
    </div>
  );
}
