import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
      <div className="bg-white px-4 text-sm rounded rotate-12 absolute shadow-lg">
        Halaman Tidak Ditemukan
      </div>
      <p className="mt-4 text-gray-500">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-block px-8 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Kembali ke Halaman Login
      </Link>
    </div>
  );
}

export default NotFoundPage;