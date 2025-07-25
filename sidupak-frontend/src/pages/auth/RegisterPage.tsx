import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout';
import InputWithIcon from '../../components/ui/InputWithIcon';
import type { CreateUserDto } from '../../types/user.types';
import api from '../../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<CreateUserDto, 'role' | 'status'>>({
    email: '',
    username: '',
    name: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', formData);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat registrasi.';
      setError(errorMessage);
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
              <i className="fas fa-user-plus text-white text-4xl"></i>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Daftarkan diri untuk masuk ke SIDUPAK
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputWithIcon icon="fas fa-envelope" type="email" name="email" placeholder="Alamat Email" value={formData.email} onChange={handleChange} required />
            <InputWithIcon icon="fas fa-user" type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            <InputWithIcon icon="fas fa-address-card" type="text" name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required />
            <InputWithIcon icon="fas fa-lock" type="password" name="password" placeholder="Kata Sandi" value={formData.password} onChange={handleChange} required />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Tombol Submit */}
          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-blue-300">
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        </form>

        {/* Link ke Halaman Login */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login di sini
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;