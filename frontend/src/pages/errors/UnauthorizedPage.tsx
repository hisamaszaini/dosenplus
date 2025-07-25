import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-red-600 tracking-widest mb-4">403</h1>
      <div className="bg-white px-4 text-sm rounded rotate-12 absolute shadow-lg">
        Akses Ditolak
      </div>
      <p className="mt-20 text-gray-500">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-block px-8 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Kembali
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
