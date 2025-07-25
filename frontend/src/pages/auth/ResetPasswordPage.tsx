import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout';
import InputWithIcon from '../../components/ui/InputWithIcon';
import api from '../../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Token reset tidak ditemukan. Silakan coba lagi dari awal.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password?token=${token}`, { password });
      setMessage('Password berhasil diubah! Anda akan diarahkan ke halaman login.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Token tidak valid atau sudah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-shield-alt text-white text-4xl"></i>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Atur Ulang Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan password baru Anda di bawah ini.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputWithIcon
              icon="fas fa-lock"
              type="password"
              name="password"
              placeholder="Password Baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputWithIcon
              icon="fas fa-check-circle"
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password Baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="text-sm text-green-600 text-center">{message}</p>}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-blue-400"
            >
              {isLoading ? 'Memproses...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default ResetPasswordPage;