import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#4E73DF] px-4 sm:px-6 lg:px-8">
      {children}
      <footer className="text-center py-6 text-white text-sm">
        <p>&copy; {new Date().getFullYear()} Sistem Penilaian Dosen (DosenPlus). Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;