import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout';
import InputWithIcon from '../../components/ui/InputWithIcon';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Jika email Anda terdaftar, instruksi untuk reset password telah dikirim.');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Lupa Password - DosenPlus</title>
      </Helmet>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-key text-white text-4xl"></i>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan email Anda untuk menerima link reset.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <InputWithIcon
            icon="fas fa-envelope"
            type="email"
            name="email"
            placeholder="Alamat Email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && <p className="text-sm text-green-600 text-center">{message}</p>}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-blue-400"
            >
              {isLoading ? 'Memproses...' : 'Kirim Link Reset'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            &larr; Kembali ke Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;