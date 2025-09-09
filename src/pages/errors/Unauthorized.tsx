import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6">
      <h1 className="text-6xl font-bold text-yellow-600">403</h1>
      <p className="mt-4 text-lg text-gray-700">
        You don’t have permission to access this page.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
