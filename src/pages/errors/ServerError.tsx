import React from 'react';
import { Link } from 'react-router-dom';

export default function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
      <h1 className="text-6xl font-bold text-red-600">500</h1>
      <p className="mt-4 text-lg text-gray-700">
        Something went wrong on our side. Please try again later.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
