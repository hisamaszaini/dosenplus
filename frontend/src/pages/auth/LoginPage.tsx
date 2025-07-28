import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';

import AuthLayout from '../../components/layout/AuthLayout';
import InputWithIcon from '../../components/ui/InputWithIcon';
import type { LoginDto } from '../../types/user.types';

function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginDto>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(credentials);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Login - DosenPlus</title>
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-graduation-cap text-white text-4xl"></i>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun DosenPlus Anda
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <InputWithIcon
              icon="fas fa-user"
              type="email"
              name="email"
              placeholder="Alamat Email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
            <InputWithIcon
              icon="fas fa-lock"
              type="password"
              name="password"
              placeholder="Kata Sandi"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Lupa password?
              </a>
            </div>
          </div>

          {/* Tombol Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-blue-400 cursor-pointer"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;